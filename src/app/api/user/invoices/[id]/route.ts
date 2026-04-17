import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/invoice-generator";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    const transaction = await prisma.tokenTransaction.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!transaction || transaction.userId !== userId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (transaction.status !== "SUCCESS") {
        return NextResponse.json({ error: "Transaction not successful" }, { status: 400 });
    }

    // Prepare Invoice Data
    const totalAmount = transaction.amount;
    const gstRate = 0.18;
    const gstAmount = totalAmount - (totalAmount / (1 + gstRate));

    const invoiceData = {
      invoiceNumber: `INV-${transaction.id.slice(-8).toUpperCase()}`,
      date: new Date(transaction.createdAt).toLocaleDateString("en-IN"),
      customerName: transaction.user.name || "Customer",
      customerEmail: transaction.user.email || "",
      items: [
        {
          description: `${transaction.tokens} Gym Session Tokens`,
          quantity: 1,
          unitPrice: totalAmount - gstAmount,
          amount: totalAmount - gstAmount,
        }
      ],
      totalAmount: totalAmount,
      gstAmount: gstAmount,
    };

    const pdfBuffer = await generateInvoicePDF(invoiceData);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${invoiceData.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[INVOICE_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
