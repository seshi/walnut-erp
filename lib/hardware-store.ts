import { db } from "./db";
import type { Hardware, HardwareListItem, HardwareKpis, HardwareCategory } from "./types";

function toDate(d: Date): string {
  return d.toISOString();
}

function mapHardware(r: {
  id: string; code: string; name: string; category: string; supplier: string;
  unitCost: number; uom: string; finish: string | null; loadRating: string | null;
  minStockLevel: number; reorderQty: number; active: boolean; createdAt: Date; updatedAt: Date;
}): Hardware {
  return {
    id: r.id, code: r.code, name: r.name,
    category: r.category as HardwareCategory, supplier: r.supplier,
    unitCost: r.unitCost, uom: r.uom,
    finish: r.finish ?? undefined, loadRating: r.loadRating ?? undefined,
    minStockLevel: r.minStockLevel, reorderQty: r.reorderQty, active: r.active,
    createdAt: toDate(r.createdAt), updatedAt: toDate(r.updatedAt),
  };
}

export async function getAllHardware(): Promise<Hardware[]> {
  const rows = await db.hardware.findMany({ orderBy: { code: "asc" } });
  return rows.map(mapHardware);
}

export async function getHardwareListItems(category?: string, activeOnly?: boolean): Promise<HardwareListItem[]> {
  const rows = await db.hardware.findMany({
    where: {
      ...(category ? { category: category as any } : {}),
      ...(activeOnly ? { active: true } : {}),
    },
    orderBy: { code: "asc" },
  });
  return rows.map((r) => ({
    id: r.id, code: r.code, name: r.name,
    category: r.category as HardwareCategory, supplier: r.supplier,
    unitCost: r.unitCost, uom: r.uom, finish: r.finish ?? undefined,
    loadRating: r.loadRating ?? undefined,
    minStockLevel: r.minStockLevel, reorderQty: r.reorderQty, active: r.active,
  }));
}

export async function findHardware(id: string): Promise<Hardware | null> {
  const r = await db.hardware.findUnique({ where: { id } });
  return r ? mapHardware(r) : null;
}

export async function getHardwareKpis(): Promise<HardwareKpis> {
  const rows = await db.hardware.findMany({ select: { category: true, active: true, unitCost: true } });
  const total = rows.length;
  const active = rows.filter((r) => r.active).length;
  const costs = rows.filter((r) => r.active).map((r) => r.unitCost);
  const avgUnitCost = costs.length ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;
  const byCategory: Partial<Record<HardwareCategory, number>> = {};
  for (const r of rows) {
    const cat = r.category as HardwareCategory;
    byCategory[cat] = (byCategory[cat] ?? 0) + 1;
  }
  return { total, active, avgUnitCost, byCategory };
}
