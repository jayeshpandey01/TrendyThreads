import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      type,
    } = await req.json();

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (type === "TOKEN_PURCHASE") {
      // Handle token purchase verification
      const tokenTx = await prisma.tokenTransaction.findUnique({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (!tokenTx || tokenTx.status !== "PENDING") {
        return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.tokenTransaction.update({
          where: { id: tokenTx.id },
          data: {
            status: "SUCCESS",
            razorpayPaymentId: razorpay_payment_id,
          },
        }),
        prisma.user.update({
          where: { id: tokenTx.userId },
          data: { tokenBalance: { increment: tokenTx.tokens } },
        }),
      ]);

      return NextResponse.json({ 
        success: true, 
        message: `${tokenTx.tokens} tokens added!`,
        tokens: tokenTx.tokens,
      });
    }

    if (type === "SHOP_ORDER") {
      // Handle shop order verification
      // Find order by exact Razorpay order ID
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId: razorpay_order_id },
      });

      if (!order || order.status !== "PENDING") {
        return NextResponse.json({ error: "Order not found or already paid" }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { 
          status: "PAID",
          razorpayPaymentId: razorpay_payment_id,
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: "Order placed successfully!",
      });
    }

    return NextResponse.json({ error: "Unknown payment type" }, { status: 400 });
  } catch (error: any) {
    console.error("[VERIFY_PAYMENT]", error);
    return NextResponse.json({ error: error?.message || "Internal Error" }, { status: 500 });
  }
}
