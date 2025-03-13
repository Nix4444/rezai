import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}


if (global.prisma) {
  global.prisma = undefined;
}


const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma; 