import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "TRAINER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const trainerId = (session.user as any).id;
    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      select: { gymId: true }
    });

    if (!trainer?.gymId) {
      return new NextResponse("Trainer not assigned to gym", { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Shift checkins (visits to this gym today logged by this trainer? 
    // Wait, the VisitLog doesn't currently track WHICH trainer logged it. 
    // It only tracks userId and gymId.
    // Let's assume shift checkins is total today for this gym for now, 
    // or we'd need to update the VisitLog schema.)
    
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
  } catch (error) {
    console.error("[TRAINER_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
