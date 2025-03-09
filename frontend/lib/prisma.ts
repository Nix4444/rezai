import { PrismaClient } from '@prisma/client';

// For TypeScript, declare the global prisma property
declare global {
  var prisma: PrismaClient | undefined;
}

// Clear any existing instances to force a fresh load
if (global.prisma) {
  global.prisma = undefined;
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 