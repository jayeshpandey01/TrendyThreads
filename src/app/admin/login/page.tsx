"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardPath } from "@/lib/dashboard-path";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "../../../../assest/Logo1.png";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid admin email or password");
    } else {
      const session = await getSession();
      const role = (session?.user as any)?.role;
      router.push(getDashboardPath(role));
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-lime rounded-lg">
            <Image src={logo} alt="Trendy Threads" width={20} height={20} className="h-5 w-5 object-contain" />
          </div>
          <div className="text-xl font-black tracking-tighter uppercase italic">
            Trendy <span className="text-neon-lime">Threads</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tighter">
            Admin <span className="text-neon-lime">Login</span>
          </div>
          <div className="text-white/45 text-sm">
            Use your admin email + admin password to continue.
          </div>
        </div>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Admin Email</Label>
            <Input name="email" type="email" required className="bg-white/5 border-white/10 h-12" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/60 text-xs font-bold uppercase tracking-widest">Admin Password</Label>
            <Input name="password" type="password" required className="bg-white/5 border-white/10 h-12" />
          </div>
          <Button className="w-full h-12 bg-neon-lime text-black font-black" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

