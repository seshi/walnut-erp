import { db } from "./db";
import type { Material, MaterialListItem, MaterialKpis, MaterialCategory, GrainDirection } from "./types";

export interface UpdateMaterialInput {
  name: string;
  supplier: string;
  costPerSheet: number;
  wastagePct: number;
  grainDirection: GrainDirection;
  edgeBandingCodes: string[];
  minOrderQty: number;
  leadTimeDays: number;
  active: boolean;
}

function toDate(d: Date): string {
  return d.toISOString();
}

function mapMaterial(r: {
  id: string; code: string; name: string; category: string; supplier: string;
  sheetLengthMm: number; sheetWidthMm: number; thicknessMm: number;
  costPerSheet: number; wastagePct: number; grainDirection: string;
  edgeBandingCodes: string[]; active: boolean; minOrderQty: number;
  leadTimeDays: number; createdAt: Date; updatedAt: Date;
}): Material {
  return {
    id: r.id, code: r.code, name: r.name,
    category: r.category as MaterialCategory, supplier: r.supplier,
    sheetLengthMm: r.sheetLengthMm, sheetWidthMm: r.sheetWidthMm, thicknessMm: r.thicknessMm,
    costPerSheet: r.costPerSheet, wastagePct: r.wastagePct,
    grainDirection: r.grainDirection as Material["grainDirection"],
    edgeBandingCodes: r.edgeBandingCodes, active: r.active,
    minOrderQty: r.minOrderQty, leadTimeDays: r.leadTimeDays,
    createdAt: toDate(r.createdAt), updatedAt: toDate(r.updatedAt),
  };
}

export async function getAllMaterials(): Promise<Material[]> {
  const rows = await db.material.findMany({ orderBy: { code: "asc" } });
  return rows.map(mapMaterial);
}

export async function getMaterialListItems(category?: string, activeOnly?: boolean): Promise<MaterialListItem[]> {
  const rows = await db.material.findMany({
    where: {
      ...(category ? { category: category as any } : {}),
      ...(activeOnly ? { active: true } : {}),
    },
    orderBy: { code: "asc" },
  });
  return rows.map((r) => ({
    id: r.id, code: r.code, name: r.name,
    category: r.category as MaterialCategory, supplier: r.supplier,
    sheetLengthMm: r.sheetLengthMm, sheetWidthMm: r.sheetWidthMm, thicknessMm: r.thicknessMm,
    costPerSheet: r.costPerSheet, wastagePct: r.wastagePct,
    grainDirection: r.grainDirection as Material["grainDirection"],
    active: r.active, leadTimeDays: r.leadTimeDays,
  }));
}

export async function findMaterial(id: string): Promise<Material | null> {
  const r = await db.material.findUnique({ where: { id } });
  return r ? mapMaterial(r) : null;
}

export async function updateMaterial(
  id: string,
  input: UpdateMaterialInput
): Promise<{ ok: true; material: Material } | { ok: false; error: { code: string } }> {
  const existing = await db.material.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: { code: "NOT_FOUND" } };
  const updated = await db.material.update({
    where: { id },
    data: {
      name: input.name,
      supplier: input.supplier,
      costPerSheet: input.costPerSheet,
      wastagePct: input.wastagePct,
      grainDirection: input.grainDirection,
      edgeBandingCodes: input.edgeBandingCodes,
      minOrderQty: input.minOrderQty,
      leadTimeDays: input.leadTimeDays,
      active: input.active,
    },
  });
  return { ok: true, material: mapMaterial(updated) };
}

export async function getMaterialKpis(): Promise<MaterialKpis> {
  const rows = await db.material.findMany({ select: { category: true, active: true, costPerSheet: true } });
  const total = rows.length;
  const active = rows.filter((r) => r.active).length;
  const costs = rows.filter((r) => r.active).map((r) => r.costPerSheet);
  const avgCostPerSheet = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
  const byCategory: Partial<Record<MaterialCategory, number>> = {};
  for (const r of rows) {
    const cat = r.category as MaterialCategory;
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }
  return { total, active, discontinued: total - active, avgCostPerSheet, byCategory };
}
