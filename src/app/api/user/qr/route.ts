import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { generateSignedQR } from "@/lib/qr-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const signedQR = generateSignedQR(userId);

    return NextResponse.json({ qrString: signedQR });
  } catch (error) {
    console.error("[QR_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
