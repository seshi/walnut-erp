// ─── Enums ────────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | "enquiry"
  | "design"
  | "approved"
  | "in_production"
  | "ready"
  | "dispatched"
  | "installed"
  | "closed";

export type UserRole =
  | "admin"
  | "director"
  | "designer"
  | "production_manager"
  | "shop_floor"
  | "procurement"
  | "viewer";

export type MaterialCategory =
  | "board"
  | "veneer"
  | "solid_timber"
  | "laminate"
  | "glass"
  | "edge_banding";

export type GrainDirection = "none" | "length" | "width";

export type HardwareCategory =
  | "hinges"
  | "drawer_runners"
  | "handles_knobs"
  | "legs"
  | "shelf_pins"
  | "soft_close"
  | "lighting"
  | "other";

export type CutListStatus = "draft" | "approved" | "superseded";

// ─── Core entities ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
}

export interface Room {
  id: string;
  projectId: string;
  name: string;
  sequenceOrder: number;
}

export interface Project {
  id: string;
  projectCode: string;
  customer: Customer;
  siteAddress: string;
  designer: User;
  productionManager?: User;
  status: ProjectStatus;
  startDate: string;
  deliveryDate: string;
  enquiryDate: string;
  rooms: Room[];
  estimatedValue: number;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  supplier: string;
  sheetLengthMm: number;
  sheetWidthMm: number;
  thicknessMm: number;
  costPerSheet: number;
  wastagePct: number;
  grainDirection: GrainDirection;
  edgeBandingCodes: string[];
  active: boolean;
  minOrderQty: number;
  leadTimeDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface Hardware {
  id: string;
  code: string;
  name: string;
  category: HardwareCategory;
  supplier: string;
  unitCost: number;
  uom: string;
  finish?: string;
  loadRating?: string;
  minStockLevel: number;
  reorderQty: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CutListItem {
  id: string;
  partCode: string;
  description: string;
  lengthMm: number;
  widthMm: number;
  thicknessMm: number;
  qty: number;
  materialId: string;
  materialCode: string;
  materialName: string;
  grainDir: GrainDirection;
  edgeBanding: string;
  finish?: string;
  cabinetRef?: string;
  notes?: string;
}

export interface CutListVersion {
  id: string;
  projectId: string;
  projectCode: string;
  versionNo: number;
  status: CutListStatus;
  generatedAt: string;
  generatorName: string;
  items: CutListItem[];
}

// ─── List / KPI projections ────────────────────────────────────────────────────

export interface ProjectListItem {
  id: string;
  projectCode: string;
  customerName: string;
  siteAddress: string;
  status: ProjectStatus;
  designerName: string;
  roomCount: number;
  estimatedValue: number;
  startDate: string;
  deliveryDate: string;
  enquiryDate: string;
  isOverdue: boolean;
}

export interface MaterialListItem {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  supplier: string;
  sheetLengthMm: number;
  sheetWidthMm: number;
  thicknessMm: number;
  costPerSheet: number;
  wastagePct: number;
  grainDirection: GrainDirection;
  active: boolean;
  leadTimeDays: number;
}

export interface HardwareListItem {
  id: string;
  code: string;
  name: string;
  category: HardwareCategory;
  supplier: string;
  unitCost: number;
  uom: string;
  finish?: string;
  loadRating?: string;
  minStockLevel: number;
  reorderQty: number;
  active: boolean;
}

export interface MaterialKpis {
  total: number;
  active: number;
  discontinued: number;
  avgCostPerSheet: number;
  byCategory: Partial<Record<MaterialCategory, number>>;
}

export interface HardwareKpis {
  total: number;
  active: number;
  avgUnitCost: number;
  byCategory: Partial<Record<HardwareCategory, number>>;
}

export interface CutListSummary {
  totalParts: number;
  totalQty: number;
  uniqueMaterials: number;
  estimatedSheets: number;
}

// ─── API response shapes ───────────────────────────────────────────────────────

export interface ProjectsListResponse {
  data: ProjectListItem[];
  meta: { total: number; page: number; pageSize: number };
}

export interface ProjectDetailResponse {
  data: Project;
}

export interface ProjectKpis {
  totalActive: number;
  pipelineValue: number;
  inProduction: number;
  overdueCount: number;
  byStatus: Record<ProjectStatus, number>;
  quoteConversionRate: number;
}
