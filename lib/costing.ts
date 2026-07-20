import type { CostEstimate, MaterialCostLine, HardwareCostLine } from "./types";

interface CutItem { materialId: string; materialCode: string; materialName: string; lengthMm: number; widthMm: number; qty: number; }
interface MatInfo { id: string; code: string; name: string; sheetLengthMm: number; sheetWidthMm: number; costPerSheet: number; wastagePct: number; }
interface CabinetBom { doorCount: number; drawerCount: number; qty: number; hingeHardware: HwInfo | null; runnerHardware: HwInfo | null; handleHardware: HwInfo | null; }
interface HwInfo { id: string; code: string; name: string; unitCost: number; }

export function computeCostEstimate(
  projectId: string,
  projectCode: string,
  versionNo: number,
  items: CutItem[],
  materials: MatInfo[],
  cabinets: CabinetBom[],
  labourRatePerCabinet = 3500
): CostEstimate {
  const matMap = new Map(materials.map((m) => [m.id, m]));

  // ── Material cost ────────────────────────────────────────────────────────────
  const areaByMat = new Map<string, number>();
  for (const item of items) {
    const area = item.lengthMm * item.widthMm * item.qty;
    areaByMat.set(item.materialId, (areaByMat.get(item.materialId) ?? 0) + area);
  }

  const materialLines: MaterialCostLine[] = [];
  areaByMat.forEach((totalAreaMm2, matId) => {
    const m = matMap.get(matId);
    if (!m) return;
    const sheetArea = m.sheetLengthMm > 0 && m.sheetWidthMm > 0
      ? m.sheetLengthMm * m.sheetWidthMm
      : 1_000_000; // fallback for linear/metre goods
    const grossArea = totalAreaMm2 * (1 + m.wastagePct / 100);
    const sheetsRequired = Math.ceil(grossArea / sheetArea);
    const subtotal = sheetsRequired * m.costPerSheet;
    materialLines.push({
      materialId: matId,
      materialCode: m.code,
      materialName: m.name,
      totalAreaMm2,
      sheetsRequired,
      costPerSheet: m.costPerSheet,
      wastagePct: m.wastagePct,
      subtotal,
    });
  });

  materialLines.sort((a, b) => b.subtotal - a.subtotal);

  // ── Hardware BOM ─────────────────────────────────────────────────────────────
  const hwQty = new Map<string, { info: HwInfo; qty: number }>();

  function addHw(hw: HwInfo | null, qty: number) {
    if (!hw || qty <= 0) return;
    const existing = hwQty.get(hw.id);
    if (existing) existing.qty += qty;
    else hwQty.set(hw.id, { info: hw, qty });
  }

  for (const cab of cabinets) {
    const units = cab.qty;
    // Hinges: 2 per door per unit
    addHw(cab.hingeHardware, cab.doorCount * 2 * units);
    // Runners: 1 pair per drawer per unit
    addHw(cab.runnerHardware, cab.drawerCount * units);
    // Handles: 1 per door + 1 per drawer per unit
    addHw(cab.handleHardware, (cab.doorCount + cab.drawerCount) * units);
  }

  const hardwareLines: HardwareCostLine[] = [];
  hwQty.forEach(({ info, qty }) => {
    hardwareLines.push({
      hardwareId: info.id,
      hardwareCode: info.code,
      hardwareName: info.name,
      qty,
      unitCost: info.unitCost,
      subtotal: qty * info.unitCost,
    });
  });
  hardwareLines.sort((a, b) => b.subtotal - a.subtotal);

  const totalCabinets = cabinets.reduce((s, c) => s + c.qty, 0);
  const materialTotal = materialLines.reduce((s, l) => s + l.subtotal, 0);
  const hardwareTotal = hardwareLines.reduce((s, l) => s + l.subtotal, 0);
  const labourEstimate = totalCabinets * labourRatePerCabinet;

  return {
    projectId, projectCode, versionNo,
    materialLines, hardwareLines,
    materialTotal, hardwareTotal,
    labourEstimate,
    grandTotal: materialTotal + hardwareTotal + labourEstimate,
    generatedAt: new Date().toISOString(),
  };
}
