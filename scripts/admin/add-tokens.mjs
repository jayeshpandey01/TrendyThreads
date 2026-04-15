import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const amountRaw = process.argv[3];
  const amount = Number(amountRaw);

  if (!email || !Number.isFinite(amount) || amount <= 0) {
    console.log("Usage: node scripts/admin/add-tokens.mjs jayeshpandey754@gmail.com 50");
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exitCode = 1;
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { tokenBalance: { increment: Math.floor(amount) } },
    select: { email: true, tokenBalance: true },
  });

  console.log("Tokens updated:", updated);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

