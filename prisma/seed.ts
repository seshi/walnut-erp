import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding Walnut Studios ERP…");

  // ── Users ──────────────────────────────────────────────────────────────────
  await Promise.all([
    db.user.upsert({ where: { email: "sarah.chen@walnutstudios.co.uk" },    create: { id: "usr_01", name: "Sarah Chen",     email: "sarah.chen@walnutstudios.co.uk",   role: "designer",           avatarInitials: "SC" }, update: {} }),
    db.user.upsert({ where: { email: "tom.hartley@walnutstudios.co.uk" },   create: { id: "usr_02", name: "Tom Hartley",    email: "tom.hartley@walnutstudios.co.uk",  role: "designer",           avatarInitials: "TH" }, update: {} }),
    db.user.upsert({ where: { email: "marcus.webb@walnutstudios.co.uk" },   create: { id: "usr_03", name: "Marcus Webb",    email: "marcus.webb@walnutstudios.co.uk",  role: "production_manager", avatarInitials: "MW" }, update: {} }),
    db.user.upsert({ where: { email: "priya.nair@walnutstudios.co.uk" },    create: { id: "usr_04", name: "Priya Nair",     email: "priya.nair@walnutstudios.co.uk",   role: "designer",           avatarInitials: "PN" }, update: {} }),
    db.user.upsert({ where: { email: "james.a@walnutstudios.co.uk" },       create: { id: "usr_05", name: "James Albright", email: "james.a@walnutstudios.co.uk",      role: "director",           avatarInitials: "JA" }, update: {} }),
  ]);
  console.log("  ✓ 5 users");

  // ── Customers ──────────────────────────────────────────────────────────────
  await Promise.all([
    db.customer.upsert({ where: { id: "cust_01" }, create: { id: "cust_01", companyName: "The Morrison Family",    contactName: "James Morrison",   email: "james@morrisonfamily.co.uk",   phone: "07700 900142" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_02" }, create: { id: "cust_02", companyName: "Kingswood Developments", contactName: "Rachel Kingswood", email: "rachel@kingswood-dev.co.uk",   phone: "020 7946 0302" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_03" }, create: { id: "cust_03", companyName: "The Patel Residence",    contactName: "Anita Patel",      email: "anita.patel@gmail.com",        phone: "07700 900781" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_04" }, create: { id: "cust_04", companyName: "Hartfield Interiors",    contactName: "George Hartfield", email: "george@hartfield-int.co.uk",   phone: "01483 900234" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_05" }, create: { id: "cust_05", companyName: "Elmwood Apartments",     contactName: "Diane Forsyth",    email: "d.forsyth@elmwoodapts.co.uk",  phone: "020 7946 0889" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_06" }, create: { id: "cust_06", companyName: "The Brennan Family",     contactName: "Ciara Brennan",    email: "ciara.brennan@icloud.com",     phone: "07700 900356" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_07" }, create: { id: "cust_07", companyName: "Studio Nine Architects", contactName: "Oliver Tan",       email: "oliver@studionine.co.uk",      phone: "020 7946 0561" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_08" }, create: { id: "cust_08", companyName: "The Whitmore Estate",    contactName: "Alicia Whitmore",  email: "awhitmore@whitmoreestate.com", phone: "01483 900677" }, update: {} }),
  ]);
  console.log("  ✓ 8 customers");

  // ── Projects ───────────────────────────────────────────────────────────────
  const projectSeeds = [
    { id: "proj_01", projectCode: "WS-2026-0138", customerId: "cust_01", siteAddress: "14 Birchwood Lane, Guildford, Surrey, GU3 4PQ",                     designerId: "usr_01", productionManagerId: "usr_03", status: "in_production", enquiryDate: "2026-05-12", startDate: "2026-06-16", deliveryDate: "2026-07-28", estimatedValue: 28500, internalNotes: "Client requested extra soft-close on all drawers. Confirm with Marcus before cutting.", createdById: "usr_01", rooms: ["Kitchen", "Utility Room"] },
    { id: "proj_02", projectCode: "WS-2026-0139", customerId: "cust_02", siteAddress: "Plot 4, Kingswood Rise, Cobham, Surrey, KT11 2BN",                  designerId: "usr_02", productionManagerId: "usr_03", status: "approved",      enquiryDate: "2026-05-20", startDate: "2026-07-21", deliveryDate: "2026-09-05", estimatedValue: 54200, createdById: "usr_02", rooms: ["Master Bedroom", "Walk-in Wardrobe", "Guest Bedroom"] },
    { id: "proj_03", projectCode: "WS-2026-0140", customerId: "cust_03", siteAddress: "22 Oakfield Road, Woking, Surrey, GU22 9DP",                        designerId: "usr_04", status: "design",       enquiryDate: "2026-06-03", startDate: "2026-08-04", deliveryDate: "2026-09-12", estimatedValue: 19800, createdById: "usr_04", rooms: ["Kitchen"] },
    { id: "proj_04", projectCode: "WS-2026-0141", customerId: "cust_04", siteAddress: "Hartfield House, 3 The Drive, Esher, Surrey, KT10 9AF",              designerId: "usr_01", productionManagerId: "usr_03", status: "ready",         enquiryDate: "2026-04-14", startDate: "2026-05-19", deliveryDate: "2026-07-11", estimatedValue: 36750, createdById: "usr_01", rooms: ["Home Office", "Library"] },
    { id: "proj_05", projectCode: "WS-2026-0142", customerId: "cust_05", siteAddress: "Apt 12B, Elmwood House, Kingston upon Thames, KT1 3JL",              designerId: "usr_02", status: "enquiry",      enquiryDate: "2026-07-15", startDate: "2026-09-01", deliveryDate: "2026-10-17", estimatedValue: 42000, createdById: "usr_02", rooms: ["Open-Plan Living", "Master Bedroom"] },
    { id: "proj_06", projectCode: "WS-2026-0143", customerId: "cust_06", siteAddress: "8 Maple Grove, Leatherhead, Surrey, KT22 8HQ",                      designerId: "usr_04", productionManagerId: "usr_03", status: "dispatched",    enquiryDate: "2026-03-25", startDate: "2026-05-05", deliveryDate: "2026-06-27", estimatedValue: 31400, createdById: "usr_04", rooms: ["Kitchen", "Utility", "Boot Room"] },
    { id: "proj_07", projectCode: "WS-2026-0144", customerId: "cust_07", siteAddress: "Studio Nine, 44 Commercial Way, London, SE15 1QN",                  designerId: "usr_01", status: "design",       enquiryDate: "2026-07-02", startDate: "2026-08-18", deliveryDate: "2026-10-03", estimatedValue: 67500, internalNotes: "Commercial project — VAT reverse charge applies. Confirm with accounts.", createdById: "usr_01", rooms: ["Reception", "Meeting Room A", "Meeting Room B", "Breakout Area"] },
    { id: "proj_08", projectCode: "WS-2026-0145", customerId: "cust_08", siteAddress: "The Whitmore Estate, Shere Road, Albury, Surrey, GU5 9BE",          designerId: "usr_02", productionManagerId: "usr_03", status: "installed",     enquiryDate: "2026-02-10", startDate: "2026-03-24", deliveryDate: "2026-05-16", estimatedValue: 88200, createdById: "usr_02", rooms: ["Kitchen", "Pantry", "Dining Room", "Master Wardrobe"] },
  ] as const;

  for (const s of projectSeeds) {
    await db.project.upsert({
      where:  { id: s.id },
      update: {},
      create: {
        id: s.id, projectCode: s.projectCode, siteAddress: s.siteAddress,
        status: s.status as any,
        enquiryDate: new Date(s.enquiryDate), startDate: new Date(s.startDate), deliveryDate: new Date(s.deliveryDate),
        estimatedValue: s.estimatedValue, internalNotes: (s as any).internalNotes ?? null,
        customerId: s.customerId, designerId: s.designerId,
        productionManagerId: (s as any).productionManagerId ?? null,
        createdById: s.createdById,
        rooms: { create: s.rooms.map((name, i) => ({ name, sequenceOrder: i + 1 })) },
      },
    });
  }
  console.log("  ✓ 8 projects");

  // ── Materials ──────────────────────────────────────────────────────────────
  const materials = [
    { id: "mat_01", code: "BP-18",   name: "Birch Plywood 18mm",              category: "board",        supplier: "Baltic Birch Co",    sheetLengthMm: 2440, sheetWidthMm: 1220, thicknessMm: 18, costPerSheet: 62.50, wastagePct: 12, grainDirection: "length", edgeBandingCodes: ["EB-BIRCH"], active: true,  minOrderQty: 5,  leadTimeDays: 7  },
    { id: "mat_02", code: "MDF-18",  name: "MDF 18mm",                        category: "board",        supplier: "Medite Europe",      sheetLengthMm: 2440, sheetWidthMm: 1220, thicknessMm: 18, costPerSheet: 28.00, wastagePct: 10, grainDirection: "none",   edgeBandingCodes: ["EB-WHITE"], active: true,  minOrderQty: 10, leadTimeDays: 3  },
    { id: "mat_03", code: "MDF-12",  name: "MDF 12mm",                        category: "board",        supplier: "Medite Europe",      sheetLengthMm: 2440, sheetWidthMm: 1220, thicknessMm: 12, costPerSheet: 22.00, wastagePct: 10, grainDirection: "none",   edgeBandingCodes: ["EB-WHITE"], active: true,  minOrderQty: 10, leadTimeDays: 3  },
    { id: "mat_04", code: "MDF-09",  name: "MDF 9mm",                         category: "board",        supplier: "Medite Europe",      sheetLengthMm: 2440, sheetWidthMm: 1220, thicknessMm:  9, costPerSheet: 18.00, wastagePct: 10, grainDirection: "none",   edgeBandingCodes: [],           active: true,  minOrderQty: 10, leadTimeDays: 3  },
    { id: "mat_05", code: "WM-18",   name: "White Melamine 18mm",             category: "board",        supplier: "Egger UK",           sheetLengthMm: 2800, sheetWidthMm: 2070, thicknessMm: 18, costPerSheet: 45.00, wastagePct: 8,  grainDirection: "none",   edgeBandingCodes: ["EB-WHITE"], active: true,  minOrderQty: 5,  leadTimeDays: 5  },
    { id: "mat_06", code: "OV-18",   name: "Oak Veneered MDF 18mm",           category: "veneer",       supplier: "Crown Veneers",      sheetLengthMm: 2440, sheetWidthMm: 1220, thicknessMm: 18, costPerSheet: 94.00, wastagePct: 14, grainDirection: "length", edgeBandingCodes: ["EB-OAK"],   active: true,  minOrderQty: 3,  leadTimeDays: 10 },
    { id: "mat_07", code: "WV-18",   name: "Walnut Veneered Ply 18mm",        category: "veneer",       supplier: "Crown Veneers",      sheetLengthMm: 2440, sheetWidthMm: 1220, thicknessMm: 18, costPerSheet: 118.00,wastagePct: 14, grainDirection: "length", edgeBandingCodes: ["EB-WALNT"], active: true,  minOrderQty: 2,  leadTimeDays: 14 },
    { id: "mat_08", code: "EB-WHITE",name: "White PVC Edge Tape 22×0.4mm",    category: "edge_banding", supplier: "Doellken UK",        sheetLengthMm: 0,    sheetWidthMm: 22,   thicknessMm:  0, costPerSheet: 0.08,  wastagePct: 5,  grainDirection: "none",   edgeBandingCodes: [],           active: true,  minOrderQty: 50, leadTimeDays: 2  },
    { id: "mat_09", code: "EB-BIRCH",name: "Birch Matching Edge Tape 22×0.4mm",category:"edge_banding", supplier: "Doellken UK",        sheetLengthMm: 0,    sheetWidthMm: 22,   thicknessMm:  0, costPerSheet: 0.12,  wastagePct: 5,  grainDirection: "none",   edgeBandingCodes: [],           active: true,  minOrderQty: 50, leadTimeDays: 2  },
    { id: "mat_10", code: "EB-OAK",  name: "Oak Real Wood Edge Tape 22×0.6mm",category:"edge_banding",  supplier: "Doellken UK",        sheetLengthMm: 0,    sheetWidthMm: 22,   thicknessMm:  0, costPerSheet: 0.28,  wastagePct: 5,  grainDirection: "none",   edgeBandingCodes: [],           active: true,  minOrderQty: 20, leadTimeDays: 5  },
    { id: "mat_11", code: "OAK-20",  name: "European Oak Solid Timber 20mm",  category: "solid_timber", supplier: "Vastern Timber",     sheetLengthMm: 3000, sheetWidthMm: 150,  thicknessMm: 20, costPerSheet: 18.50, wastagePct: 18, grainDirection: "length", edgeBandingCodes: [],           active: true,  minOrderQty: 10, leadTimeDays: 7  },
    { id: "mat_12", code: "LMW-18",  name: "Lacquered MDF 18mm (White)",      category: "laminate",     supplier: "Egger UK",           sheetLengthMm: 2800, sheetWidthMm: 2070, thicknessMm: 18, costPerSheet: 88.00, wastagePct: 10, grainDirection: "none",   edgeBandingCodes: ["EB-WHITE"], active: true,  minOrderQty: 2,  leadTimeDays: 10 },
    { id: "mat_13", code: "GLS-6",   name: "Clear Toughened Glass 6mm",       category: "glass",        supplier: "Pilkington UK",      sheetLengthMm: 2440, sheetWidthMm: 1220, thicknessMm:  6, costPerSheet: 145.00,wastagePct: 20, grainDirection: "none",   edgeBandingCodes: [],           active: true,  minOrderQty: 1,  leadTimeDays: 21 },
    { id: "mat_14", code: "EB-WALNT",name: "Walnut Real Wood Edge Tape 22×0.6mm",category:"edge_banding",supplier: "Doellken UK",       sheetLengthMm: 0,    sheetWidthMm: 22,   thicknessMm:  0, costPerSheet: 0.38,  wastagePct: 5,  grainDirection: "none",   edgeBandingCodes: [],           active: false, minOrderQty: 20, leadTimeDays: 7  },
  ];

  for (const m of materials) {
    await db.material.upsert({
      where:  { id: m.id },
      update: {},
      create: { ...m, category: m.category as any, grainDirection: m.grainDirection as any },
    });
  }
  console.log(`  ✓ ${materials.length} materials`);

  // ── Hardware ───────────────────────────────────────────────────────────────
  const hardware = [
    { id: "hw_01", code: "HNG-001", name: "Blum 110° Clip-Top Hinge",               category: "hinges",         supplier: "Blum UK",         unitCost: 3.20,  uom: "pair",   finish: "Nickel",       loadRating: "15kg",  minStockLevel: 20, reorderQty: 50,  active: true },
    { id: "hw_02", code: "HNG-002", name: "Blum 170° Clip-Top Hinge (corner)",      category: "hinges",         supplier: "Blum UK",         unitCost: 5.80,  uom: "pair",   finish: "Nickel",       loadRating: "15kg",  minStockLevel: 10, reorderQty: 20,  active: true },
    { id: "hw_03", code: "DRW-001", name: "Blum Tandem Plus 500mm Drawer Runner",   category: "drawer_runners", supplier: "Blum UK",         unitCost: 18.50, uom: "pair",   finish: null,           loadRating: "30kg",  minStockLevel: 10, reorderQty: 20,  active: true },
    { id: "hw_04", code: "DRW-002", name: "Blum Tandem Plus 400mm Drawer Runner",   category: "drawer_runners", supplier: "Blum UK",         unitCost: 16.40, uom: "pair",   finish: null,           loadRating: "30kg",  minStockLevel: 10, reorderQty: 20,  active: true },
    { id: "hw_05", code: "DRW-003", name: "Blum Tandem Plus 350mm Drawer Runner",   category: "drawer_runners", supplier: "Blum UK",         unitCost: 14.90, uom: "pair",   finish: null,           loadRating: "30kg",  minStockLevel: 5,  reorderQty: 10,  active: true },
    { id: "hw_06", code: "HND-001", name: "Bar Handle 128mm C-C Satin Nickel",      category: "handles_knobs",  supplier: "Häfele UK",       unitCost: 4.20,  uom: "each",   finish: "Satin Nickel", loadRating: null,    minStockLevel: 20, reorderQty: 50,  active: true },
    { id: "hw_07", code: "HND-002", name: "Bar Handle 256mm C-C Matt Black",        category: "handles_knobs",  supplier: "Häfele UK",       unitCost: 6.80,  uom: "each",   finish: "Matt Black",   loadRating: null,    minStockLevel: 10, reorderQty: 30,  active: true },
    { id: "hw_08", code: "HND-003", name: "Cup Pull 76mm Matt Black",               category: "handles_knobs",  supplier: "Häfele UK",       unitCost: 3.50,  uom: "each",   finish: "Matt Black",   loadRating: null,    minStockLevel: 10, reorderQty: 30,  active: true },
    { id: "hw_09", code: "LEG-001", name: "Adjustable Plinth Leg 150mm",            category: "legs",           supplier: "Grass UK",        unitCost: 1.20,  uom: "each",   finish: "Grey",         loadRating: "120kg", minStockLevel: 50, reorderQty: 100, active: true },
    { id: "hw_10", code: "SHP-001", name: "Shelf Pin 5mm Nickel (pack 20)",         category: "shelf_pins",     supplier: "Häfele UK",       unitCost: 2.40,  uom: "pack",   finish: "Nickel",       loadRating: null,    minStockLevel: 10, reorderQty: 20,  active: true },
    { id: "hw_11", code: "SFT-001", name: "Blum Blumotion Soft-Close Adaptor",      category: "soft_close",     supplier: "Blum UK",         unitCost: 4.90,  uom: "each",   finish: null,           loadRating: null,    minStockLevel: 10, reorderQty: 25,  active: true },
    { id: "hw_12", code: "LGT-001", name: "Sensio Under-Cabinet LED Strip 500mm",   category: "lighting",       supplier: "Sensio Lighting", unitCost: 22.00, uom: "each",   finish: "Aluminium",    loadRating: null,    minStockLevel: 5,  reorderQty: 10,  active: true },
    { id: "hw_13", code: "CAM-001", name: "Cam Lock M50 Connector (pack 10)",       category: "other",          supplier: "Häfele UK",       unitCost: 3.80,  uom: "pack",   finish: null,           loadRating: null,    minStockLevel: 10, reorderQty: 20,  active: true },
  ];

  for (const h of hardware) {
    await db.hardware.upsert({
      where:  { id: h.id },
      update: {},
      create: { ...h, category: h.category as any },
    });
  }
  console.log(`  ✓ ${hardware.length} hardware items`);

  // ── Cut List (WS-2026-0138 — Kitchen + Utility, V1 Approved) ──────────────
  const clv = await db.cutListVersion.upsert({
    where:  { projectId_versionNo: { projectId: "proj_01", versionNo: 1 } },
    update: {},
    create: {
      id: "clv_01", projectId: "proj_01", versionNo: 1,
      status: "approved", generatedAt: new Date("2026-06-18T09:30:00Z"),
      generatedBy: "usr_01",
    },
  });

  const cutListItems = [
    // Kitchen — Base Cabinet 600mm (BC-01)
    { id: "cli_01", partCode: "WS-2026-0138-P001", description: "BC-01 LH Side Panel",         lengthMm: 702, widthMm: 560, thicknessMm: 18, qty: 1, materialId: "mat_01", grainDir: "length", edgeBanding: "L",    finish: null, cabinetRef: "BC-01" },
    { id: "cli_02", partCode: "WS-2026-0138-P002", description: "BC-01 RH Side Panel",         lengthMm: 702, widthMm: 560, thicknessMm: 18, qty: 1, materialId: "mat_01", grainDir: "length", edgeBanding: "R",    finish: null, cabinetRef: "BC-01" },
    { id: "cli_03", partCode: "WS-2026-0138-P003", description: "BC-01 Bottom Panel",          lengthMm: 564, widthMm: 560, thicknessMm: 18, qty: 1, materialId: "mat_01", grainDir: "width",  edgeBanding: "",     finish: null, cabinetRef: "BC-01" },
    { id: "cli_04", partCode: "WS-2026-0138-P004", description: "BC-01 Top Rail",              lengthMm: 564, widthMm:  80, thicknessMm: 18, qty: 1, materialId: "mat_01", grainDir: "width",  edgeBanding: "T",    finish: null, cabinetRef: "BC-01" },
    { id: "cli_05", partCode: "WS-2026-0138-P005", description: "BC-01 Back Panel",            lengthMm: 720, widthMm: 600, thicknessMm:  9, qty: 1, materialId: "mat_04", grainDir: "none",   edgeBanding: "",     finish: null, cabinetRef: "BC-01" },
    // Kitchen — Wall Cabinet 600mm (WC-01)
    { id: "cli_06", partCode: "WS-2026-0138-P006", description: "WC-01 Top Panel",             lengthMm: 564, widthMm: 320, thicknessMm: 18, qty: 1, materialId: "mat_01", grainDir: "width",  edgeBanding: "T",    finish: null, cabinetRef: "WC-01" },
    { id: "cli_07", partCode: "WS-2026-0138-P007", description: "WC-01 Bottom Panel",          lengthMm: 564, widthMm: 320, thicknessMm: 18, qty: 1, materialId: "mat_01", grainDir: "width",  edgeBanding: "B",    finish: null, cabinetRef: "WC-01" },
    { id: "cli_08", partCode: "WS-2026-0138-P008", description: "WC-01 Side Panels",           lengthMm: 504, widthMm: 320, thicknessMm: 18, qty: 2, materialId: "mat_01", grainDir: "length", edgeBanding: "LR",   finish: null, cabinetRef: "WC-01" },
    { id: "cli_09", partCode: "WS-2026-0138-P009", description: "WC-01 Back Panel",            lengthMm: 540, widthMm: 600, thicknessMm:  9, qty: 1, materialId: "mat_04", grainDir: "none",   edgeBanding: "",     finish: null, cabinetRef: "WC-01" },
    // Kitchen — Doors (MDF lacquer)
    { id: "cli_10", partCode: "WS-2026-0138-P010", description: "BC-01 Door (Base)",           lengthMm: 714, widthMm: 294, thicknessMm: 18, qty: 2, materialId: "mat_12", grainDir: "none",   edgeBanding: "LRTB", finish: "RAL 9010 Satin", cabinetRef: "BC-01" },
    { id: "cli_11", partCode: "WS-2026-0138-P011", description: "WC-01 Door (Wall)",           lengthMm: 534, widthMm: 294, thicknessMm: 18, qty: 2, materialId: "mat_12", grainDir: "none",   edgeBanding: "LRTB", finish: "RAL 9010 Satin", cabinetRef: "WC-01" },
    // Kitchen — Drawer Box (DB-01)
    { id: "cli_12", partCode: "WS-2026-0138-P012", description: "DB-01 Front/Back",            lengthMm: 514, widthMm: 130, thicknessMm: 18, qty: 2, materialId: "mat_01", grainDir: "width",  edgeBanding: "T",    finish: null, cabinetRef: "DB-01" },
    { id: "cli_13", partCode: "WS-2026-0138-P013", description: "DB-01 Sides",                 lengthMm: 450, widthMm: 130, thicknessMm: 18, qty: 2, materialId: "mat_01", grainDir: "length", edgeBanding: "T",    finish: null, cabinetRef: "DB-01" },
    { id: "cli_14", partCode: "WS-2026-0138-P014", description: "DB-01 Base",                  lengthMm: 514, widthMm: 450, thicknessMm:  9, qty: 1, materialId: "mat_04", grainDir: "none",   edgeBanding: "",     finish: null, cabinetRef: "DB-01" },
    { id: "cli_15", partCode: "WS-2026-0138-P015", description: "DB-01 Drawer Front (Shaker)", lengthMm: 714, widthMm: 168, thicknessMm: 18, qty: 1, materialId: "mat_12", grainDir: "none",   edgeBanding: "LRTB", finish: "RAL 9010 Satin", cabinetRef: "DB-01" },
  ];

  for (const item of cutListItems) {
    await db.cutListItem.upsert({
      where:  { id: item.id },
      update: {},
      create: { ...item, versionId: clv.id, grainDir: item.grainDir as any },
    });
  }
  console.log(`  ✓ 1 cut list version (${cutListItems.length} parts) for WS-2026-0138`);

  console.log("\nSeed complete ✓");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
