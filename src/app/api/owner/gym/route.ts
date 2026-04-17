import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const gym = await prisma.gym.findFirst({
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

    // Calculate weekly visits array
    const weeklyVisits = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const start = new Date(d);
      const end = new Date(d);
      end.setDate(end.getDate() + 1);
      
      const count = await prisma.visitLog.count({
        where: {
          gymId: gym.id,
          timestamp: {
            gte: start,
            lt: end
          }
        }
      });
      weeklyVisits.push({ day: days[d.getDay()], count });
    }

    // Rough revenue share calculation: 1 token = ₹50, owner gets say ₹40
    const allVisitsCount = await prisma.visitLog.count({
      where: { gymId: gym.id }
    });
    const revenue = allVisitsCount * 40;

    return NextResponse.json({
      gym,
      stats: {
        todayVisits,
        activeTrainers: gym.trainers.length,
        newRegistrations: newRegistrations.length,
        recentActivity,
        weeklyVisits,
        revenue
      }
    });
  } catch (error: any) {
    console.error("[OWNER_GYM_GET]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
