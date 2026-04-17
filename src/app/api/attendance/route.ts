import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifySignedQR } from "@/lib/qr-service";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId: incomingData, gymId: manualGymId } = await req.json().catch(() => ({}));

    if (!incomingData) {
      return NextResponse.json({ error: "Missing scan data" }, { status: 400 });
    }

    const role = (session.user as any).role;
    if (role === "USER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to verify if it's a signed QR string
    let userId = incomingData;
    const verified = verifySignedQR(incomingData);
    
    if (verified) {
      userId = verified.userId;
    } else {
      // If it's not a valid signed QR, check if the role is allowed to pass raw userId
      // Only ADMIN should be allowed to manually enter/scan raw userIds for testing
      if (role !== "ADMIN") {
        return NextResponse.json({ error: "Invalid or expired QR code" }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.tokenBalance <= 0) {
      return NextResponse.json({ error: "Insufficient tokens" }, { status: 400 });
    }

    // Get gymId for the trainer/owner/admin
    let gymId = "";
    if (role === "ADMIN") {
      // Admin can specify a gymId, or we use the first one if not provided
      if (manualGymId) {
        gymId = manualGymId;
      } else {
        const firstGym = await prisma.gym.findFirst({ select: { id: true } });
        if (!firstGym) return NextResponse.json({ error: "No gyms found" }, { status: 404 });
        gymId = firstGym.id;
      }
    } else if (role === "OWNER") {
      const gym = await prisma.gym.findUnique({
        where: { ownerId: (session.user as any).id },
        select: { id: true },
      });
      if (!gym) return NextResponse.json({ error: "Gym not found" }, { status: 404 });
      gymId = gym.id;
    } else if (role === "TRAINER") {
      const trainer = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { gymId: true },
      });
      if (!trainer?.gymId) return NextResponse.json({ error: "Trainer not assigned to gym" }, { status: 404 });
      gymId = trainer.gymId;
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 401 });
    }

    // Deduct token and log visit
    const updatedUser = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { tokenBalance: { decrement: 1 } },
      }),
      prisma.visitLog.create({
        data: {
          userId,
          gymId,
          tokensDeducted: 1,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      userName: updatedUser[0].name,
      tokenBalance: updatedUser[0].tokenBalance,
    });
  } catch (error: any) {
    console.error("[ATTENDANCE_POST]", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
