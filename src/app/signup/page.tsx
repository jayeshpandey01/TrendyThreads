"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getDashboardPath } from "@/lib/dashboard-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "../../../assest/Logo1.png";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        // Auto-login after successful registration
        const signInRes = await signIn("credentials", {
          email: data.email as string,
          password: data.password as string,
          redirect: false,
        });

        if (signInRes?.error) {
          router.push("/login?message=Registration successful. Please log in.");
        } else {
          // Fetch session directly to bypass client caching and get role
          const sessionRes = await fetch("/api/auth/session");
          const session = await sessionRes.json();
          const userRole = session?.user?.role || data.role;
          
          router.push(getDashboardPath(userRole as string));
          router.refresh();
        }
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Something went wrong");
      }
    } catch (err) {
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Decoration - Desktop Only */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#111] to-black relative items-center justify-center p-12 border-r border-white/5">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-lime/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 max-w-md space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-lime/10 border border-neon-lime/20 text-neon-lime text-xs font-bold uppercase tracking-wider">
            Join the community
          </div>
          <h1 className="text-6xl font-black tracking-tighter leading-none">
            UNLEASH <br /> 
            <span className="text-neon-lime italic">YOUR POWER.</span>
          </h1>
          <p className="text-white/40 text-lg leading-relaxed font-light">
            Register today and get access to the most advanced gym management and training network in the country.
          </p>
          <div className="flex -space-x-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="inline-block h-12 w-12 rounded-full ring-2 ring-black bg-[#222]" />
            ))}
            <div className="flex items-center justify-center h-12 px-4 rounded-full bg-white/5 border border-white/10 ring-2 ring-black text-xs font-medium text-white/50">
              500+ Athletes Joined
            </div>
          </div>
        </div>
      </div>

      {/* Right Content - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="mb-8 flex items-center justify-center gap-3 md:hidden">
            <Image src={logo} alt="Trendy Threads logo" width={32} height={32} className="h-8 w-8 rounded-md object-contain" priority />
            <span className="text-lg font-bold tracking-tighter leading-none">Trendy <span className="text-neon-lime">Threads</span></span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
            <p className="text-white/40 text-sm">Enter your details and choose your role to get started.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Full Name</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
                  <Input 
                    name="name" 
                    placeholder="John Doe" 
                    className="pl-10 bg-white/5 border-white/10 h-12 focus:border-neon-lime/50 transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Phone Number</Label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
                  <Input 
                    name="phone" 
                    placeholder="+91 00000 00000" 
                    className="pl-10 bg-white/5 border-white/10 h-12 focus:border-neon-lime/50 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
                <Input 
                  name="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  className="pl-10 bg-white/5 border-white/10 h-12 focus:border-neon-lime/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white/60 text-xs">Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
                <Input 
                  name="password" 
                  type="password" 
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                  className="pl-10 bg-white/5 border-white/10 h-12 focus:border-neon-lime/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">Account Role</Label>
                <Select name="role" defaultValue="USER">
                  <SelectTrigger className="bg-white/5 border-white/10 h-12 focus:border-neon-lime/50 text-white/80">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10 text-white">
                    <SelectItem value="USER">Customer</SelectItem>
                    <SelectItem value="OWNER">Gym Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white/60 text-xs">City / Location</Label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
                  <Input 
                    name="address" 
                    placeholder="Mumbai, MH" 
                    className="pl-10 bg-white/5 border-white/10 h-12 focus:border-neon-lime/50 transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-14 bg-neon-lime text-black hover:bg-neon-lime/90 font-black text-lg group shadow-[0_0_20px_rgba(163,251,46,0.2)]"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
              {!loading && <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>

            <p className="text-center text-sm text-white/40 pt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-neon-lime hover:underline font-bold">
                Log In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}




