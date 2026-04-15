"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GymRow = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  contact: string | null;
};

export default function AdminGymsPage() {
  const [loading, setLoading] = useState(true);
  const [gyms, setGyms] = useState<GymRow[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchGyms = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/gyms");
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as unknown;
      setGyms(Array.isArray(data) ? (data as GymRow[]) : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load gyms");
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return gyms;
    return gyms.filter((g) => g.name.toLowerCase().includes(s) || g.address.toLowerCase().includes(s));
  }, [gyms, q]);

  const seed = async () => {
    setSeeding(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: false, gyms: true }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchGyms();
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
            Gyms <span className="text-neon-lime">Directory</span>
          </div>
          <div className="text-white/45 text-sm">
            Seed sample gyms and open them in Google Maps.
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 bg-white/5" onClick={fetchGyms}>
            Refresh
          </Button>
          <Button className="bg-neon-lime text-black font-bold" onClick={seed} disabled={seeding}>
            {seeding ? "Seeding..." : "Seed sample gyms"}
          </Button>
        </div>
      </div>

      <Input
        value={q}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
        placeholder="Search gyms..."
        className="bg-white/5 border-white/10"
      />

      {err && <div className="text-sm text-red-400">{err}</div>}

      {loading ? (
        <div className="p-10 text-center text-white/30 text-sm">Loading gyms...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-white/30 text-sm">No gyms found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((g) => (
            <div key={g.id} className="bg-[#111] border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="space-y-1">
                <div className="text-xl font-black tracking-tight">{g.name}</div>
                <div className="text-sm text-white/45">{g.address}</div>
                {g.contact && <div className="text-sm text-white/35">{g.contact}</div>}
              </div>

              <div className="flex flex-wrap gap-2">
                {(g.amenities ?? []).slice(0, 6).map((a) => (
                  <span key={a} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    {a}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-white/50">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Lat</div>
                  <div className="font-mono text-white/70">{g.latitude}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Lng</div>
                  <div className="font-mono text-white/70">{g.longitude}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-neon-lime text-black font-bold"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps?q=${g.latitude},${g.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Google Maps
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="border-white/10 bg-white/5"
                  asChild
                >
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.name + " " + g.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Search
                  </a>
                </Button>
              </div>

              <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/40">
                <iframe
                  title={`map-${g.id}`}
                  className="w-full h-56"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?output=embed&q=${g.latitude},${g.longitude}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

