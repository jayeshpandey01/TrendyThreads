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

    const trainerId = (session.user as any).id;
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { gymId: true }
    });

    if (!trainer?.gymId) {
      return NextResponse.json({ error: "Trainer not assigned to gym" }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayVisits = await prisma.visitLog.count({
      where: {
        gymId: trainer.gymId,
        timestamp: {
          gte: today
        }
      }
    });

    // Mock gym load for now, or calculate based on capacity if we had it
    const gymLoad = Math.min(Math.floor((todayVisits / 50) * 100), 100);

    return NextResponse.json({
      shiftCheckins: todayVisits,
      gymLoad: gymLoad
    });
  } catch (error: any) {
    console.error("[TRAINER_STATS_GET]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
