import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

type CartItemInput = { productId: string; qty: number };

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const userId = (session.user as any).id as string | undefined;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = (await req.json()) as unknown;
    const itemsRaw = (body as any)?.items as unknown;
    if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
      return new NextResponse("Missing items", { status: 400 });
    }

    const items: CartItemInput[] = itemsRaw
      .map((x) => {
        const productId = typeof (x as any)?.productId === "string" ? (x as any).productId : "";
        const qtyNum = Number((x as any)?.qty);
        const qty = Number.isFinite(qtyNum) ? Math.max(1, Math.floor(qtyNum)) : 1;
        return productId ? { productId, qty } : null;
      })
      .filter(Boolean) as CartItemInput[];

    if (items.length === 0) return new NextResponse("Missing items", { status: 400 });

    const ids = Array.from(new Set(items.map((i) => i.productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, price: true, stock: true },
    });

    const byId = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const orderItems = items.map((i) => {
      const p = byId.get(i.productId);
      if (!p) throw new Error(`Product not found: ${i.productId}`);
      if (p.stock < i.qty) throw new Error(`Insufficient stock for: ${p.name}`);
      const lineTotal = p.price * i.qty;
      totalAmount += lineTotal;
      return {
        productId: p.id,
        name: p.name,
        price: p.price,
        qty: i.qty,
        lineTotal,
      };
    });

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await prisma.$transaction(async (tx) => {
      // Create the DB order first
      const dbOrder = await tx.order.create({
        data: {
          userId,
          items: orderItems,
          totalAmount,
          status: "PENDING",
        },
      });

      // Create Razorpay order
      const rzpOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100), // in paisa
        currency: "INR",
        receipt: dbOrder.id,
        notes: {
          orderId: dbOrder.id,
          userId,
          type: "SHOP_ORDER",
        },
      });

      return { dbOrder, rzpOrder };
    });

    return NextResponse.json({
      orderId: order.dbOrder.id,
      rzpOrderId: order.rzpOrder.id,
      amount: order.rzpOrder.amount,
      currency: order.rzpOrder.currency,
    });
  } catch (error: any) {
    console.error("[ORDERS_POST]", error);
    const msg = typeof error?.message === "string" ? error.message : "Internal Error";
    let status = 400;
    if (msg.includes("Unauthorized")) status = 401;
    if (msg.includes("not found")) status = 404;
    
    return NextResponse.json({ error: msg }, { status });
  }
}

