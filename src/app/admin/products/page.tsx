"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProductRow = {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
  createdAt: string;
};

export default function AdminProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchProducts = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/products?sort=newest");
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as unknown;
      setProducts(Array.isArray(data) ? (data as ProductRow[]) : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => (p.name ?? "").toLowerCase().includes(s) || (p.category ?? "").toLowerCase().includes(s));
  }, [products, q]);

  const seed = async () => {
    setSeeding(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: true, gyms: false }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchProducts();
    } catch (e: any) {
      setErr(e?.message ?? "Seed failed");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tighter">
            Products <span className="text-neon-lime">Catalog</span>
          </div>
          <div className="text-white/45 text-sm">Seed sample products and verify shop listing.</div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5" onClick={fetchProducts}>
            Refresh
          </Button>
          <Button className="bg-neon-lime text-black font-bold" onClick={seed} disabled={seeding}>
            {seeding ? "Seeding..." : "Seed sample products"}
          </Button>
        </div>
      </div>

      <Input
        value={q}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        placeholder="Search products..."
        className="bg-white/5 border-white/10"
      />

      {err && <div className="text-sm text-red-400">{err}</div>}

      <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
          <div className="col-span-6">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2">Stock</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/30 text-sm">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-white/30 text-sm">No products found.</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-white/5 items-center">
              <div className="col-span-6 font-bold">{p.name}</div>
              <div className="col-span-2 text-sm text-white/60">{p.category ?? "-"}</div>
              <div className="col-span-2 text-sm font-black">₹{p.price}</div>
              <div className="col-span-2 text-sm font-black">{p.stock}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

