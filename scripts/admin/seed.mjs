import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: "Elite Whey Protein",
      description: "High-quality whey protein for muscle recovery and growth.",
      price: 2499,
      images: ["https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800"],
      category: "Supplements",
      stock: 50,
    },
    {
      name: "Power Grip Lifting Straps",
      description: "Heavy-duty straps for better pull strength on deadlifts and rows.",
      price: 899,
      images: ["https://images.unsplash.com/photo-1591944037859-b0ecf6a739f4?auto=format&fit=crop&q=80&w=800"],
      category: "Equipment",
      stock: 120,
    },
    {
      name: "Stealth Gym Bag",
      description: "Spacious, durable gym bag with separate shoe compartment.",
      price: 3499,
      images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800"],
      category: "Accessories",
      stock: 25,
    },
  ];

  const gyms = [
    {
      name: "Iron Paradise Gym",
      address: "Andheri West, Mumbai",
      description: "Premium strength + conditioning facility with modern equipment.",
      latitude: 19.1364,
      longitude: 72.8296,
      amenities: ["Cardio", "Weights", "Steam"],
      contact: "+91 90000 00001",
      images: [],
    },
    {
      name: "Gold Fitness Center",
      address: "Bandra East, Mumbai",
      description: "Functional training and group classes with experienced trainers.",
      latitude: 19.0596,
      longitude: 72.8407,
      amenities: ["Yoga", "Showers", "Parking"],
      contact: "+91 90000 00002",
      images: [],
    },
    {
      name: "Flex Academy",
      address: "Juhu, Mumbai",
      description: "High-energy workouts, Zumba, and strength training all-in-one.",
      latitude: 19.1075,
      longitude: 72.8263,
      amenities: ["Zumba", "Weights", "Cafeteria"],
      contact: "+91 90000 00003",
      images: [],
    },
  ];

  let createdProductsCount = 0;
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name }
    });
    if (!existing) {
      await prisma.product.create({ data: product });
      createdProductsCount++;
    }
  }

  const athletes = [
    { name: "John Athlete", email: "john@gymqr.local", role: "USER", tokenBalance: 12 },
    { name: "Sarah Fitness", email: "sarah@gymqr.local", role: "USER", tokenBalance: 5 },
    { name: "Mike Power", email: "mike@gymqr.local", role: "USER", tokenBalance: 0 },
  ];

  for (const a of athletes) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: { role: "USER", name: a.name, tokenBalance: a.tokenBalance },
      create: { ...a, tokenBalance: a.tokenBalance },
    });
  }

  const sampleOwnerEmail = "sample.owner@trendythreads.local";
  const owner = await prisma.user.upsert({
    where: { email: sampleOwnerEmail },
    update: { role: "OWNER", name: "Sample Owner" },
    create: { email: sampleOwnerEmail, role: "OWNER", name: "Sample Owner", tokenBalance: 0 },
    select: { id: true },
  });

  let createdGyms = 0;
  for (const g of gyms) {
    const existing = await prisma.gym.findFirst({ where: { name: g.name }, select: { id: true } });
    if (existing) continue;
    
    // Only the first gym gets the sample owner to keep ownerId unique
    if (createdGyms === 0) {
      await prisma.gym.create({ data: { ...g, ownerId: owner.id } });
      createdGyms++;
    }
  }

  // Add a sample trainer for the first gym
  const firstGym = await prisma.gym.findFirst({ select: { id: true } });
  if (firstGym) {
    const trainerEmail = "trainer@gymqr.local";
    await prisma.user.upsert({
      where: { email: trainerEmail },
      update: { role: "TRAINER", name: "Bob Trainer", gymId: firstGym.id },
      create: { 
        email: trainerEmail, 
        role: "TRAINER", 
        name: "Bob Trainer", 
        gymId: firstGym.id,
        password: "$2a$10$YourMashedPasswordHereIfKnown" // They can just sign up/be added too
      },
    });
  }

  console.log("Seed complete:", {
    products: createdProductsCount,
    gyms: createdGyms,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
