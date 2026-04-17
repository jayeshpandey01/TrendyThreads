import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../assest/Logo1.png";

export default async function AdminLayout(props: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "";
  const ok = isAdminEmail(email);

  console.log(`[ADMIN_LAYOUT] Session:`, JSON.stringify(session));
  console.log(`[ADMIN_LAYOUT] Email: "${email}", isAdminEmail: ${ok}`);

  if (!ok) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111] border border-white/10 rounded-3xl p-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-neon-lime rounded-lg">
              <Image src={logo} alt="Trendy Threads" width={20} height={20} className="h-5 w-5 object-contain" />
            </div>
            <div className="text-xl font-black tracking-tighter uppercase italic">
              Trendy <span className="text-neon-lime">Threads</span>
            </div>
          </div>
          <div className="text-2xl font-black">Admin only</div>
          <div className="text-white/50 text-sm">
            Your account is not authorized for the admin panel.
          </div>
          <div className="pt-2">
            <Link href="/" className="text-neon-lime font-bold hover:underline">
              Go back home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="p-2 bg-neon-lime rounded-lg">
              <Image src={logo} alt="Trendy Threads" width={20} height={20} className="h-5 w-5 object-contain" />
            </div>
            <div className="text-lg font-black tracking-tighter uppercase italic">
              Admin <span className="text-neon-lime">Panel</span>
            </div>
          </Link>
          <nav className="flex gap-5 text-sm text-white/60">
            <Link className="hover:text-white" href="/admin/users">Users</Link>
            <Link className="hover:text-white" href="/admin/products">Products</Link>
            <Link className="hover:text-white" href="/admin/gyms">Gyms</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{props.children}</main>
    </div>
  );
}

