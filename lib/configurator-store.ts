import { db } from "./db";
import type { Cabinet, CreateCabinetInput } from "./types";

const INCLUDE = {
  room: true,
  carcassMaterial: { select: { id: true, code: true, name: true, thicknessMm: true } },
  backMaterial:    { select: { id: true, code: true, name: true, thicknessMm: true } },
  doorMaterial:    { select: { id: true, code: true, name: true, thicknessMm: true } },
  drawerFrontMaterial: { select: { id: true, code: true, name: true, thicknessMm: true } },
  hingeHardware:   { select: { id: true, code: true, name: true, unitCost: true } },
  runnerHardware:  { select: { id: true, code: true, name: true, unitCost: true } },
  handleHardware:  { select: { id: true, code: true, name: true, unitCost: true } },
} as const;

function mapCabinet(r: any): Cabinet {
  return {
    id: r.id,
    cabinetCode: r.cabinetCode,
    description: r.description ?? undefined,
    type: r.type,
    widthMm: r.widthMm,
    heightMm: r.heightMm,
    depthMm: r.depthMm,
    qty: r.qty,
    doorCount: r.doorCount,
    drawerCount: r.drawerCount,
    shelfCount: r.shelfCount,
    finishSpec: r.finishSpec ?? undefined,
    notes: r.notes ?? undefined,
    sequenceOrder: r.sequenceOrder,
    projectId: r.projectId,
    roomId: r.roomId ?? undefined,
    roomName: r.room?.name ?? undefined,
    carcassMaterialId: r.carcassMaterialId,
    carcassMaterialCode: r.carcassMaterial.code,
    carcassMaterialName: r.carcassMaterial.name,
    backMaterialId: r.backMaterialId ?? undefined,
    doorMaterialId: r.doorMaterialId ?? undefined,
    doorMaterialCode: r.doorMaterial?.code ?? undefined,
    drawerFrontMaterialId: r.drawerFrontMaterialId ?? undefined,
    hingeHardwareId: r.hingeHardwareId ?? undefined,
    runnerHardwareId: r.runnerHardwareId ?? undefined,
    handleHardwareId: r.handleHardwareId ?? undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function getProjectCabinets(projectId: string): Promise<Cabinet[]> {
  const rows = await db.cabinet.findMany({
    where: { projectId },
    include: INCLUDE,
    orderBy: [{ sequenceOrder: "asc" }, { cabinetCode: "asc" }],
  });
  return rows.map(mapCabinet);
}

export async function createCabinet(projectId: string, input: CreateCabinetInput): Promise<Cabinet> {
  const count = await db.cabinet.count({ where: { projectId } });
  const row = await db.cabinet.create({
    data: {
      projectId,
      sequenceOrder: count + 1,
      cabinetCode: input.cabinetCode,
      description: input.description ?? null,
      type: input.type as any,
      widthMm: input.widthMm,
      heightMm: input.heightMm,
      depthMm: input.depthMm,
      qty: input.qty,
      doorCount: input.doorCount,
      drawerCount: input.drawerCount,
      shelfCount: input.shelfCount,
      finishSpec: input.finishSpec ?? null,
      notes: input.notes ?? null,
      roomId: input.roomId ?? null,
      carcassMaterialId: input.carcassMaterialId,
      backMaterialId: input.backMaterialId ?? null,
      doorMaterialId: input.doorMaterialId ?? null,
      drawerFrontMaterialId: input.drawerFrontMaterialId ?? null,
      hingeHardwareId: input.hingeHardwareId ?? null,
      runnerHardwareId: input.runnerHardwareId ?? null,
      handleHardwareId: input.handleHardwareId ?? null,
    },
    include: INCLUDE,
  });
  return mapCabinet(row);
}

export async function updateCabinet(id: string, input: Partial<CreateCabinetInput>): Promise<Cabinet | null> {
  const existing = await db.cabinet.findUnique({ where: { id } });
  if (!existing) return null;
  const row = await db.cabinet.update({
    where: { id },
    data: {
      ...(input.cabinetCode !== undefined && { cabinetCode: input.cabinetCode }),
      ...(input.description  !== undefined && { description: input.description ?? null }),
      ...(input.type         !== undefined && { type: input.type as any }),
      ...(input.widthMm      !== undefined && { widthMm: input.widthMm }),
      ...(input.heightMm     !== undefined && { heightMm: input.heightMm }),
      ...(input.depthMm      !== undefined && { depthMm: input.depthMm }),
      ...(input.qty          !== undefined && { qty: input.qty }),
      ...(input.doorCount    !== undefined && { doorCount: input.doorCount }),
      ...(input.drawerCount  !== undefined && { drawerCount: input.drawerCount }),
      ...(input.shelfCount   !== undefined && { shelfCount: input.shelfCount }),
      ...(input.finishSpec   !== undefined && { finishSpec: input.finishSpec ?? null }),
      ...(input.notes        !== undefined && { notes: input.notes ?? null }),
      ...(input.roomId       !== undefined && { roomId: input.roomId ?? null }),
      ...(input.carcassMaterialId    !== undefined && { carcassMaterialId: input.carcassMaterialId }),
      ...(input.backMaterialId       !== undefined && { backMaterialId: input.backMaterialId ?? null }),
      ...(input.doorMaterialId       !== undefined && { doorMaterialId: input.doorMaterialId ?? null }),
      ...(input.drawerFrontMaterialId !== undefined && { drawerFrontMaterialId: input.drawerFrontMaterialId ?? null }),
      ...(input.hingeHardwareId      !== undefined && { hingeHardwareId: input.hingeHardwareId ?? null }),
      ...(input.runnerHardwareId     !== undefined && { runnerHardwareId: input.runnerHardwareId ?? null }),
      ...(input.handleHardwareId     !== undefined && { handleHardwareId: input.handleHardwareId ?? null }),
    },
    include: INCLUDE,
  });
  return mapCabinet(row);
}

export async function deleteCabinet(id: string): Promise<boolean> {
  const existing = await db.cabinet.findUnique({ where: { id } });
  if (!existing) return false;
  await db.cabinet.delete({ where: { id } });
  return true;
}

// Returns cabinets with full material/hardware data for cut list generation
export async function getCabinetsForGeneration(projectId: string) {
  return db.cabinet.findMany({
    where: { projectId },
    include: {
      carcassMaterial: true,
      backMaterial:    true,
      doorMaterial:    true,
      drawerFrontMaterial: true,
      hingeHardware:   true,
      runnerHardware:  true,
      handleHardware:  true,
    },
    orderBy: [{ sequenceOrder: "asc" }, { cabinetCode: "asc" }],
  });
}
