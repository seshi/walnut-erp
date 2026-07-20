import { db } from "./db";
import type { ProductionStage, ProductionStageName, StageStatus } from "./types";

const ALL_STAGES: ProductionStageName[] = [
  "cutting", "edge_banding", "drilling_cnc",
  "assembly", "finishing", "quality_check", "dispatch",
];

function mapStage(r: any): ProductionStage {
  return {
    id: r.id,
    stage: r.stage,
    status: r.status,
    startedAt: r.startedAt?.toISOString(),
    completedAt: r.completedAt?.toISOString(),
    notes: r.notes ?? undefined,
    projectId: r.projectId,
    assignedToId: r.assignedToId ?? undefined,
    assignedToName: r.assignedTo?.name ?? undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getProductionStages(projectId: string): Promise<ProductionStage[]> {
  // Ensure all 7 stages exist for this project
  await db.$transaction(
    ALL_STAGES.map((stage) =>
      db.productionStage.upsert({
        where: { projectId_stage: { projectId, stage } },
        create: { projectId, stage },
        update: {},
      })
    )
  );

  const rows = await db.productionStage.findMany({
    where: { projectId },
    include: { assignedTo: { select: { name: true } } },
  });

  // Return in canonical order
  return ALL_STAGES.map((s) => mapStage(rows.find((r) => r.stage === s)!));
}

export async function updateStage(
  projectId: string,
  stage: ProductionStageName,
  status: StageStatus,
  notes?: string
): Promise<ProductionStage> {
  const now = new Date();
  const row = await db.productionStage.upsert({
    where: { projectId_stage: { projectId, stage } },
    create: { projectId, stage, status, notes: notes ?? null,
      startedAt:   status === "in_progress" ? now : null,
      completedAt: status === "completed"   ? now : null,
    },
    update: {
      status,
      notes: notes !== undefined ? notes : undefined,
      startedAt:   status === "in_progress" ? now : status === "pending" ? null : undefined,
      completedAt: status === "completed"   ? now : null,
    },
    include: { assignedTo: { select: { name: true } } },
  });
  return mapStage(row);
}
