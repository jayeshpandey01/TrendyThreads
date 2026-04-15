import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, address, description, contact, amenities, latitude, longitude } = body;

    if (!name || !address || !contact) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already has a gym
    const existingGym = await prisma.gym.findUnique({
      where: { ownerId: userId },
    });

    if (existingGym) {
      return new NextResponse("User already owns a gym", { status: 400 });
    }

    const gym = await prisma.gym.create({
      data: {
        name,
        address,
        description,
        contact,
        amenities: Array.isArray(amenities) ? amenities : [amenities].filter(Boolean),
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        ownerId: userId,
      },
    });

    // Update user role to OWNER
    await prisma.user.update({
      where: { id: userId },
      data: { role: "OWNER" },
    });

    return NextResponse.json(gym);
  } catch (error) {
    console.error("[GYMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const gyms = await prisma.gym.findMany({
      include: {
        owner: {
          select: {
            name: true,
          }
        }
      }
    });

    return NextResponse.json(gyms);
  } catch (error) {
    console.error("[GYMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
