import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isAdminEmail, isAdminPassword } from "@/lib/admin";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.trim().toLowerCase() ?? "";
          const password = credentials?.password ?? "";

          console.log(`[AUTH] Login attempt for: "${email}"`);
          
          const adminEmailsStr = process.env.ADMIN_EMAILS ?? "";
          console.log(`[AUTH] ADMIN_EMAILS from env: "${adminEmailsStr}"`);
          
          const isEmailAdmin = isAdminEmail(email);
          const isPasswordAdmin = isAdminPassword(password);
          console.log(`[AUTH] isEmailAdmin: ${isEmailAdmin}, isPasswordAdmin: ${isPasswordAdmin}`);

          // 1. Check if this is a "Super Admin" from .env
          if (isEmailAdmin && isPasswordAdmin) {
            console.log("[AUTH] Admin check passed. Checking/Creating in DB...");
            try {
              let user = await prisma.user.findUnique({ where: { email } });
              
              if (!user) {
                console.log("[AUTH] Admin not found in DB, auto-provisioning...");
                user = await prisma.user.create({
                  data: {
                    email,
                    name: "System Admin",
                    role: "ADMIN",
                  }
                });
                console.log("[AUTH] Admin auto-provisioned successfully");
              } else {
                console.log("[AUTH] Admin found in DB");
              }

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: "ADMIN",
              };
            } catch (dbError) {
              console.error("[AUTH] Database error during admin check/provisioning:", dbError);
              throw new Error("Internal Server Error (DB)");
            }
          }

          // 2. Regular User Authentication
          console.log("[AUTH] Proceeding with regular user authentication...");
          try {
            const user = await prisma.user.findUnique({
              where: { email },
            });

            if (!user) {
              console.log("[AUTH] User not found");
              throw new Error("Invalid credentials");
            }

            if (!user.password) {
              console.log("[AUTH] User found but has no password (likely OAuth user)");
              throw new Error("Invalid credentials");
            }

            const isValid = await bcrypt.compare(password, user.password);
            console.log(`[AUTH] Password valid: ${isValid}`);

            if (!isValid) {
              throw new Error("Invalid credentials");
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          } catch (dbError) {
            console.error("[AUTH] Database error during user authentication:", dbError);
            if ((dbError as any).message === "Invalid credentials") throw dbError;
            throw new Error("Internal Server Error (DB)");
          }
        } catch (error) {
          console.error("[AUTH] Authorize error:", error);
          return null; // NextAuth expects null for failed auth
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
      }
      
      // Handle update() calls
      if (trigger === "update") {
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        }
      }

      // Fallback for missing role
      if (!token.role && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        } else if (isAdminEmail(token.email as string)) {
          token.role = "ADMIN";
        } else {
          token.role = "USER";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
};
