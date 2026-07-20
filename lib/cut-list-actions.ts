import { db } from "./db";
import { getCabinetsForGeneration } from "./configurator-store";
import { generateCutListFromCabinets } from "./cut-list-generator";

export async function generateAndSaveCutList(
  projectId: string,
  generatedBy: string
): Promise<{ versionNo: number; totalParts: number } | { error: string }> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, projectCode: true },
  });
  if (!project) return { error: "Project not found." };

  const cabinets = await getCabinetsForGeneration(projectId);
  if (cabinets.length === 0) return { error: "Add cabinets in the Configurator first." };

  const parts = generateCutListFromCabinets(project.projectCode, cabinets);

  await db.cutListVersion.updateMany({
    where: { projectId, status: { not: "superseded" } },
    data: { status: "superseded" },
  });

  const last = await db.cutListVersion.findFirst({
    where: { projectId },
    orderBy: { versionNo: "desc" },
    select: { versionNo: true },
  });
  const versionNo = (last?.versionNo ?? 0) + 1;

  const version = await db.cutListVersion.create({
    data: {
      projectId,
      versionNo,
      status: "draft",
      generatedBy,
      items: {
        create: parts.map((p) => ({
          partCode: p.partCode,
          description: p.description,
          lengthMm: p.lengthMm,
          widthMm: p.widthMm,
          thicknessMm: p.thicknessMm,
          qty: p.qty,
          materialId: p.materialId,
          grainDir: p.grainDir,
          edgeBanding: p.edgeBanding,
          finish: p.finish ?? null,
          cabinetRef: p.cabinetRef ?? null,
          notes: p.notes ?? null,
        })),
      },
    },
    select: { versionNo: true, _count: { select: { items: true } } },
  });

  return { versionNo: version.versionNo, totalParts: version._count.items };
}
