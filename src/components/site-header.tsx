"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import logo from "../../assest/Logo1.png";
import { LogOut, LayoutDashboard } from "lucide-react";

export function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="px-6 lg:px-10 h-20 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <Link className="inline-flex items-center justify-center gap-3 group" href="/">
        <Image
          src={logo}
          alt="Trendy Threads logo"
          width={32}
          height={32}
          className="h-8 w-8 rounded-md object-contain"
          priority
        />
        <span className="text-xl font-bold tracking-tighter">
          Trendy <span className="text-neon-lime">Threads</span>
        </span>
      </Link>
      <nav className="hidden md:flex gap-8 text-sm font-medium text-white/70">
        <Link className="hover:text-neon-lime transition-colors" href="/#features">
          Features
        </Link>
        <Link className="hover:text-neon-lime transition-colors" href="/gyms">
          Nearby Gyms
        </Link>
        <Link className="hover:text-neon-lime transition-colors" href="/shop">
          Shop
        </Link>
        <Link className="hover:text-neon-lime transition-colors" href="/chatbot">
          AI Coach
        </Link>
      </nav>
      <div className="flex gap-4">
        {status === "authenticated" ? (
          <>
            <Button variant="ghost" asChild className="hidden sm:inline-flex hover:bg-white/5 text-white/70 hover:text-white">
              <Link href="/dashboard" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </Button>
            <Button 
                variant="ghost" 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden sm:inline-flex hover:bg-red-500/10 text-red-500 hover:text-red-400"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" asChild className="hidden sm:inline-flex hover:bg-white/5">
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-neon-lime text-black hover:bg-neon-lime/90 font-bold" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
