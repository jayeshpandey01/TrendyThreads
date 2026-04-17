import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const trainer = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        trainerGym: true,
      }
    });

    if (!trainer || !trainer.gymId) {
      return NextResponse.json({ error: "Trainer not assigned to any gym" }, { status: 400 });
    }

    // Get unique users who have visited this gym
    const recentVisits = await prisma.visitLog.findMany({
      where: { gymId: trainer.gymId },
      orderBy: { timestamp: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          }
        }
      }
    });

    // Deduplicate athletes
    const athletesMap = new Map();
    for (const v of recentVisits) {
      if (!athletesMap.has(v.user.id)) {
        athletesMap.set(v.user.id, {
          ...v.user,
          lastVisit: v.timestamp
        });
      }
    }
    const athletes = Array.from(athletesMap.values());

    // Get tasks assigned by this trainer
    const assignedTasks = await prisma.task.findMany({
      where: { trainerId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { name: true } }
      }
    });

    return NextResponse.json({
      gym: trainer.trainerGym,
      athletes,
      assignedTasks
    });
  } catch (error: any) {
    console.error("[TRAINER_DASHBOARD_GET]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
