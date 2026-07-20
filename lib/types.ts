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

// ─── Configurator ─────────────────────────────────────────────────────────────

export type CabinetType =
  | "base_cabinet"
  | "wall_cabinet"
  | "tall_unit"
  | "drawer_unit"
  | "open_shelf";

export interface Cabinet {
  id: string;
  cabinetCode: string;
  description?: string;
  type: CabinetType;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  qty: number;
  doorCount: number;
  drawerCount: number;
  shelfCount: number;
  finishSpec?: string;
  notes?: string;
  sequenceOrder: number;
  projectId: string;
  roomId?: string;
  roomName?: string;
  carcassMaterialId: string;
  carcassMaterialCode: string;
  carcassMaterialName: string;
  backMaterialId?: string;
  doorMaterialId?: string;
  doorMaterialCode?: string;
  drawerFrontMaterialId?: string;
  hingeHardwareId?: string;
  runnerHardwareId?: string;
  handleHardwareId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCabinetInput {
  cabinetCode: string;
  description?: string;
  type: CabinetType;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  qty: number;
  doorCount: number;
  drawerCount: number;
  shelfCount: number;
  finishSpec?: string;
  notes?: string;
  roomId?: string;
  carcassMaterialId: string;
  backMaterialId?: string;
  doorMaterialId?: string;
  drawerFrontMaterialId?: string;
  hingeHardwareId?: string;
  runnerHardwareId?: string;
  handleHardwareId?: string;
}

// ─── Production ───────────────────────────────────────────────────────────────

export type ProductionStageName =
  | "cutting"
  | "edge_banding"
  | "drilling_cnc"
  | "assembly"
  | "finishing"
  | "quality_check"
  | "dispatch";

export type StageStatus = "pending" | "in_progress" | "completed" | "blocked";

export interface ProductionStage {
  id: string;
  stage: ProductionStageName;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  projectId: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Costing ──────────────────────────────────────────────────────────────────

export interface MaterialCostLine {
  materialId: string;
  materialCode: string;
  materialName: string;
  totalAreaMm2: number;
  sheetsRequired: number;
  costPerSheet: number;
  wastagePct: number;
  subtotal: number;
}

export interface HardwareCostLine {
  hardwareId: string;
  hardwareCode: string;
  hardwareName: string;
  qty: number;
  unitCost: number;
  subtotal: number;
}

export interface CostEstimate {
  projectId: string;
  projectCode: string;
  versionNo: number;
  materialLines: MaterialCostLine[];
  hardwareLines: HardwareCostLine[];
  materialTotal: number;
  hardwareTotal: number;
  labourEstimate: number;
  grandTotal: number;
  generatedAt: string;
}
