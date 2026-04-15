import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log("Attempting to connect to MongoDB...");
    await prisma.$connect();
    console.log("✅ Successfully connected to the database.");
    
    const userCount = await prisma.user.count();
    console.log(`📊 Current User Count in DB: ${userCount}`);
    
    if (userCount > 0) {
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      console.log(admin ? "⭐ Admin user found in DB." : "ℹ️ No Admin user found in DB yet (this is normal if you haven't logged in).");
    }

  } catch (error: any) {
    console.error("❌ Database connection failed.");
    console.error("Error Message:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
