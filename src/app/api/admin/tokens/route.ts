import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "../_auth";

export async function POST(req: Request) {
  try {
    const auth = await assertAdmin();
    if (!auth.ok) return new NextResponse("Unauthorized", { status: 401 });

    const body = (await req.json()) as any;
    const userId = typeof body?.userId === "string" ? body.userId : "";
    const amountNum = Number(body?.amount);
    const amount = Number.isFinite(amountNum) ? Math.floor(amountNum) : 0;

    if (!userId || amount <= 0) {
      return new NextResponse("Missing userId/amount", { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { tokenBalance: { increment: amount } },
      select: { id: true, tokenBalance: true },
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("[ADMIN_TOKENS_POST]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

