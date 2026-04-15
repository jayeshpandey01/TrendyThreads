"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Star, 
  ShoppingCart, 
  ChevronRight,
  TrendingDown,
  Flame,
  Plus,
  X,
  Minus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { loadCart, saveCart, type CartItem } from "@/lib/cart";
import logo from "../../../assest/Logo1.png";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string | null;
  stock: number;
  createdAt: string;
};

const CATEGORIES = ["All Products", "Supplements", "Equipment", "Apparel", "Accessories"] as const;
type Sort = "newest" | "price_asc" | "price_desc";

export default function ShopPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All Products");
  const [sort, setSort] = useState<Sort>("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingProducts(true);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (category !== "All Products") params.set("category", category);
        params.set("sort", sort);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load products");
        const data = (await res.json()) as unknown;
        const list = Array.isArray(data) ? (data as Product[]) : [];
        if (!cancelled) setProducts(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    const t = window.setTimeout(run, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q, category, sort]);

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);

  const productsById = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const cartLines = useMemo(() => {
    return cart
      .map((i) => {
        const p = productsById.get(i.productId);
        if (!p) return null;
        return { item: i, product: p, lineTotal: p.price * i.qty };
      })
      .filter(Boolean) as { item: CartItem; product: Product; lineTotal: number }[];
  }, [cart, productsById]);

  const cartSubtotal = useMemo(() => cartLines.reduce((s, l) => s + l.lineTotal, 0), [cartLines]);

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.productId === productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + 1) };
        return next;
      }
      return [...prev, { productId, qty: 1 }];
    });
    setCartOpen(true);
  };

  const setQty = (productId: string, qty: number) => {
    setCart((prev) => {
      const q2 = Math.max(1, Math.min(99, Math.floor(qty)));
      return prev.map((x) => (x.productId === productId ? { ...x, qty: q2 } : x));
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((x) => x.productId !== productId));
  };

  const checkout = async () => {
    setCheckoutError(null);
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Checkout failed");
      }
      setCart([]);
      setCartOpen(false);
    } catch (e: any) {
      console.error(e);
      setCheckoutError(e?.message ?? "Checkout failed");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Shop Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 h-24 px-6 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="p-2 bg-neon-lime rounded-lg group-hover:rotate-12 transition-transform">
            <Image src={logo} alt="Trendy Threads logo" width={20} height={20} className="h-5 w-5 object-contain" priority />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">Trendy <span className="text-neon-lime font-bold">Threads</span></span>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
           <Input
             placeholder="Search supplements, gear..."
             className="pl-12 bg-white/5 border-white/10 h-12 rounded-full focus:border-neon-lime/30"
             value={q}
             onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
           />
        </div>

        <div className="flex items-center gap-6">
           <Button
             variant="ghost"
             className="relative p-2 hover:bg-white/5"
             onClick={() => setCartOpen(true)}
           >
              <ShoppingCart size={24} className="text-white/60" />
              <Badge className="absolute -top-1 -right-1 bg-neon-lime text-black font-bold h-5 w-5 flex items-center justify-center p-0 rounded-full border-2 border-black">
                {cartCount}
              </Badge>
           </Button>
           <Button variant="ghost" className="hidden sm:flex text-white/40 text-xs font-bold uppercase tracking-widest hover:text-white">
              My Orders <ChevronRight size={14} className="ml-1" />
           </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Banner */}
        <div className="w-full h-80 rounded-[2.5rem] bg-gradient-to-br from-neon-lime via-neon-lime/80 to-blue-500 overflow-hidden relative mb-16 shadow-2xl">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 p-12 flex flex-col justify-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-neon-lime text-[10px] font-black uppercase tracking-widest rounded-full w-max mb-6">
                Limited Edition Drop <Flame size={12} className="fill-neon-lime" />
             </div>
             <h2 className="text-black text-5xl md:text-6xl font-black tracking-tighter mb-4 leading-[0.9]">TRAIN LIKE <br /> A PRO.</h2>
             <p className="text-black/60 font-medium max-w-sm">Shop our curated collection of professional gym gear and elite supplements.</p>
          </div>
          <div className="absolute right-12 bottom-0 top-0 hidden lg:flex items-center">
             <ShoppingBag size={200} className="text-black/5 -rotate-12" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-8 mb-12 scrollbar-hide">
           {CATEGORIES.map((cat) => {
             const active = cat === category;
             return (
               <Button
                 key={cat}
                 variant="ghost"
                 onClick={() => setCategory(cat)}
                 className={`rounded-full h-12 px-8 text-sm font-bold border ${
                   active
                     ? "bg-neon-lime text-black border-neon-lime"
                     : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
                 }`}
               >
                 {cat}
               </Button>
             );
           })}
          <div className="ml-auto hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className={`rounded-full h-12 px-6 text-sm font-bold border ${
                sort === "newest"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
              }`}
              onClick={() => setSort("newest")}
            >
              <Flame className="mr-2 h-4 w-4" />
              New
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full h-12 px-6 text-sm font-bold border ${
                sort === "price_asc"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
              }`}
              onClick={() => setSort("price_asc")}
            >
              <TrendingDown className="mr-2 h-4 w-4" />
              Price ↑
            </Button>
            <Button
              variant="ghost"
              className={`rounded-full h-12 px-6 text-sm font-bold border ${
                sort === "price_desc"
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:border-white/20"
              }`}
              onClick={() => setSort("price_desc")}
            >
              <Filter className="mr-2 h-4 w-4" />
              Price ↓
            </Button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {loadingProducts && (
             <div className="col-span-full text-center text-white/30 py-16 text-sm">
               Loading products...
             </div>
           )}
           {!loadingProducts && products.length === 0 && (
             <div className="col-span-full text-center text-white/30 py-16 text-sm">
               No products found.
             </div>
           )}
           {products.map((prod) => (
              <div key={prod.id} className="group flex flex-col space-y-4">
                 <div className="aspect-[4/5] bg-[#111] rounded-3xl overflow-hidden relative border border-white/5 group-hover:border-neon-lime/30 transition-all duration-300">
                    {prod.images?.[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 to-black/40">
                        <ShoppingBag className="w-16 h-16 text-white/15" />
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-300">
                       <Button
                         className="bg-neon-lime text-black h-12 w-12 rounded-2xl shadow-xl p-0"
                         onClick={() => addToCart(prod.id)}
                       >
                          <Plus />
                       </Button>
                    </div>
                 </div>
                 
                 <div className="space-y-1 px-2">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                            {prod.category ?? "Product"}
                          </p>
                          <h4 className="font-bold text-lg group-hover:text-neon-lime transition-colors">{prod.name}</h4>
                       </div>
                       <div className="flex items-center gap-2 text-white/25 text-xs font-bold">
                         <span>{prod.stock > 0 ? `${prod.stock} in stock` : "Out of stock"}</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                       <span className="text-2xl font-black text-white">₹{prod.price}</span>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* Secondary Banner */}
        <div className="mt-24 bg-[#111] rounded-[2.5rem] p-12 lg:p-20 border border-white/5 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-96 h-96 bg-neon-lime/5 rounded-full blur-3xl" />
           <div className="max-w-xl space-y-6 relative z-10 text-center lg:text-left mx-auto lg:mx-0">
              <h3 className="text-4xl md:text-5xl font-black tracking-tighter italic">UNLOCK PREMIUM <br /> <span className="text-neon-lime">MERCHANDISE.</span></h3>
              <p className="text-white/40 text-lg">Use your Trendy Threads tokens to get exclusive discounts on our collection.</p>
              <Button size="lg" className="bg-neon-lime text-black font-black hover:scale-105 transition-transform h-14 px-10 rounded-2xl">
                Explore The Collection
              </Button>
           </div>
        </div>
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100]">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
          />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-[#0b0b0b] border-l border-white/10 shadow-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="text-lg font-black tracking-tighter uppercase italic">
                Your <span className="text-neon-lime">Cart</span>
              </div>
              <Button variant="ghost" className="p-2 hover:bg-white/5" onClick={() => setCartOpen(false)}>
                <X className="h-5 w-5 text-white/60" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto py-5 space-y-4">
              {cartLines.length === 0 ? (
                <div className="text-center text-white/30 py-16 text-sm">
                  Cart is empty. Add something from the shop.
                </div>
              ) : (
                cartLines.map(({ item, product, lineTotal }) => (
                  <div key={item.productId} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-7 h-7 text-white/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold truncate">{product.name}</div>
                          <div className="text-[11px] text-white/35">{product.category ?? "Product"}</div>
                        </div>
                        <button
                          className="text-white/35 hover:text-white transition-colors"
                          onClick={() => removeFromCart(item.productId)}
                          aria-label="Remove item"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            className="h-9 w-9 rounded-xl bg-black/40 hover:bg-black/60 p-0"
                            onClick={() => setQty(item.productId, item.qty - 1)}
                          >
                            <Minus className="h-4 w-4 text-white/70" />
                          </Button>
                          <div className="w-10 text-center font-black">{item.qty}</div>
                          <Button
                            variant="ghost"
                            className="h-9 w-9 rounded-xl bg-black/40 hover:bg-black/60 p-0"
                            onClick={() => setQty(item.productId, item.qty + 1)}
                          >
                            <Plus className="h-4 w-4 text-white/70" />
                          </Button>
                        </div>
                        <div className="font-black">₹{lineTotal}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 pt-5 space-y-3">
              {checkoutError && <div className="text-xs text-red-400">{checkoutError}</div>}
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Subtotal</span>
                <span className="font-black text-white">₹{cartSubtotal}</span>
              </div>
              <Button
                className="w-full h-12 bg-neon-lime text-black hover:bg-neon-lime/90 font-black rounded-2xl"
                disabled={checkingOut || cart.length === 0}
                onClick={checkout}
              >
                {checkingOut ? "Placing order..." : (
                  <>
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="text-[10px] text-white/25 text-center uppercase tracking-widest">
                Orders are saved to your account
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


