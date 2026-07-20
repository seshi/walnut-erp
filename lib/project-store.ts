/**
 * Module-level mutable store — stands in for the Prisma/PostgreSQL layer.
 * Edits persist across requests within the same process instance.
 * Swap every exported function for a Prisma call when the DB layer arrives.
 */
import type { Project, ProjectKpis, ProjectListItem } from "./types";
import { MOCK_PROJECTS, MOCK_USERS } from "./mock-data";
import { isOverdue } from "./utils";

// Deep-clone so mutations never touch the original const array
const store = new Map<string, Project>(
  MOCK_PROJECTS.map((p) => [p.id, structuredClone(p)])
);

const ACTIVE_STATUSES = new Set([
  "enquiry", "design", "approved", "in_production", "ready", "dispatched",
]);

// ─── Reads ────────────────────────────────────────────────────────────────────

export function getAllProjects(): Project[] {
  return Array.from(store.values());
}

export function findProject(id: string): Project | undefined {
  return store.get(id) ?? Array.from(store.values()).find((p) => p.projectCode === id);
}

export function getProjectListItems(): ProjectListItem[] {
  return getAllProjects().map((p) => ({
    id: p.id,
    projectCode: p.projectCode,
    customerName: p.customer.companyName,
    siteAddress: p.siteAddress,
    status: p.status,
    designerName: p.designer.name,
    roomCount: p.rooms.length,
    estimatedValue: p.estimatedValue,
    startDate: p.startDate,
    deliveryDate: p.deliveryDate,
    enquiryDate: p.enquiryDate,
    isOverdue: ACTIVE_STATUSES.has(p.status) && isOverdue(p.deliveryDate),
  }));
}

export function getProjectKpis(): ProjectKpis {
  const all    = getAllProjects();
  const active = all.filter((p) => ACTIVE_STATUSES.has(p.status));

  const byStatus = all.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enquiries = all.filter((p) => p.status === "enquiry").length;
  const converted = all.filter((p) =>
    ["approved", "in_production", "ready", "dispatched", "installed", "closed"].includes(p.status)
  ).length;

  return {
    totalActive: active.length,
    pipelineValue: active.reduce((sum, p) => sum + p.estimatedValue, 0),
    inProduction: all.filter((p) => p.status === "in_production").length,
    overdueCount: active.filter((p) => isOverdue(p.deliveryDate)).length,
    byStatus: byStatus as ProjectKpis["byStatus"],
    quoteConversionRate:
      enquiries + converted > 0
        ? Math.round((converted / (enquiries + converted)) * 100)
        : 0,
  };
}

// ─── Write ────────────────────────────────────────────────────────────────────

export interface UpdateProjectInput {
  customerCompanyName: string;
  customerContactName: string;
  customerEmail: string;
  customerPhone: string;
  siteAddress: string;
  designerId: string;
  productionManagerId: string; // "" = unassigned
  status: Project["status"];
  enquiryDate: string;
  startDate: string;
  deliveryDate: string;
  estimatedValue: number;
  internalNotes: string;
  rooms: string[]; // room names in order; IDs regenerated here
}

export type UpdateProjectError =
  | { code: "NOT_FOUND" }
  | { code: "VALIDATION"; fields: Record<string, string> };

export function updateProject(
  id: string,
  input: UpdateProjectInput
): { ok: true; project: Project } | { ok: false; error: UpdateProjectError } {
  const existing = findProject(id);
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

  const designer = MOCK_USERS.find((u) => u.id === input.designerId);
  if (!designer) return { ok: false, error: { code: "VALIDATION", fields: { designerId: "Invalid designer" } } };

  const pm = input.productionManagerId
    ? MOCK_USERS.find((u) => u.id === input.productionManagerId)
    : undefined;

  const updated: Project = {
    ...existing,
    customer: {
      ...existing.customer,
      companyName:  input.customerCompanyName.trim(),
      contactName:  input.customerContactName.trim(),
      email:        input.customerEmail.trim(),
      phone:        input.customerPhone.trim() || undefined,
    },
    siteAddress:       input.siteAddress.trim(),
    designer,
    productionManager: pm,
    status:            input.status,
    enquiryDate:       input.enquiryDate,
    startDate:         input.startDate,
    deliveryDate:      input.deliveryDate,
    estimatedValue:    input.estimatedValue,
    internalNotes:     input.internalNotes.trim() || undefined,
    rooms: input.rooms.map((name, i) => ({
      id:            `${existing.id}-room-${i + 1}`,
      projectId:     existing.id,
      name:          name.trim(),
      sequenceOrder: i + 1,
    })),
    updatedAt: new Date().toISOString(),
  };

  store.set(existing.id, updated);
  return { ok: true, project: updated };
}
