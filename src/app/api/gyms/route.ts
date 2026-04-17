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
    const existingGym = await prisma.gym.findFirst({
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

    // Update user role to OWNER only if they are a regular USER
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (currentUser?.role === "USER") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "OWNER" },
      });
    }

    return NextResponse.json(gym);
  } catch (error) {
    console.error("[GYMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") || "");
    const lng = parseFloat(searchParams.get("lng") || "");

    const gyms = await prisma.gym.findMany({
      include: {
        owner: {
          select: {
            name: true,
          }
        }
      }
    });

    if (!isNaN(lat) && !isNaN(lng)) {
      // Sort by distance using Haversine formula
      const sortedGyms = gyms.map(gym => {
        const distance = calculateDistance(lat, lng, gym.latitude, gym.longitude);
        return { ...gym, distance };
      }).sort((a, b) => a.distance - b.distance);

      return NextResponse.json(sortedGyms);
    }

    return NextResponse.json(gyms);
  } catch (error: any) {
    console.error("[GYMS_GET]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

// Haversine formula helper
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
