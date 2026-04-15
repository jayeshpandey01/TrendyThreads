"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  Shield, 
  ArrowLeft,
  Search,
  Loader2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function ManageTrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrainer, setNewTrainer] = useState({ name: "", email: "", password: "", phone: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await fetch("/api/owner/trainers");
      if (res.ok) {
        const data = await res.json();
        setTrainers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/owner/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrainer),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewTrainer({ name: "", email: "", password: "", phone: "" });
        fetchTrainers();
      } else {
        const error = await res.text();
        alert(error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <Link href="/owner" className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-widest">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tighter">MANAGE <span className="text-neon-lime">TRAINERS</span></h1>
            <p className="text-white/40 text-sm font-light uppercase tracking-widest">Roster size: <span className="text-white font-bold">{trainers.length} active staff</span></p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-neon-lime text-black hover:bg-neon-lime/90 h-12 px-6 font-bold shadow-[0_0_20px_rgba(163,251,46,0.3)] transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Trainer
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
          <Input 
            placeholder="Search trainers by name or email..." 
            className="pl-12 bg-[#111] border-white/5 h-14 rounded-2xl focus:border-neon-lime/30"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-neon-lime animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainers.map((trainer) => (
              <Card key={trainer.id} className="bg-[#111] border-white/5 group hover:border-neon-lime/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-neon-lime/10 border border-neon-lime/20 rounded-2xl flex items-center justify-center font-black text-neon-lime text-xl">
                        {trainer.name[0]}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{trainer.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-white/40 italic">
                          <Shield size={12} className="text-neon-lime" /> Access: QR Scanning
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl">
                      <Trash2 size={18} />
                    </Button>
                  </div>

                  <div className="mt-6 space-y-3 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <Mail size={14} className="text-white/20" /> {trainer.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/50">
                      <Phone size={14} className="text-white/20" /> {trainer.phone || "No phone added"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {trainers.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Users className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-bold">No Trainers Found</h3>
                <p className="text-white/40 max-w-xs mx-auto text-sm">You haven't added any staff yet. Add your first trainer to manage athlete check-ins.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Trainer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-[#111] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardContent className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black italic">ONBOARD <span className="text-neon-lime">TRAINER</span></h2>
                  <p className="text-xs text-white/30 uppercase font-bold tracking-widest mt-1">Staff Access Credentials</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)} className="rounded-full hover:bg-white/5">
                  <X />
                </Button>
              </div>

              <form onSubmit={handleAddTrainer} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40">Full Name</Label>
                  <Input 
                    value={newTrainer.name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, name: e.target.value })}
                    placeholder="E.g. Marcus Aurelius" 
                    className="bg-white/5 border-white/10 h-12 focus:border-neon-lime/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40">Email Address (Login ID)</Label>
                  <Input 
                    type="email"
                    value={newTrainer.email}
                    onChange={(e) => setNewTrainer({ ...newTrainer, email: e.target.value })}
                    placeholder="trainer@yourgym.com" 
                    className="bg-white/5 border-white/10 h-12 focus:border-neon-lime/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40">Temporary Password</Label>
                  <Input 
                    type="password"
                    value={newTrainer.password}
                    onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })}
                    placeholder="Set a secure password" 
                    className="bg-white/5 border-white/10 h-12 focus:border-neon-lime/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/40">Phone Number</Label>
                  <Input 
                    value={newTrainer.phone}
                    onChange={(e) => setNewTrainer({ ...newTrainer, phone: e.target.value })}
                    placeholder="+91 00000 00000" 
                    className="bg-white/5 border-white/10 h-12 focus:border-neon-lime/50"
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 h-14 border-white/10 font-bold hover:bg-white/5">
                    Cancel
                  </Button>
                  <Button disabled={adding} className="flex-1 h-14 bg-neon-lime text-black hover:bg-neon-lime/90 font-black shadow-[0_0_20px_rgba(163,251,46,0.2)] transition-all">
                    {adding ? "Onboarding..." : "Add Staff Member"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
