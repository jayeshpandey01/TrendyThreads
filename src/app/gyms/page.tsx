"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Star, 
  Dumbbell, 
  CheckCircle2, 
  Navigation 
} from "lucide-react";

type GymFromApi = {
  id: string;
  name: string;
  address: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  amenities: string[];
  contact?: string | null;
};

export default function GymsListPage() {
  const [search, setSearch] = useState("");
  const [gyms, setGyms] = useState<GymFromApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/gyms");
        if (!res.ok) throw new Error("Failed to load gyms");
        const data = (await res.json()) as unknown;
        if (!cancelled) setGyms(Array.isArray(data) ? (data as GymFromApi[]) : []);
      } catch (e) {
        console.error(e);
        if (!cancelled) setGyms([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredGyms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return gyms;
    return gyms.filter((g) => {
      return (
        g.name.toLowerCase().includes(q) ||
        g.address.toLowerCase().includes(q) ||
        (g.description ?? "").toLowerCase().includes(q) ||
        (g.amenities ?? []).some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [gyms, search]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-lime transition-colors" />
            <Input 
              placeholder="Search by city, name or landmark..." 
              className="pl-12 bg-white/5 border-white/10 h-14 focus:border-neon-lime/30 transition-all rounded-2xl"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {["All", "Nearby", "Top Rated", "Cardio", "Yoga"].map((cat) => (
              <Button key={cat} variant="ghost" className="rounded-full bg-white/5 border border-white/5 text-xs h-10 px-6 whitespace-nowrap hover:bg-neon-lime hover:text-black font-bold">
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 lg:p-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter mb-1 uppercase italic">Explore <span className="text-neon-lime">Facilities</span></h1>
            <p className="text-white/30 text-sm font-light">Find your perfect workout spot in Mumbai.</p>
          </div>
          <Button variant="outline" className="hidden sm:flex border-white/10 gap-2 bg-white/5">
            <Navigation size={16} className="text-neon-lime" /> Refresh Location
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-full text-center text-white/30 py-16 text-sm">
              Loading nearby gyms...
            </div>
          )}
          {!loading && filteredGyms.length === 0 && (
            <div className="col-span-full text-center text-white/30 py-16 text-sm">
              No gyms found.
            </div>
          )}
          {filteredGyms.map((gym) => (
            <div key={gym.id} className="group relative bg-[#111] rounded-3xl overflow-hidden border border-white/5 transition-all hover:border-neon-lime/30 hover:shadow-[0_0_30px_rgba(163,251,46,0.1)]">
              {/* Image Header */}
              <div className="h-56 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="w-10 h-10 text-white/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 flex gap-1.5">
                  {(gym.amenities ?? []).slice(0, 3).map((a) => (
                    <span key={a} className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 bg-neon-lime text-black rounded-sm">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold group-hover:text-neon-lime transition-colors leading-tight">{gym.name}</h3>
                  <div className="flex items-center gap-2 text-white/30 text-xs">
                    <MapPin size={12} />
                    <span>{gym.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-white/40">
                    <Navigation size={14} className="text-neon-lime/40" />
                    <span className="text-xs font-medium">View on map</span>
                  </div>
                  <Button size="sm" className="bg-white text-black hover:bg-neon-lime font-bold h-9 px-6 rounded-xl transition-all" asChild>
                    <Link href={`/gyms/${gym.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
