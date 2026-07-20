import type { CutListItem, GrainDirection } from "./types";

// Shape expected from a Prisma Cabinet with includes
export interface CabinetForGeneration {
  cabinetCode: string;
  type: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  qty: number;
  doorCount: number;
  drawerCount: number;
  shelfCount: number;
  finishSpec: string | null;
  carcassMaterial: MatRef;
  backMaterial: MatRef | null;
  doorMaterial: MatRef | null;
  drawerFrontMaterial: MatRef | null;
}

interface MatRef {
  id: string;
  code: string;
  name: string;
  thicknessMm: number;
  grainDirection: string;
}

type PartDef = Omit<CutListItem, "id" | "materialCode" | "materialName"> & {
  materialCode: string;
  materialName: string;
};

function part(
  code: string, seq: string, description: string,
  L: number, W: number, T: number, qty: number,
  mat: MatRef, grain: GrainDirection, edge: string,
  finish?: string, cabinetRef?: string
): PartDef {
  return {
    partCode: `${code}-${seq}`,
    description,
    lengthMm: Math.max(1, Math.round(L)),
    widthMm:  Math.max(1, Math.round(W)),
    thicknessMm: T,
    qty,
    materialId:   mat.id,
    materialCode: mat.code,
    materialName: mat.name,
    grainDir: grain,
    edgeBanding: edge,
    finish,
    cabinetRef: cabinetRef ?? code,
  };
}

function generateBaseCabinetParts(c: CabinetForGeneration): PartDef[] {
  const { cabinetCode: code, widthMm: W, heightMm: H, depthMm: D, qty: Q } = c;
  const cm = c.carcassMaterial;
  const T  = cm.thicknessMm;
  const bm = c.backMaterial ?? cm;
  const BT = bm.thicknessMm;
  const parts: PartDef[] = [];

  // Sides ×2
  parts.push(part(code, "S", `${code} Side Panel`, H - T, D - T, T, 2 * Q, cm, "length", "L"));
  // Bottom
  parts.push(part(code, "B", `${code} Bottom Panel`, W - 2 * T, D - T, T, Q, cm, "width", ""));
  // Top rail
  parts.push(part(code, "TR", `${code} Top Rail`, W - 2 * T, 100, T, Q, cm, "width", "T"));
  // Back
  parts.push(part(code, "BP", `${code} Back Panel`, H - T, W - 2 * T, BT, Q, bm, "none", ""));

  if (c.doorCount > 0 && c.doorMaterial) {
    const dm   = c.doorMaterial;
    const DT   = dm.thicknessMm;
    const dH   = H - 4;
    const dW   = Math.floor((W - 6 - 3 * Math.max(0, c.doorCount - 1)) / c.doorCount);
    parts.push(part(code, "DR", `${code} Door`, dH, dW, DT, c.doorCount * Q, dm, "none", "LRTB", c.finishSpec ?? undefined));
  }

  return parts;
}

function generateWallCabinetParts(c: CabinetForGeneration): PartDef[] {
  const { cabinetCode: code, widthMm: W, heightMm: H, depthMm: D, qty: Q } = c;
  const cm = c.carcassMaterial;
  const T  = cm.thicknessMm;
  const bm = c.backMaterial ?? cm;
  const BT = bm.thicknessMm;
  const parts: PartDef[] = [];

  // Top + Bottom
  parts.push(part(code, "TP", `${code} Top Panel`,    W - 2 * T, D, T, Q, cm, "width", ""));
  parts.push(part(code, "BO", `${code} Bottom Panel`, W - 2 * T, D, T, Q, cm, "width", "B"));
  // Sides ×2
  parts.push(part(code, "S", `${code} Side Panel`, H, D - T, T, 2 * Q, cm, "length", "L"));
  // Back
  parts.push(part(code, "BP", `${code} Back Panel`, H, W - 2 * T, BT, Q, bm, "none", ""));
  // Adjustable shelves
  if (c.shelfCount > 0)
    parts.push(part(code, "SH", `${code} Shelf`, W - 2 * T - 2, D - T - 20, T, c.shelfCount * Q, cm, "width", "F"));

  if (c.doorCount > 0 && c.doorMaterial) {
    const dm  = c.doorMaterial;
    const DT  = dm.thicknessMm;
    const dH  = H - 4;
    const dW  = Math.floor((W - 6 - 3 * Math.max(0, c.doorCount - 1)) / c.doorCount);
    parts.push(part(code, "DR", `${code} Door`, dH, dW, DT, c.doorCount * Q, dm, "none", "LRTB", c.finishSpec ?? undefined));
  }

  return parts;
}

function generateTallUnitParts(c: CabinetForGeneration): PartDef[] {
  const { cabinetCode: code, widthMm: W, heightMm: H, depthMm: D, qty: Q } = c;
  const cm = c.carcassMaterial;
  const T  = cm.thicknessMm;
  const bm = c.backMaterial ?? cm;
  const BT = bm.thicknessMm;
  const parts: PartDef[] = [];

  parts.push(part(code, "TP", `${code} Top Panel`,    W - 2 * T, D, T, Q, cm, "width", ""));
  parts.push(part(code, "BO", `${code} Bottom Panel`, W - 2 * T, D, T, Q, cm, "width", ""));
  parts.push(part(code, "S",  `${code} Side Panel`,   H,         D - T, T, 2 * Q, cm, "length", "L"));
  parts.push(part(code, "BP", `${code} Back Panel`,   H, W - 2 * T, BT, Q, bm, "none", ""));

  if (c.shelfCount > 0)
    parts.push(part(code, "SH", `${code} Fixed Shelf`, W - 2 * T, D - T, T, c.shelfCount * Q, cm, "width", "F"));

  if (c.doorCount > 0 && c.doorMaterial) {
    const dm  = c.doorMaterial;
    const DT  = dm.thicknessMm;
    const dH  = Math.floor((H - 4 - 3 * Math.max(0, Math.ceil(c.doorCount / 2) - 1)) / Math.ceil(c.doorCount / 2));
    const dW  = Math.floor((W - 6 - 3 * Math.max(0, (c.doorCount % 2 === 0 ? c.doorCount / 2 : 1) - 1)) / (c.doorCount % 2 === 0 ? c.doorCount / 2 : 1));
    parts.push(part(code, "DR", `${code} Door`, dH, dW, DT, c.doorCount * Q, dm, "none", "LRTB", c.finishSpec ?? undefined));
  }

  return parts;
}

function generateDrawerUnitParts(c: CabinetForGeneration): PartDef[] {
  const { cabinetCode: code, widthMm: W, heightMm: H, depthMm: D, qty: Q } = c;
  const cm = c.carcassMaterial;
  const T  = cm.thicknessMm;
  const bm = c.backMaterial ?? cm;
  const BT = bm.thicknessMm;
  const dc = Math.max(1, c.drawerCount);
  const parts: PartDef[] = [];

  // Carcass box (same as base)
  parts.push(part(code, "S",  `${code} Side Panel`,  H - T, D - T, T, 2 * Q, cm, "length", "L"));
  parts.push(part(code, "B",  `${code} Bottom Panel`,W - 2 * T, D - T, T, Q, cm, "width", ""));
  parts.push(part(code, "TR", `${code} Top Rail`,    W - 2 * T, 100, T, Q, cm, "width", "T"));
  parts.push(part(code, "BP", `${code} Back Panel`,  H - T, W - 2 * T, BT, Q, bm, "none", ""));

  // Drawer boxes
  const boxH   = Math.min(160, Math.floor((H - T - 4 * (dc + 1)) / dc));
  const boxInt = W - 2 * T - 26; // internal width (runner clearance)
  const boxD   = D - T - 30;     // internal depth

  // Drawer box parts (×dc drawers per cabinet unit, ×Q units)
  parts.push(part(code, "DBF",  `${code} Drawer Front/Back`, boxInt, boxH, T, dc * 2 * Q, cm, "width", "T"));
  parts.push(part(code, "DBS",  `${code} Drawer Side`,       boxD,   boxH, T, dc * 2 * Q, cm, "length", "T"));
  parts.push(part(code, "DBBP", `${code} Drawer Base`,       boxInt, boxD, BT, dc * Q, bm, "none", ""));

  // Drawer fronts (visible)
  const fm = c.drawerFrontMaterial ?? c.doorMaterial ?? cm;
  const FT = fm.thicknessMm;
  const fH = Math.floor((H - T - 3 * (dc + 1)) / dc);
  const fW = W - 6;
  parts.push(part(code, "DF", `${code} Drawer Front`, fH, fW, FT, dc * Q, fm, "none", "LRTB", c.finishSpec ?? undefined));

  return parts;
}

function generateOpenShelfParts(c: CabinetForGeneration): PartDef[] {
  const { cabinetCode: code, widthMm: W, heightMm: H, depthMm: D, qty: Q } = c;
  const cm = c.carcassMaterial;
  const T  = cm.thicknessMm;
  const parts: PartDef[] = [];

  parts.push(part(code, "TP", `${code} Top Panel`,    W - 2 * T, D, T, Q, cm, "width", "F"));
  parts.push(part(code, "BO", `${code} Bottom Panel`, W - 2 * T, D, T, Q, cm, "width", "F"));
  parts.push(part(code, "S",  `${code} Side Panel`,   H,         D, T, 2 * Q, cm, "length", "LF"));

  if (c.shelfCount > 0)
    parts.push(part(code, "SH", `${code} Shelf`, W - 2 * T - 2, D - 20, T, c.shelfCount * Q, cm, "width", "F"));

  return parts;
}

// ─── Public entry point ────────────────────────────────────────────────────────

export function generateCutListFromCabinets(
  projectCode: string,
  cabinets: CabinetForGeneration[]
): Omit<CutListItem, "id">[] {
  const allParts: PartDef[] = [];

  for (const cabinet of cabinets) {
    switch (cabinet.type) {
      case "base_cabinet":  allParts.push(...generateBaseCabinetParts(cabinet));  break;
      case "wall_cabinet":  allParts.push(...generateWallCabinetParts(cabinet));  break;
      case "tall_unit":     allParts.push(...generateTallUnitParts(cabinet));     break;
      case "drawer_unit":   allParts.push(...generateDrawerUnitParts(cabinet));   break;
      case "open_shelf":    allParts.push(...generateOpenShelfParts(cabinet));    break;
    }
  }

  // Assign sequential project-scoped part codes
  return allParts.map((p, i) => ({
    ...p,
    partCode: `${projectCode}-P${String(i + 1).padStart(3, "0")}`,
  }));
}
