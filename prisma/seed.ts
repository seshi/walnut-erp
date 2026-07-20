import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seeding Walnut Studios ERP…");

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    db.user.upsert({
      where:  { email: "sarah.chen@walnutstudios.co.uk" },
      create: { id: "usr_01", name: "Sarah Chen",     email: "sarah.chen@walnutstudios.co.uk",   role: "designer",           avatarInitials: "SC" },
      update: {},
    }),
    db.user.upsert({
      where:  { email: "tom.hartley@walnutstudios.co.uk" },
      create: { id: "usr_02", name: "Tom Hartley",    email: "tom.hartley@walnutstudios.co.uk",  role: "designer",           avatarInitials: "TH" },
      update: {},
    }),
    db.user.upsert({
      where:  { email: "marcus.webb@walnutstudios.co.uk" },
      create: { id: "usr_03", name: "Marcus Webb",    email: "marcus.webb@walnutstudios.co.uk",  role: "production_manager", avatarInitials: "MW" },
      update: {},
    }),
    db.user.upsert({
      where:  { email: "priya.nair@walnutstudios.co.uk" },
      create: { id: "usr_04", name: "Priya Nair",     email: "priya.nair@walnutstudios.co.uk",   role: "designer",           avatarInitials: "PN" },
      update: {},
    }),
    db.user.upsert({
      where:  { email: "james.a@walnutstudios.co.uk" },
      create: { id: "usr_05", name: "James Albright", email: "james.a@walnutstudios.co.uk",      role: "director",           avatarInitials: "JA" },
      update: {},
    }),
  ]);
  console.log(`  ✓ ${users.length} users`);

  // ── Customers ──────────────────────────────────────────────────────────────
  const customers = await Promise.all([
    db.customer.upsert({ where: { id: "cust_01" }, create: { id: "cust_01", companyName: "The Morrison Family",    contactName: "James Morrison",   email: "james@morrisonfamily.co.uk",   phone: "07700 900142" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_02" }, create: { id: "cust_02", companyName: "Kingswood Developments", contactName: "Rachel Kingswood", email: "rachel@kingswood-dev.co.uk",   phone: "020 7946 0302" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_03" }, create: { id: "cust_03", companyName: "The Patel Residence",    contactName: "Anita Patel",      email: "anita.patel@gmail.com",        phone: "07700 900781" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_04" }, create: { id: "cust_04", companyName: "Hartfield Interiors",    contactName: "George Hartfield", email: "george@hartfield-int.co.uk",   phone: "01483 900234" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_05" }, create: { id: "cust_05", companyName: "Elmwood Apartments",     contactName: "Diane Forsyth",    email: "d.forsyth@elmwoodapts.co.uk",  phone: "020 7946 0889" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_06" }, create: { id: "cust_06", companyName: "The Brennan Family",     contactName: "Ciara Brennan",    email: "ciara.brennan@icloud.com",     phone: "07700 900356" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_07" }, create: { id: "cust_07", companyName: "Studio Nine Architects", contactName: "Oliver Tan",       email: "oliver@studionine.co.uk",      phone: "020 7946 0561" }, update: {} }),
    db.customer.upsert({ where: { id: "cust_08" }, create: { id: "cust_08", companyName: "The Whitmore Estate",    contactName: "Alicia Whitmore",  email: "awhitmore@whitmoreestate.com", phone: "01483 900677" }, update: {} }),
  ]);
  console.log(`  ✓ ${customers.length} customers`);

  // ── Projects ───────────────────────────────────────────────────────────────

  type ProjectSeed = {
    id: string; projectCode: string; customerId: string; siteAddress: string;
    designerId: string; productionManagerId?: string; status: string;
    enquiryDate: string; startDate: string; deliveryDate: string;
    estimatedValue: number; internalNotes?: string; createdById: string;
    rooms: string[];
  };

  const projectSeeds: ProjectSeed[] = [
    {
      id: "proj_01", projectCode: "WS-2026-0138", customerId: "cust_01",
      siteAddress: "14 Birchwood Lane, Guildford, Surrey, GU3 4PQ",
      designerId: "usr_01", productionManagerId: "usr_03", status: "in_production",
      enquiryDate: "2026-05-12", startDate: "2026-06-16", deliveryDate: "2026-07-28",
      estimatedValue: 28500,
      internalNotes: "Client requested extra soft-close on all drawers. Confirm with Marcus before cutting.",
      createdById: "usr_01", rooms: ["Kitchen", "Utility Room"],
    },
    {
      id: "proj_02", projectCode: "WS-2026-0139", customerId: "cust_02",
      siteAddress: "Plot 4, Kingswood Rise, Cobham, Surrey, KT11 2BN",
      designerId: "usr_02", productionManagerId: "usr_03", status: "approved",
      enquiryDate: "2026-05-20", startDate: "2026-07-21", deliveryDate: "2026-09-05",
      estimatedValue: 54200, createdById: "usr_02",
      rooms: ["Master Bedroom", "Walk-in Wardrobe", "Guest Bedroom"],
    },
    {
      id: "proj_03", projectCode: "WS-2026-0140", customerId: "cust_03",
      siteAddress: "22 Oakfield Road, Woking, Surrey, GU22 9DP",
      designerId: "usr_04", status: "design",
      enquiryDate: "2026-06-03", startDate: "2026-08-04", deliveryDate: "2026-09-12",
      estimatedValue: 19800, createdById: "usr_04", rooms: ["Kitchen"],
    },
    {
      id: "proj_04", projectCode: "WS-2026-0141", customerId: "cust_04",
      siteAddress: "Hartfield House, 3 The Drive, Esher, Surrey, KT10 9AF",
      designerId: "usr_01", productionManagerId: "usr_03", status: "ready",
      enquiryDate: "2026-04-14", startDate: "2026-05-19", deliveryDate: "2026-07-11",
      estimatedValue: 36750, createdById: "usr_01", rooms: ["Home Office", "Library"],
    },
    {
      id: "proj_05", projectCode: "WS-2026-0142", customerId: "cust_05",
      siteAddress: "Apt 12B, Elmwood House, Kingston upon Thames, KT1 3JL",
      designerId: "usr_02", status: "enquiry",
      enquiryDate: "2026-07-15", startDate: "2026-09-01", deliveryDate: "2026-10-17",
      estimatedValue: 42000, createdById: "usr_02", rooms: ["Open-Plan Living", "Master Bedroom"],
    },
    {
      id: "proj_06", projectCode: "WS-2026-0143", customerId: "cust_06",
      siteAddress: "8 Maple Grove, Leatherhead, Surrey, KT22 8HQ",
      designerId: "usr_04", productionManagerId: "usr_03", status: "dispatched",
      enquiryDate: "2026-03-25", startDate: "2026-05-05", deliveryDate: "2026-06-27",
      estimatedValue: 31400, createdById: "usr_04", rooms: ["Kitchen", "Utility", "Boot Room"],
    },
    {
      id: "proj_07", projectCode: "WS-2026-0144", customerId: "cust_07",
      siteAddress: "Studio Nine, 44 Commercial Way, London, SE15 1QN",
      designerId: "usr_01", status: "design",
      enquiryDate: "2026-07-02", startDate: "2026-08-18", deliveryDate: "2026-10-03",
      estimatedValue: 67500,
      internalNotes: "Commercial project — VAT reverse charge applies. Confirm with accounts.",
      createdById: "usr_01", rooms: ["Reception", "Meeting Room A", "Meeting Room B", "Breakout Area"],
    },
    {
      id: "proj_08", projectCode: "WS-2026-0145", customerId: "cust_08",
      siteAddress: "The Whitmore Estate, Shere Road, Albury, Surrey, GU5 9BE",
      designerId: "usr_02", productionManagerId: "usr_03", status: "installed",
      enquiryDate: "2026-02-10", startDate: "2026-03-24", deliveryDate: "2026-05-16",
      estimatedValue: 88200, createdById: "usr_02",
      rooms: ["Kitchen", "Pantry", "Dining Room", "Master Wardrobe"],
    },
  ];

  for (const seed of projectSeeds) {
    await db.project.upsert({
      where:  { id: seed.id },
      update: {},
      create: {
        id:                 seed.id,
        projectCode:        seed.projectCode,
        siteAddress:        seed.siteAddress,
        status:             seed.status as any,
        enquiryDate:        new Date(seed.enquiryDate),
        startDate:          new Date(seed.startDate),
        deliveryDate:       new Date(seed.deliveryDate),
        estimatedValue:     seed.estimatedValue,
        internalNotes:      seed.internalNotes ?? null,
        customerId:         seed.customerId,
        designerId:         seed.designerId,
        productionManagerId: seed.productionManagerId ?? null,
        createdById:        seed.createdById,
        rooms: {
          create: seed.rooms.map((name, i) => ({ name, sequenceOrder: i + 1 })),
        },
      },
    });
  }
  console.log(`  ✓ ${projectSeeds.length} projects`);

  console.log("Seed complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
