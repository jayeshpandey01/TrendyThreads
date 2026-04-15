import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const gym = await prisma.gym.findUnique({
      where: { ownerId: userId },
      include: {
        trainers: true,
      }
    });

    if (!gym) {
      return NextResponse.json({ gym: null });
    }

    // Fetch stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisits = await prisma.visitLog.count({
      where: {
        gymId: gym.id,
        timestamp: {
          gte: today
        }
      }
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const newRegistrations = await prisma.visitLog.groupBy({
      by: ['userId'],
      where: {
        gymId: gym.id,
        timestamp: {
          gte: last7Days
        }
      }
    });

    const recentActivity = await prisma.visitLog.findMany({
      where: {
        gymId: gym.id
      },
      take: 5,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({
      gym,
      stats: {
        todayVisits,
        activeTrainers: gym.trainers.length,
        newRegistrations: newRegistrations.length,
        recentActivity
      }
    });
  } catch (error: any) {
    console.error("[OWNER_GYM_GET]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
