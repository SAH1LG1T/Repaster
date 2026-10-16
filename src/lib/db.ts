// PrismaClient singleton with graceful fallback when client is not yet generated
let PrismaClientConstructor: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const prismaPkg = require("@prisma/client");
  PrismaClientConstructor = prismaPkg.PrismaClient;
} catch {
  PrismaClientConstructor = class MockPrismaClient {
    offering = { findMany: async () => [], create: async () => ({}) };
    foodRequest = { findMany: async () => [], create: async () => ({}) };
    abuseReport = { findMany: async () => [], create: async () => ({}) };
    auditLog = { findMany: async () => [], create: async () => ({}) };
    $disconnect = async () => {};
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

export const prisma =
  globalForPrisma.prisma ??
  (PrismaClientConstructor
    ? new PrismaClientConstructor({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      })
    : null);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "./data";
