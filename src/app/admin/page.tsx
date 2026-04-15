import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="text-3xl font-black tracking-tighter">
          Manage <span className="text-neon-lime">Everything</span>
        </div>
        <div className="text-white/45 text-sm">
          Seed sample data, add tokens to users, and maintain products and gyms.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#111] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-white/40 text-sm">Add sample tokens to a user.</div>
            <Button className="w-full bg-neon-lime text-black font-bold" asChild>
              <Link href="/admin/users">Open Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-white/40 text-sm">Seed sample products for shop.</div>
            <Button className="w-full bg-neon-lime text-black font-bold" asChild>
              <Link href="/admin/products">Open Products</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Gyms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-white/40 text-sm">Seed sample gyms and view on Google Maps.</div>
            <Button className="w-full bg-neon-lime text-black font-bold" asChild>
              <Link href="/admin/gyms">Open Gyms</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

