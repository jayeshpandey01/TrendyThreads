import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ScanQrCode,
  MapPin,
  TrendingUp,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import logo from "../../assest/Logo1.png";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-neon-lime selection:text-black">
      {/* Navigation */}
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
          <span className="text-xl font-bold tracking-tighter">Trendy <span className="text-neon-lime">Threads</span></span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/70">
          <Link className="hover:text-neon-lime transition-colors" href="#features">Features</Link>
          <Link className="hover:text-neon-lime transition-colors" href="/gyms">Nearby Gyms</Link>
          <Link className="hover:text-neon-lime transition-colors" href="/shop">Shop</Link>
        </nav>
        <div className="flex gap-4">
          <Button variant="ghost" asChild className="hidden sm:inline-flex hover:bg-white/5">
            <Link href="/login">Login</Link>
          </Button>
          <Button className="bg-neon-lime text-black hover:bg-neon-lime/90 font-bold" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-neon-lime/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          
          <div className="container px-4 md:px-6 relative">
            <div className="max-w-3xl mx-auto md:mx-0 text-left">
            <div className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6 border border-white/10">
              <span className="text-neon-lime">Scan.</span> Train. <span className="text-neon-lime">Succeed.</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-5 leading-[1.05]">
              Elevate your <span className="text-neon-lime italic">fitness</span> experience.
            </h1>
            <p className="max-w-[42rem] text-white/60 md:text-lg mb-10 leading-relaxed font-light">
              Trendy Threads connects gym owners, trainers, and athletes.
              Buy tokens, scan QR, and track your progress in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-neon-lime text-black hover:bg-neon-lime/90 shadow-[0_0_20px_rgba(163,251,46,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] duration-200" asChild>
                <Link href="/signup">Start Training Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm" asChild>
                <Link href="/register-gym">Register Your Gym</Link>
              </Button>
            </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-black/50 border-y border-white/5">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="group space-y-4">
                <div className="w-12 h-12 bg-neon-lime/10 rounded-xl flex items-center justify-center border border-neon-lime/20 group-hover:scale-110 transition-transform duration-300">
                  <ScanQrCode className="h-6 w-6 text-neon-lime" />
                </div>
                <h3 className="text-xl font-bold">Smart QR Access</h3>
                <p className="text-white/50 leading-relaxed">
                  No membership IDs needed. Simply scan your unique QR at any partner gym and start working out instantly.
                </p>
              </div>
              <div className="group space-y-4">
                <div className="w-12 h-12 bg-neon-lime/10 rounded-xl flex items-center justify-center border border-neon-lime/20 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-6 w-6 text-neon-lime" />
                </div>
                <h3 className="text-xl font-bold">Nearby Discover</h3>
                <p className="text-white/50 leading-relaxed">
                  Find the best gyms near you with our real-time map integration. Compare facilities, trainers, and prices.
                </p>
              </div>
              <div className="group space-y-4">
                <div className="w-12 h-12 bg-neon-lime/10 rounded-xl flex items-center justify-center border border-neon-lime/20 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-6 w-6 text-neon-lime" />
                </div>
                <h3 className="text-xl font-bold">Insights Dashboard</h3>
                <p className="text-white/50 leading-relaxed">
                  Visualize your workout frequency, token usage, and fitness streak with beautiful interactive charts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment & Security Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 space-y-8">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">
                  Safe. Secure. <br /> <span className="text-neon-lime">Simplified.</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1"><ShieldCheck className="text-neon-lime w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold">NextAuth Protection</h4>
                      <p className="text-white/50">Enterprise-grade authentication with Google & Credentials support.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="mt-1"><CreditCard className="text-neon-lime w-6 h-6" /></div>
                    <div>
                      <h4 className="font-bold">Razorpay Integrated</h4>
                      <p className="text-white/50">Seamless token purchases with 1-token = ₹50 transparent pricing.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Token Card Mockup */}
              <div className="lg:w-1/2 w-full max-w-md bg-gradient-to-br from-neon-lime/20 to-blue-600/20 p-[1px] rounded-2xl">
                <div className="bg-[#111] p-8 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Your Token Balance</p>
                      <h4 className="text-4xl font-black text-neon-lime">15 <span className="text-sm font-normal text-white/40">Tokens</span></h4>
                    </div>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                      <ScanQrCode className="w-8 h-8 text-white/20" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-neon-lime" />
                    </div>
                    <p className="text-xs text-white/30 text-center">Active workout session tracking enabled</p>
                  </div>
                  <Button className="w-full mt-8 bg-white text-black hover:bg-white/90">Add More Tokens</Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}




