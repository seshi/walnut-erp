import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { Project, ProjectKpis, ProjectListItem, ProjectStatus, User, Customer, Room } from "./types";
import { isOverdue } from "./utils";

// ─── Prisma include shape (reused across queries) ─────────────────────────────

const PROJECT_INCLUDE = {
  customer: true,
  designer: true,
  productionManager: true,
  rooms: { orderBy: { sequenceOrder: "asc" as const } },
} satisfies Prisma.ProjectInclude;

type PrismaProject = Prisma.ProjectGetPayload<{ include: typeof PROJECT_INCLUDE }>;

// ─── Mappers: Prisma → app types ──────────────────────────────────────────────

function toDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function mapUser(u: { id: string; name: string; email: string; role: string; avatarInitials: string }): User {
  return { id: u.id, name: u.name, email: u.email, role: u.role as User["role"], avatarInitials: u.avatarInitials };
}

function mapCustomer(c: { id: string; companyName: string; contactName: string; email: string; phone: string | null }): Customer {
  return { id: c.id, companyName: c.companyName, contactName: c.contactName, email: c.email, phone: c.phone ?? undefined };
}

function mapRoom(r: { id: string; projectId: string; name: string; sequenceOrder: number }): Room {
  return { id: r.id, projectId: r.projectId, name: r.name, sequenceOrder: r.sequenceOrder };
}

function mapProject(p: PrismaProject): Project {
  return {
    id:               p.id,
    projectCode:      p.projectCode,
    customer:         mapCustomer(p.customer),
    siteAddress:      p.siteAddress,
    designer:         mapUser(p.designer),
    productionManager: p.productionManager ? mapUser(p.productionManager) : undefined,
    status:           p.status as ProjectStatus,
    enquiryDate:      toDate(p.enquiryDate),
    startDate:        toDate(p.startDate),
    deliveryDate:     toDate(p.deliveryDate),
    estimatedValue:   p.estimatedValue,
    internalNotes:    p.internalNotes ?? undefined,
    rooms:            p.rooms.map(mapRoom),
    createdAt:        p.createdAt.toISOString(),
    updatedAt:        p.updatedAt.toISOString(),
    createdBy:        p.createdById,
  };
}

// ─── Reads ────────────────────────────────────────────────────────────────────

const ACTIVE_STATUSES = ["enquiry", "design", "approved", "in_production", "ready", "dispatched"];

export async function getAllProjects(): Promise<Project[]> {
  const rows = await db.project.findMany({
    include: PROJECT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProject);
}

export async function findProject(id: string): Promise<Project | undefined> {
  const row = await db.project.findFirst({
    where: { OR: [{ id }, { projectCode: id }] },
    include: PROJECT_INCLUDE,
  });
  return row ? mapProject(row) : undefined;
}

export async function getProjectListItems(): Promise<ProjectListItem[]> {
  const projects = await getAllProjects();
  return projects.map((p) => ({
    id:             p.id,
    projectCode:    p.projectCode,
    customerName:   p.customer.companyName,
    siteAddress:    p.siteAddress,
    status:         p.status,
    designerName:   p.designer.name,
    roomCount:      p.rooms.length,
    estimatedValue: p.estimatedValue,
    startDate:      p.startDate,
    deliveryDate:   p.deliveryDate,
    enquiryDate:    p.enquiryDate,
    isOverdue:      ACTIVE_STATUSES.includes(p.status) && isOverdue(p.deliveryDate),
  }));
}

export async function getProjectKpis(): Promise<ProjectKpis> {
  const all    = await getAllProjects();
  const active = all.filter((p) => ACTIVE_STATUSES.includes(p.status));

  const byStatus = all.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enquiries = all.filter((p) => p.status === "enquiry").length;
  const converted = all.filter((p) =>
    ["approved", "in_production", "ready", "dispatched", "installed", "closed"].includes(p.status)
  ).length;

  return {
    totalActive:          active.length,
    pipelineValue:        active.reduce((sum, p) => sum + p.estimatedValue, 0),
    inProduction:         all.filter((p) => p.status === "in_production").length,
    overdueCount:         active.filter((p) => isOverdue(p.deliveryDate)).length,
    byStatus:             byStatus as ProjectKpis["byStatus"],
    quoteConversionRate:  enquiries + converted > 0
      ? Math.round((converted / (enquiries + converted)) * 100)
      : 0,
  };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface UpdateProjectInput {
  customerCompanyName:  string;
  customerContactName:  string;
  customerEmail:        string;
  customerPhone:        string;
  siteAddress:          string;
  designerId:           string;
  productionManagerId:  string;
  status:               ProjectStatus;
  enquiryDate:          string;
  startDate:            string;
  deliveryDate:         string;
  estimatedValue:       number;
  internalNotes:        string;
  rooms:                string[];
}

export type UpdateProjectError =
  | { code: "NOT_FOUND" }
  | { code: "VALIDATION"; fields: Record<string, string> };

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<{ ok: true; project: Project } | { ok: false; error: UpdateProjectError }> {
  const existing = await db.project.findFirst({
    where: { OR: [{ id }, { projectCode: id }] },
    select: { id: true, customerId: true },
  });

  if (!existing) return { ok: false, error: { code: "NOT_FOUND" } };

  // Validate
  const fields: Record<string, string> = {};
  if (!input.customerCompanyName.trim()) fields.customerCompanyName = "Required";
  if (!input.customerContactName.trim()) fields.customerContactName = "Required";
  if (!input.customerEmail.trim())       fields.customerEmail       = "Required";
  if (!input.siteAddress.trim())         fields.siteAddress         = "Required";
  if (!input.designerId)                 fields.designerId          = "Required";
  if (!input.enquiryDate)                fields.enquiryDate         = "Required";
  if (!input.startDate)                  fields.startDate           = "Required";
  if (!input.deliveryDate)               fields.deliveryDate        = "Required";
  if (input.estimatedValue <= 0)         fields.estimatedValue      = "Must be greater than 0";
  if (input.rooms.length === 0)          fields.rooms               = "At least one room is required";
  if (input.startDate && input.deliveryDate && input.deliveryDate <= input.startDate)
    fields.deliveryDate = "Must be after production start date";

  if (Object.keys(fields).length > 0)
    return { ok: false, error: { code: "VALIDATION", fields } };

  const designerExists = await db.user.findUnique({ where: { id: input.designerId }, select: { id: true } });
  if (!designerExists)
    return { ok: false, error: { code: "VALIDATION", fields: { designerId: "Invalid designer" } } };

  // Run as a transaction: update customer, replace rooms, update project
  const updated = await db.$transaction(async (tx) => {
    await tx.customer.update({
      where: { id: existing.customerId },
      data: {
        companyName: input.customerCompanyName.trim(),
        contactName: input.customerContactName.trim(),
        email:       input.customerEmail.trim(),
        phone:       input.customerPhone.trim() || null,
      },
    });

    await tx.room.deleteMany({ where: { projectId: existing.id } });

    return tx.project.update({
      where: { id: existing.id },
      data: {
        siteAddress:         input.siteAddress.trim(),
        designerId:          input.designerId,
        productionManagerId: input.productionManagerId || null,
        status:              input.status,
        enquiryDate:         new Date(input.enquiryDate),
        startDate:           new Date(input.startDate),
        deliveryDate:        new Date(input.deliveryDate),
        estimatedValue:      input.estimatedValue,
        internalNotes:       input.internalNotes.trim() || null,
        rooms: {
          create: input.rooms.map((name, i) => ({ name: name.trim(), sequenceOrder: i + 1 })),
        },
      },
      include: PROJECT_INCLUDE,
    });
  });

  return { ok: true, project: mapProject(updated) };
}
