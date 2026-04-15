import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "../_auth";

function sampleProducts() {
  return [
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
}

function sampleGyms() {
  return [
    {
      name: "Iron Paradise Gym",
      address: "Andheri West, Mumbai",
      description: "Premium strength + conditioning facility with modern equipment.",
      latitude: 19.1364,
      longitude: 72.8296,
      amenities: ["Cardio", "Weights", "Steam"],
      contact: "+91 90000 00001",
    },
    {
      name: "Gold Fitness Center",
      address: "Bandra East, Mumbai",
      description: "Functional training and group classes with experienced trainers.",
      latitude: 19.0596,
      longitude: 72.8407,
      amenities: ["Yoga", "Showers", "Parking"],
      contact: "+91 90000 00002",
    },
    {
      name: "Flex Academy",
      address: "Juhu, Mumbai",
      description: "High-energy workouts, Zumba, and strength training all-in-one.",
      latitude: 19.1075,
      longitude: 72.8263,
      amenities: ["Zumba", "Weights", "Cafeteria"],
      contact: "+91 90000 00003",
    },
  ];
}

export async function POST(req: Request) {
  try {
    const auth = await assertAdmin();
    if (!auth.ok) return new NextResponse("Unauthorized", { status: 401 });

    const body = (await req.json().catch(() => ({}))) as any;
    const seedProducts = body?.products !== false;
    const seedGyms = body?.gyms !== false;

    const results: Record<string, any> = {};

    if (seedProducts) {
      const products = sampleProducts();
      let created = 0;
      for (const p of products) {
        const existing = await prisma.product.findFirst({
          where: { name: p.name },
          select: { id: true },
        });
        if (existing) continue;
        await prisma.product.create({ data: p });
        created++;
      }
      results.products = { created };
    }

    if (seedGyms) {
      // Gyms require an ownerId; create a dedicated owner user for samples if needed.
      const sampleOwnerEmail = "sample.owner@trendythreads.local";
      const owner = await prisma.user.upsert({
        where: { email: sampleOwnerEmail },
        update: { role: "OWNER", name: "Sample Owner" },
        create: {
          email: sampleOwnerEmail,
          name: "Sample Owner",
          role: "OWNER",
          tokenBalance: 0,
        },
        select: { id: true },
      });

      const gyms = sampleGyms();
      const createdGyms = [];
      for (const g of gyms) {
        const existing = await prisma.gym.findFirst({
          where: { name: g.name },
          select: { id: true },
        });
        if (existing) continue;
        const gym = await prisma.gym.create({
          data: {
            ...g,
            ownerId: owner.id,
            images: [],
          },
        });
        createdGyms.push(gym.id);
      }
      results.gyms = { created: createdGyms.length };
    }

    return NextResponse.json({ ok: true, results });
  } catch (e) {
    console.error("[ADMIN_SEED_POST]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

