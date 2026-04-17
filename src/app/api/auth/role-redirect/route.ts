import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getDashboardPath } from "@/lib/dashboard-path";
import { NextResponse } from "next/server";

/**
 * After Google OAuth login, this route checks the user's role
 * and redirects them to the correct dashboard.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const path = getDashboardPath(role);

  // Use a 307 redirect to the correct dashboard
  return NextResponse.redirect(new URL(path, process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
