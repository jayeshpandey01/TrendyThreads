"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Dumbbell, 
  Camera, 
  ArrowLeft, 
  Save, 
  CheckCircle2,
  Sparkles,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";

const AMENITIES = ["Cardio", "Weights", "Yoga", "Zumba", "Steam", "Showers", "Parking", "Cafeteria"] as const;
type Amenity = (typeof AMENITIES)[number];

export default function RegisterGymPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  const photoPreviews = useMemo(() => {
    return photos.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos]);

  const { update } = useSession();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // In a real app, we'd handle lat/long from a map picker
    const finalData = {
      ...data,
      latitude: 19.0760, // Mock Mumbai lat
      longitude: 72.8777, // Mock Mumbai long
    };

    try {
      const res = await fetch("/api/gyms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (res.ok) {
        await update(); // Force update NextAuth session to get new OWNER role
        setSuccess(true);
        setTimeout(() => router.push("/owner"), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-neon-lime/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-lime/20 shadow-[0_0_40px_rgba(163,251,46,0.12)]">
            <CheckCircle2 className="w-10 h-10 text-neon-lime" />
          </div>
          <h1 className="text-3xl font-bold text-white">Gym Registered Successfully!</h1>
          <p className="text-white/40">Redirecting you to your owner dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Banner */}
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f] via-black to-black" />
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-neon-lime/10 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-6 py-10 lg:py-14">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Back
            </Link>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-white/40 uppercase tracking-widest">
              <Sparkles className="h-4 w-4 text-neon-lime/80" />
              Get discovered by nearby members
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              Register your <span className="text-neon-lime italic">Gym</span>
            </h1>
            <p className="text-white/45 max-w-2xl">
              Add your facility details so users can find you in Nearby Gyms and trainers can log attendance.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-10 lg:py-14">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* General Info Card */}
            <div className="bg-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center">
                    <Building2 className="text-neon-lime" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Basic details</h3>
                    <p className="text-xs text-white/35">This is what users will see first.</p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-7">
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                    <Label className="text-white/60">Gym name</Label>
                <div className="relative">
                  <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input
                        name="name"
                        placeholder="Ultimate Fitness Hub"
                        className="pl-10 bg-white/5 border-white/10 h-12 rounded-2xl focus-visible:ring-0 focus-visible:border-neon-lime/30"
                        required
                      />
                </div>
              </div>
              <div className="space-y-2">
                    <Label className="text-white/60">Contact number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input
                        name="contact"
                        placeholder="+91 00000 00000"
                        className="pl-10 bg-white/5 border-white/10 h-12 rounded-2xl focus-visible:ring-0 focus-visible:border-neon-lime/30"
                        required
                      />
                </div>
              </div>
            </div>

            <div className="space-y-2">
                  <Label className="text-white/60">Full address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-white/20" />
                <Textarea 
                  name="address" 
                  placeholder="Street name, Area, City, State, PIN" 
                      className="pl-10 bg-white/5 border-white/10 min-h-[110px] pt-3 rounded-2xl focus-visible:ring-0 focus-visible:border-neon-lime/30"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
                  <Label className="text-white/60">Description</Label>
              <Textarea 
                name="description" 
                    placeholder="Tell users about your equipment, timings, and unique features..."
                    className="bg-white/5 border-white/10 min-h-[140px] rounded-2xl focus-visible:ring-0 focus-visible:border-neon-lime/30"
                required
              />
                  <p className="text-[11px] text-white/30">
                    Tip: Mention parking, trainers, and peak-hour crowd.
                  </p>
                </div>
            </div>
          </div>

          {/* Amenities & Photos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center">
                  <Save size={18} className="text-neon-lime" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Amenities</h3>
                  <p className="text-xs text-white/35">Pick what you offer (helps search).</p>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-2 gap-3">
                  {AMENITIES.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:border-neon-lime/25 transition-colors cursor-pointer"
                    >
                      <input type="checkbox" name="amenities" value={item} className="w-4 h-4 accent-neon-lime" />
                      <span className="text-sm text-white/70">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neon-lime/10 border border-neon-lime/20 flex items-center justify-center">
                  <Camera size={18} className="text-neon-lime" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Photos</h3>
                  <p className="text-xs text-white/35">Optional, up to 6 images.</p>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setPhotos((prev) => [...prev, ...files].slice(0, 6));
                      e.currentTarget.value = "";
                    }}
                  />
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center space-y-2 hover:border-neon-lime/30 transition-colors cursor-pointer bg-gradient-to-b from-white/5 to-transparent">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="text-white/40" />
                    </div>
                    <div className="text-sm text-white/60 font-semibold">Upload gym photos</div>
                    <div className="text-[11px] text-white/30">JPG/PNG/WebP • max 6 files</div>
                  </div>
                </label>

                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {photoPreviews.map(({ file, url }) => (
                      <div key={file.name + file.size} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                        <img src={url} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          className="absolute top-2 right-2 rounded-full bg-black/70 border border-white/10 p-1.5 hover:bg-black"
                          onClick={() => setPhotos((prev) => prev.filter((p) => p !== file))}
                          aria-label="Remove photo"
                        >
                          <X className="h-3.5 w-3.5 text-white/80" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <div className="text-xs text-white/30">
                By publishing, you confirm this information is accurate.
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" className="h-12 px-6 text-white/50 hover:text-white hover:bg-white/5 rounded-2xl" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
                <Button 
                  className="h-12 px-8 bg-neon-lime text-black hover:bg-neon-lime/90 font-black rounded-2xl shadow-[0_0_35px_rgba(163,251,46,0.18)]"
                  disabled={loading}
                >
                  {loading ? "Publishing..." : "Publish Gym"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Preview Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-[#111] rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-white/5">
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Preview</div>
                  <div className="text-lg font-bold mt-1">How it appears to users</div>
                </div>
                <div className="p-6 space-y-3">
                  <div className="rounded-2xl bg-gradient-to-br from-white/10 to-black/40 border border-white/10 aspect-[16/10] flex items-center justify-center overflow-hidden">
                    {photoPreviews[0]?.url ? (
                      <img src={photoPreviews[0].url} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center space-y-2">
                        <Camera className="h-8 w-8 text-white/25 mx-auto" />
                        <div className="text-[11px] text-white/35">Add a photo for a stronger listing</div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-black tracking-tight">
                      Your Gym Name
                    </div>
                    <div className="flex items-start gap-2 text-white/45 text-sm">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      <span>Full address appears here</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(["Weights", "Cardio", "Parking"] as Amenity[]).map((a) => (
                      <span key={a} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-white/25">
                Location is currently auto-set to Mumbai (we can add a map picker next).
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

