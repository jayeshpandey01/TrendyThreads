import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const proxy = withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    // Admin/Gym Owner only routes
    if (path.startsWith("/owner") && token?.role !== "OWNER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Trainer only routes (Owners and Admins also have access)
    if (path.startsWith("/trainer") && !["TRAINER", "OWNER", "ADMIN"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Admin-only routes (email allowlist or role)
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      if (path === "/admin/login") return;
      const email = typeof token?.email === "string" ? token.email.toLowerCase() : "";
      const isAdmin = token?.role === "ADMIN" || (!!email && adminEmails.includes(email));
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // User/Customer only routes
    if (path.startsWith("/dashboard") && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        if (path === "/admin/login") return true;
        // Allow public API routes if needed, or protect all /api/admin
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/owner/:path*", 
    "/trainer/:path*", 
    "/admin/:path*",
    "/api/admin/:path*"
  ],
};
