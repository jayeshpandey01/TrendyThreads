import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, ArrowLeft, Navigation } from "lucide-react";

export default async function GymDetailsPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  const gym = await prisma.gym.findUnique({
    where: { id },
  });

  if (!gym) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" className="text-white/60 hover:text-white" asChild>
            <Link href="/gyms">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button className="bg-neon-lime text-black hover:bg-neon-lime/90 font-bold" asChild>
            <a
              href={`https://www.google.com/maps?q=${gym.latitude},${gym.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Open in Maps
            </a>
          </Button>
        </div>

        <Card className="bg-[#111] border-white/5">
          <CardHeader className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tighter">
              {gym.name}
            </CardTitle>
            <div className="flex items-start gap-2 text-white/50 text-sm">
              <MapPin className="w-4 h-4 mt-0.5" />
              <span>{gym.address}</span>
            </div>
            {gym.contact && (
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Phone className="w-4 h-4" />
                <span>{gym.contact}</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {gym.description && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
                  About
                </div>
                <div className="text-white/80 leading-relaxed">{gym.description}</div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
                Amenities
              </div>
              <div className="flex flex-wrap gap-2">
                {(gym.amenities ?? []).length > 0 ? (
                  gym.amenities.map((a) => (
                    <span
                      key={a}
                      className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10"
                    >
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-white/30 text-sm">No amenities listed</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-white/60">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">
                  Latitude
                </div>
                <div className="font-mono">{gym.latitude}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">
                  Longitude
                </div>
                <div className="font-mono">{gym.longitude}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

