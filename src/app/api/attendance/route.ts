import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role === "USER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = await req.json();

    if (!userId) {
      return new NextResponse("Missing userId", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.tokenBalance <= 0) {
      return new NextResponse("Insufficient tokens", { status: 400 });
    }

    // Get gymId for the trainer/owner
    let gymId = "";
    if ((session.user as any).role === "OWNER") {
      const gym = await prisma.gym.findUnique({
        where: { ownerId: (session.user as any).id },
      });
      if (!gym) return new NextResponse("Gym not found", { status: 404 });
      gymId = gym.id;
    } else {
      // Role is TRAINER
      const trainer = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
      });
      if (!trainer?.gymId) return new NextResponse("Trainer not assigned to gym", { status: 404 });
      gymId = trainer.gymId;
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
  } catch (error) {
    console.error("[ATTENDANCE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
