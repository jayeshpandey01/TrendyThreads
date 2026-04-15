import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertAdmin } from "../_auth";

export async function GET() {
  try {
    const auth = await assertAdmin();
    if (!auth.ok) return new NextResponse("Unauthorized", { status: 401 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tokenBalance: true,
        createdAt: true,
      },
      take: 200,
    });

    return NextResponse.json(users);
  } catch (e) {
    console.error("[ADMIN_USERS_GET]", e);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

