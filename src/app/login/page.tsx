"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import logo from "../../../assest/Logo1.png";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const message = searchParams.get("message");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 relative z-10">
      <div className="flex flex-col items-center text-center space-y-2">
        <Link href="/" className="mb-6 inline-flex items-center justify-center gap-3">
          <Image src={logo} alt="Trendy Threads logo" width={36} height={36} className="h-9 w-9 rounded-md object-contain" priority />
          <span className="text-2xl font-black tracking-tighter leading-none">Trendy <span className="text-neon-lime">Threads</span></span>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
        <p className="text-white/40 text-sm italic">"The only bad workout is the one that didn't happen."</p>
      </div>

      {message && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-neon-lime/10 border border-neon-lime/20 text-neon-lime text-sm font-medium">
          <AlertCircle size={18} />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
              <Input 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                className="pl-10 bg-white/5 border-white/10 h-14 focus:border-neon-lime/50 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-white/60 text-xs font-bold uppercase tracking-wider">Password</Label>
              <Link href="#" className="text-xs text-white/30 hover:text-white transition-colors">Forgot password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
              <Input 
                name="password" 
                type="password" 
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                className="pl-10 bg-white/5 border-white/10 h-14 focus:border-neon-lime/50 transition-colors"
                required
              />
            </div>
          </div>
        </div>

        <Button 
          variant="neon"
          className="w-full h-14 font-black text-lg group"
          disabled={loading}
        >
          {loading ? "Authenticating..." : "Sign In"}
          {!loading && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
        </Button>

        <Button 
          variant="outline" 
          type="button" 
          className="w-full h-14 border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
          Continue with Google
        </Button>

        <p className="text-center text-sm text-white/40 pt-4">
          Don't have an account?{" "}
          <Link href="/signup" className="text-neon-lime hover:underline font-bold">
            Sign Up for Free
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 relative">
      {/* Background Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-lime/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl opacity-30 pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-neon-lime/10 rounded-xl animate-pulse">
            <Image src={logo} alt="Trendy Threads logo" width={48} height={48} className="h-12 w-12 rounded-md object-contain" />
          </div>
          <p className="text-white/40 animate-pulse">Loading secure login...</p>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}





