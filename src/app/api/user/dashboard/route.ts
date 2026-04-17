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

    return NextResponse.json({
      tokenBalance: user?.tokenBalance || 0,
      recentVisits,
      weeklyVisits,
      recentTransactions
    });
  } catch (error) {
    console.error("[USER_DASHBOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
