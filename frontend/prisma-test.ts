import { prisma } from "./lib/prisma";

async function main() {
  try {
    // Try a simple database operation
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
    console.log("Prisma client is working correctly!");
  } catch (error) {
    console.error("Error testing Prisma client:", error);
  } finally {
    // Close Prisma client connection
    await prisma.$disconnect();
  }
}

main(); 