import { db } from "./db";
import type { CutListVersion, CutListSummary, GrainDirection } from "./types";

export async function getProjectCutList(projectId: string): Promise<CutListVersion | null> {
  const version = await db.cutListVersion.findFirst({
    where: { projectId, status: { not: "superseded" } },
    orderBy: { versionNo: "desc" },
    include: {
      generator: { select: { name: true } },
      project:   { select: { projectCode: true } },
      items: {
        include: { material: { select: { code: true, name: true } } },
        orderBy: [{ cabinetRef: "asc" }, { partCode: "asc" }],
      },
    },
  });

  if (!version) return null;

  return {
    id: version.id,
    projectId: version.projectId,
    projectCode: version.project.projectCode,
    versionNo: version.versionNo,
    status: version.status as CutListVersion["status"],
    generatedAt: version.generatedAt.toISOString(),
    generatorName: version.generator.name,
    items: version.items.map((item) => ({
      id: item.id,
      partCode: item.partCode,
      description: item.description,
      lengthMm: item.lengthMm,
      widthMm: item.widthMm,
      thicknessMm: item.thicknessMm,
      qty: item.qty,
      materialId: item.materialId,
      materialCode: item.material.code,
      materialName: item.material.name,
      grainDir: item.grainDir as GrainDirection,
      edgeBanding: item.edgeBanding,
      finish: item.finish ?? undefined,
      cabinetRef: item.cabinetRef ?? undefined,
      notes: item.notes ?? undefined,
    })),
  };
}

export function summariseCutList(version: CutListVersion): CutListSummary {
  const totalParts = version.items.length;
  const totalQty = version.items.reduce((s, i) => s + i.qty, 0);
  const uniqueMaterials = new Set(version.items.map((i) => i.materialId)).size;
  // Simple sheet estimate: group by material, sum area of parts, divide by standard 2440×1220 sheet
  const STANDARD_SHEET_AREA = 2440 * 1220;
  let estimatedSheets = 0;
  const byMaterial = new Map<string, number>();
  for (const item of version.items) {
    const area = item.lengthMm * item.widthMm * item.qty;
    byMaterial.set(item.materialId, (byMaterial.get(item.materialId) ?? 0) + area);
  }
  byMaterial.forEach((area) => {
    estimatedSheets += Math.ceil(area / STANDARD_SHEET_AREA);
  });
  return { totalParts, totalQty, uniqueMaterials, estimatedSheets };
}
