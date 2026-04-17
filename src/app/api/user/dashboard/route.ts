import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function dayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        tokenBalance: true,
      }
    });

    const today = startOfDay(new Date());
    const from = addDays(today, -6);
    const toExclusive = addDays(today, 1);

    const last7DaysVisits = await prisma.visitLog.findMany({
      where: {
        userId,
        timestamp: {
          gte: from,
          lt: toExclusive,
        },
      },
      select: {
        timestamp: true,
      },
    });

    const countsByDay = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = addDays(from, i);
      countsByDay.set(startOfDay(d).toISOString(), 0);
    }
    for (const v of last7DaysVisits) {
      const key = startOfDay(v.timestamp).toISOString();
      countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
    }

    const weeklyVisits = Array.from(countsByDay.entries()).map(([isoDay, visits]) => {
      const d = new Date(isoDay);
      return { name: dayLabel(d), visits };
    });

    const recentVisits = await prisma.visitLog.findMany({
      where: { userId },
      take: 5,
      orderBy: { timestamp: "desc" },
      include: {
        gym: {
          select: {
            name: true,
          }
        }
      }
    });

    const recentTransactions = await prisma.tokenTransaction.findMany({
      where: { userId, status: "SUCCESS" },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    const last28Days = addDays(today, -28);
    const last28DaysVisits = await prisma.visitLog.count({
      where: {
        userId,
        timestamp: { gte: last28Days, lt: toExclusive },
      },
    });
    const avgWeeklyVisits = parseFloat((last28DaysVisits / 4).toFixed(1));

    // Calculate current streak
    const allVisits = await prisma.visitLog.findMany({
      where: { userId },
      select: { timestamp: true },
      orderBy: { timestamp: "desc" },
    });
    
    let currentStreak = 0;
    let checkDate = new Date(today);
    
    // Check if visited today
    const visitedToday = allVisits.some(v => startOfDay(v.timestamp).getTime() === checkDate.getTime());
    if (visitedToday) {
      currentStreak++;
      checkDate = addDays(checkDate, -1);
    } else {
      // If not visited today, streak might be from yesterday
      checkDate = addDays(checkDate, -1);
      const visitedYesterday = allVisits.some(v => startOfDay(v.timestamp).getTime() === checkDate.getTime());
      if (visitedYesterday) {
        currentStreak++;
        checkDate = addDays(checkDate, -1);
      }
    }

    if (currentStreak > 0) {
      while (true) {
        const visited = allVisits.some(v => startOfDay(v.timestamp).getTime() === checkDate.getTime());
        if (visited) {
          currentStreak++;
          checkDate = addDays(checkDate, -1);
        } else {
          break;
        }
      }
    }

    // Prepare streak array for visualizer (last 7 days true/false)
    const streakArray = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today, -i);
      const visited = allVisits.some(v => startOfDay(v.timestamp).getTime() === startOfDay(d).getTime());
      streakArray.push(visited);
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        trainer: { select: { name: true } }
      }
    });

    return NextResponse.json({
      tokenBalance: user?.tokenBalance || 0,
      recentVisits,
      weeklyVisits,
      recentTransactions,
      avgWeeklyVisits,
      currentStreak,
      streakArray,
      tasks
    });
  } catch (error) {
    console.error("[USER_DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
