import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting deep cleanup...");
  
  // 1. Delete visit logs
  await prisma.visitLog.deleteMany({});
  
  // 2. Clear gym references in users
  await prisma.user.updateMany({
    data: { gymId: null }
  });
  
  // 3. Delete gyms
  await prisma.gym.deleteMany({});
  
  // 4. Delete rest
  await prisma.product.deleteMany({});
  await prisma.tokenTransaction.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log("Deep cleanup complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
