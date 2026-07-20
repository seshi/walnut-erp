import { PrismaClient } from "@prisma/client";

// Prevent multiple Prisma client instances during Next.js hot-module reload in dev.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
