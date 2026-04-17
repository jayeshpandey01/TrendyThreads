import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tokens } = await req.json();
    if (!tokens || tokens <= 0) {
      return NextResponse.json({ error: "Invalid token count" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const amount = tokens * 50; // 1 token = ₹50

    const order = await razorpay.orders.create({
      amount: amount * 100, // amount in paisa
      currency: "INR",
      receipt: `token_buy_${Date.now()}`,
      notes: {
        userId,
        tokens,
        type: "TOKEN_PURCHASE",
      },
    });

    // Create a pending transaction in our DB
    await prisma.tokenTransaction.create({
      data: {
        userId,
        amount,
        tokens,
        status: "PENDING",
        razorpayOrderId: order.id,
      },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("[TOKENS_BUY_POST]", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
