import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const gym = await prisma.gym.findUnique({
      where: { ownerId: userId },
      select: { id: true }
    });

    if (!gym) {
      return new NextResponse("Gym not found", { status: 404 });
    }

    const trainers = await prisma.user.findMany({
      where: {
        gymId: gym.id,
        role: "TRAINER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      }
    });

    return NextResponse.json(trainers);
  } catch (error) {
    console.error("[OWNER_TRAINERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "OWNER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const gym = await prisma.gym.findUnique({
      where: { ownerId: userId },
      select: { id: true }
    });

    if (!gym) {
      return new NextResponse("Gym not found", { status: 404 });
    }

    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const trainer = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "TRAINER",
        gymId: gym.id,
      },
    });

    return NextResponse.json({
      id: trainer.id,
      name: trainer.name,
      email: trainer.email,
    });
  } catch (error) {
    console.error("[OWNER_TRAINERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
