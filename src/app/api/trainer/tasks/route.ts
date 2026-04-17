import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || (session.user as any).role !== "TRAINER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainerId = (session.user as any).id;
    const body = await req.json();
    const { userId, title, description } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        trainerId,
        userId,
        title,
        description,
      }
    });

    return NextResponse.json(task);
  } catch (error: any) {
    console.error("[TASK_POST]", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      const body = await req.json();
      const { taskId, isCompleted } = body;
  
      const task = await prisma.task.update({
        where: { id: taskId },
        data: { isCompleted }
      });
  
      return NextResponse.json(task);
    } catch (error: any) {
      console.error("[TASK_PUT]", error);
      return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}
