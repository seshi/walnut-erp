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

// ─── Core entities (mirrors DB schema — ready for Prisma ORM layer) ────────────

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
  id: string;                    // UUID v7 in production
  projectCode: string;           // WS-YYYY-NNNN
  customer: Customer;
  siteAddress: string;
  designer: User;
  productionManager?: User;
  status: ProjectStatus;
  startDate: string;             // ISO 8601
  deliveryDate: string;          // ISO 8601
  enquiryDate: string;
  rooms: Room[];
  estimatedValue: number;        // GBP pence stored as integer in production
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;             // user id
}

// ─── API response shapes ───────────────────────────────────────────────────────

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

export interface ProjectsListResponse {
  data: ProjectListItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ProjectDetailResponse {
  data: Project;
}

// ─── Dashboard KPI types ───────────────────────────────────────────────────────

export interface ProjectKpis {
  totalActive: number;
  pipelineValue: number;
  inProduction: number;
  overdueCount: number;
  byStatus: Record<ProjectStatus, number>;
  quoteConversionRate: number;   // percentage 0–100
}
