import type { Project, User, Customer, ProjectKpis, ProjectListItem } from "./types";
import { isOverdue } from "./utils";

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: "usr_01", name: "Sarah Chen",      email: "sarah.chen@walnutstudios.co.uk",   role: "designer",            avatarInitials: "SC" },
  { id: "usr_02", name: "Tom Hartley",     email: "tom.hartley@walnutstudios.co.uk",  role: "designer",            avatarInitials: "TH" },
  { id: "usr_03", name: "Marcus Webb",     email: "marcus.webb@walnutstudios.co.uk",  role: "production_manager",  avatarInitials: "MW" },
  { id: "usr_04", name: "Priya Nair",      email: "priya.nair@walnutstudios.co.uk",   role: "designer",            avatarInitials: "PN" },
  { id: "usr_05", name: "James Albright",  email: "james.a@walnutstudios.co.uk",      role: "director",            avatarInitials: "JA" },
];

// ─── Customers ────────────────────────────────────────────────────────────────

export const MOCK_CUSTOMERS: Customer[] = [
  { id: "cust_01", companyName: "The Morrison Family",    contactName: "James Morrison",   email: "james@morrisonfamily.co.uk",   phone: "07700 900142" },
  { id: "cust_02", companyName: "Kingswood Developments", contactName: "Rachel Kingswood", email: "rachel@kingswood-dev.co.uk",   phone: "020 7946 0302" },
  { id: "cust_03", companyName: "The Patel Residence",    contactName: "Anita Patel",      email: "anita.patel@gmail.com",        phone: "07700 900781" },
  { id: "cust_04", companyName: "Hartfield Interiors",    contactName: "George Hartfield", email: "george@hartfield-int.co.uk",   phone: "01483 900234" },
  { id: "cust_05", companyName: "Elmwood Apartments",     contactName: "Diane Forsyth",    email: "d.forsyth@elmwoodapts.co.uk",  phone: "020 7946 0889" },
  { id: "cust_06", companyName: "The Brennan Family",     contactName: "Ciara Brennan",    email: "ciara.brennan@icloud.com",     phone: "07700 900356" },
  { id: "cust_07", companyName: "Studio Nine Architects", contactName: "Oliver Tan",       email: "oliver@studionine.co.uk",      phone: "020 7946 0561" },
  { id: "cust_08", companyName: "The Whitmore Estate",    contactName: "Alicia Whitmore",  email: "awhitmore@whitmoreestate.com", phone: "01483 900677" },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_01",
    projectCode: "WS-2026-0138",
    customer: MOCK_CUSTOMERS[0],
    siteAddress: "14 Birchwood Lane, Guildford, Surrey, GU3 4PQ",
    designer: MOCK_USERS[0],
    productionManager: MOCK_USERS[2],
    status: "in_production",
    enquiryDate: "2026-05-12",
    startDate: "2026-06-16",
    deliveryDate: "2026-07-28",
    rooms: [
      { id: "room_01a", projectId: "proj_01", name: "Kitchen",      sequenceOrder: 1 },
      { id: "room_01b", projectId: "proj_01", name: "Utility Room", sequenceOrder: 2 },
    ],
    estimatedValue: 28500,
    internalNotes: "Client requested extra soft-close on all drawers. Confirm with Marcus before cutting.",
    createdAt: "2026-05-12T09:15:00Z",
    updatedAt: "2026-07-10T14:30:00Z",
    createdBy: "usr_01",
  },
  {
    id: "proj_02",
    projectCode: "WS-2026-0139",
    customer: MOCK_CUSTOMERS[1],
    siteAddress: "Plot 4, Kingswood Rise, Cobham, Surrey, KT11 2BN",
    designer: MOCK_USERS[1],
    productionManager: MOCK_USERS[2],
    status: "approved",
    enquiryDate: "2026-05-20",
    startDate: "2026-07-21",
    deliveryDate: "2026-09-05",
    rooms: [
      { id: "room_02a", projectId: "proj_02", name: "Master Bedroom",     sequenceOrder: 1 },
      { id: "room_02b", projectId: "proj_02", name: "Walk-in Wardrobe",   sequenceOrder: 2 },
      { id: "room_02c", projectId: "proj_02", name: "Guest Bedroom",      sequenceOrder: 3 },
    ],
    estimatedValue: 54200,
    createdAt: "2026-05-20T11:00:00Z",
    updatedAt: "2026-07-14T09:00:00Z",
    createdBy: "usr_02",
  },
  {
    id: "proj_03",
    projectCode: "WS-2026-0140",
    customer: MOCK_CUSTOMERS[2],
    siteAddress: "22 Oakfield Road, Woking, Surrey, GU22 9DP",
    designer: MOCK_USERS[3],
    status: "design",
    enquiryDate: "2026-06-03",
    startDate: "2026-08-04",
    deliveryDate: "2026-09-12",
    rooms: [
      { id: "room_03a", projectId: "proj_03", name: "Kitchen", sequenceOrder: 1 },
    ],
    estimatedValue: 19800,
    createdAt: "2026-06-03T14:00:00Z",
    updatedAt: "2026-07-18T10:45:00Z",
    createdBy: "usr_04",
  },
  {
    id: "proj_04",
    projectCode: "WS-2026-0141",
    customer: MOCK_CUSTOMERS[3],
    siteAddress: "Hartfield House, 3 The Drive, Esher, Surrey, KT10 9AF",
    designer: MOCK_USERS[0],
    productionManager: MOCK_USERS[2],
    status: "ready",
    enquiryDate: "2026-04-14",
    startDate: "2026-05-19",
    deliveryDate: "2026-07-11",
    rooms: [
      { id: "room_04a", projectId: "proj_04", name: "Home Office",    sequenceOrder: 1 },
      { id: "room_04b", projectId: "proj_04", name: "Library",        sequenceOrder: 2 },
    ],
    estimatedValue: 36750,
    createdAt: "2026-04-14T08:30:00Z",
    updatedAt: "2026-07-19T16:00:00Z",
    createdBy: "usr_01",
  },
  {
    id: "proj_05",
    projectCode: "WS-2026-0142",
    customer: MOCK_CUSTOMERS[4],
    siteAddress: "Apt 12B, Elmwood House, Kingston upon Thames, KT1 3JL",
    designer: MOCK_USERS[1],
    status: "enquiry",
    enquiryDate: "2026-07-15",
    startDate: "2026-09-01",
    deliveryDate: "2026-10-17",
    rooms: [
      { id: "room_05a", projectId: "proj_05", name: "Open-Plan Living", sequenceOrder: 1 },
      { id: "room_05b", projectId: "proj_05", name: "Master Bedroom",   sequenceOrder: 2 },
    ],
    estimatedValue: 42000,
    createdAt: "2026-07-15T10:00:00Z",
    updatedAt: "2026-07-15T10:00:00Z",
    createdBy: "usr_02",
  },
  {
    id: "proj_06",
    projectCode: "WS-2026-0143",
    customer: MOCK_CUSTOMERS[5],
    siteAddress: "8 Maple Grove, Leatherhead, Surrey, KT22 8HQ",
    designer: MOCK_USERS[3],
    productionManager: MOCK_USERS[2],
    status: "dispatched",
    enquiryDate: "2026-03-25",
    startDate: "2026-05-05",
    deliveryDate: "2026-06-27",
    rooms: [
      { id: "room_06a", projectId: "proj_06", name: "Kitchen",        sequenceOrder: 1 },
      { id: "room_06b", projectId: "proj_06", name: "Utility",        sequenceOrder: 2 },
      { id: "room_06c", projectId: "proj_06", name: "Boot Room",      sequenceOrder: 3 },
    ],
    estimatedValue: 31400,
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-07-17T11:20:00Z",
    createdBy: "usr_04",
  },
  {
    id: "proj_07",
    projectCode: "WS-2026-0144",
    customer: MOCK_CUSTOMERS[6],
    siteAddress: "Studio Nine, 44 Commercial Way, London, SE15 1QN",
    designer: MOCK_USERS[0],
    status: "design",
    enquiryDate: "2026-07-02",
    startDate: "2026-08-18",
    deliveryDate: "2026-10-03",
    rooms: [
      { id: "room_07a", projectId: "proj_07", name: "Reception",       sequenceOrder: 1 },
      { id: "room_07b", projectId: "proj_07", name: "Meeting Room A",  sequenceOrder: 2 },
      { id: "room_07c", projectId: "proj_07", name: "Meeting Room B",  sequenceOrder: 3 },
      { id: "room_07d", projectId: "proj_07", name: "Breakout Area",   sequenceOrder: 4 },
    ],
    estimatedValue: 67500,
    internalNotes: "Commercial project — VAT reverse charge applies. Confirm with accounts.",
    createdAt: "2026-07-02T13:30:00Z",
    updatedAt: "2026-07-20T08:00:00Z",
    createdBy: "usr_01",
  },
  {
    id: "proj_08",
    projectCode: "WS-2026-0145",
    customer: MOCK_CUSTOMERS[7],
    siteAddress: "The Whitmore Estate, Shere Road, Albury, Surrey, GU5 9BE",
    designer: MOCK_USERS[1],
    productionManager: MOCK_USERS[2],
    status: "installed",
    enquiryDate: "2026-02-10",
    startDate: "2026-03-24",
    deliveryDate: "2026-05-16",
    rooms: [
      { id: "room_08a", projectId: "proj_08", name: "Kitchen",           sequenceOrder: 1 },
      { id: "room_08b", projectId: "proj_08", name: "Pantry",            sequenceOrder: 2 },
      { id: "room_08c", projectId: "proj_08", name: "Dining Room",       sequenceOrder: 3 },
      { id: "room_08d", projectId: "proj_08", name: "Master Wardrobe",   sequenceOrder: 4 },
    ],
    estimatedValue: 88200,
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-06-28T15:00:00Z",
    createdBy: "usr_02",
  },
];

// ─── Derived helpers ───────────────────────────────────────────────────────────

const ACTIVE_STATUSES = new Set<string>([
  "enquiry", "design", "approved", "in_production", "ready", "dispatched",
]);

export function getProjectListItems(): ProjectListItem[] {
  return MOCK_PROJECTS.map((p) => ({
    id: p.id,
    projectCode: p.projectCode,
    customerName: p.customer.companyName,
    siteAddress: p.siteAddress,
    status: p.status,
    designerName: p.designer.name,
    roomCount: p.rooms.length,
    estimatedValue: p.estimatedValue,
    startDate: p.startDate,
    deliveryDate: p.deliveryDate,
    enquiryDate: p.enquiryDate,
    isOverdue: ACTIVE_STATUSES.has(p.status) && isOverdue(p.deliveryDate),
  }));
}

export function getProjectById(id: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.id === id || p.projectCode === id);
}

export function getProjectKpis(): ProjectKpis {
  const active = MOCK_PROJECTS.filter((p) => ACTIVE_STATUSES.has(p.status));
  const byStatus = MOCK_PROJECTS.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const enquiries = MOCK_PROJECTS.filter((p) => p.status === "enquiry").length;
  const approved  = MOCK_PROJECTS.filter((p) =>
    ["approved", "in_production", "ready", "dispatched", "installed", "closed"].includes(p.status)
  ).length;

  return {
    totalActive: active.length,
    pipelineValue: active.reduce((sum, p) => sum + p.estimatedValue, 0),
    inProduction: MOCK_PROJECTS.filter((p) => p.status === "in_production").length,
    overdueCount: active.filter((p) => isOverdue(p.deliveryDate)).length,
    byStatus: byStatus as ProjectKpis["byStatus"],
    quoteConversionRate: enquiries + approved > 0
      ? Math.round((approved / (enquiries + approved)) * 100)
      : 0,
  };
}
