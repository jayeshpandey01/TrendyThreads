import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const payload = event.payload;

    if (event.event === "payment.captured") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      // Handle Token Purchase
      const tokenTx = await prisma.tokenTransaction.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (tokenTx && tokenTx.status === "PENDING") {
        await prisma.$transaction([
          prisma.tokenTransaction.update({
            where: { id: tokenTx.id },
            data: { 
                status: "SUCCESS",
                razorpayPaymentId: payment.id 
            },
          }),
          prisma.user.update({
            where: { id: tokenTx.userId },
            data: { tokenBalance: { increment: tokenTx.tokens } },
          }),
        ]);
        console.log(`Tokens credited to user ${tokenTx.userId}`);
      }

      // Handle E-commerce Order
      const order = await prisma.order.findFirst({
        where: { id: orderId }, // If order ID matches Razorpay order ID
      });
      
      // If order ID doesn't match, check if it was stored in notes
      const dbOrderId = payment.notes?.orderId;
      if (dbOrderId) {
        await prisma.order.update({
          where: { id: dbOrderId },
          data: { status: "PAID" },
        });
        console.log(`Order ${dbOrderId} marked as PAID`);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[RAZORPAY_WEBHOOK]", error);
    return NextResponse.json({ error: error?.message || "Internal Error" }, { status: 500 });
  }
}
