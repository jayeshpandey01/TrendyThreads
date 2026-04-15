import Link from "next/link";
import Image from "next/image";
import logo from "../../assest/Logo1.png";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-lime rounded-lg">
                <Image
                  src={logo}
                  alt="Trendy Threads logo"
                  width={20}
                  height={20}
                  className="h-5 w-5 object-contain"
                />
              </div>
              <div className="text-lg font-black tracking-tighter uppercase italic">
                Trendy <span className="text-neon-lime">Threads</span>
              </div>
            </div>
            <div className="text-sm text-white/40 max-w-md">
              Gym discovery, QR access, tokens, and shop—built for modern fitness communities.
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                Explore
              </div>
              <div className="space-y-2 text-white/60">
                <Link className="block hover:text-white" href="/gyms">Nearby Gyms</Link>
                <Link className="block hover:text-white" href="/shop">Shop</Link>
                <Link className="block hover:text-white" href="/dashboard">Dashboard</Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                Account
              </div>
              <div className="space-y-2 text-white/60">
                <Link className="block hover:text-white" href="/login">Login</Link>
                <Link className="block hover:text-white" href="/signup">Sign up</Link>
                <Link className="block hover:text-white" href="/register-gym">Register gym</Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                Legal
              </div>
              <div className="space-y-2 text-white/60">
                <Link className="block hover:text-white" href="#">Privacy</Link>
                <Link className="block hover:text-white" href="#">Terms</Link>
                <Link className="block hover:text-white" href="#">Support</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-white/35">
          <div>© {new Date().getFullYear()} Trendy Threads. All rights reserved.</div>
          <div className="uppercase tracking-widest">Designed for peak performance</div>
        </div>
      </div>
    </footer>
  );
}

