"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Dumbbell, 
  Wallet, 
  Scan, 
  Plus, 
  ArrowUpRight, 
  Activity,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const VISITS_DATA = [
  { day: 'Mon', count: 45 },
  { day: 'Tue', count: 52 },
  { day: 'Wed', count: 38 },
  { day: 'Thu', count: 65 },
  { day: 'Fri', count: 48 },
  { day: 'Sat', count: 72 },
  { day: 'Sun', count: 85 },
];

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [gym, setGym] = useState<any>(null);
  const [stats, setStats] = useState({
    todayVisits: 0,
    activeTrainers: 0,
    newRegistrations: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchGymData = async () => {
      try {
        const res = await fetch("/api/owner/gym");
        if (res.ok) {
          const data = await res.json();
          setGym(data.gym);
          setStats({
            todayVisits: data.stats.todayVisits,
            activeTrainers: data.stats.activeTrainers,
            newRegistrations: data.stats.newRegistrations,
            recentActivity: data.stats.recentActivity
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchGymData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-lime"></div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
          <Dumbbell className="w-10 h-10 text-white/20" />
        </div>
        <h1 className="text-3xl font-bold">No Gym Registered</h1>
        <p className="text-white/40 max-w-md">You haven't listed your facility yet. Register your gym to start managing visits and trainers.</p>
        <Button asChild className="bg-neon-lime text-black font-bold h-12 px-8">
          <Link href="/register-gym">Register My Gym</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">GYM <span className="text-neon-lime">CENTRAL</span></h1>
            <p className="text-white/40 text-sm font-light uppercase tracking-widest">Managing: <span className="text-white font-bold">{gym.name}</span></p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline" className="border-white/10 bg-white/5 h-12 px-6">
              <Link href="/owner/trainers">
                <Users className="mr-2 h-4 w-4" /> Manage Trainers
              </Link>
            </Button>
            <Button asChild className="bg-neon-lime text-black hover:bg-neon-lime/90 h-12 px-6 font-bold shadow-[0_0_20px_rgba(163,251,46,0.3)] transition-all">
              <Link href="/owner/trainers">
                <Plus className="mr-2 h-4 w-4" /> Add Trainer
              </Link>
            </Button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Visits today", value: stats.todayVisits.toString(), icon: Activity, color: "text-neon-lime", sub: "Daily check-ins" },
            { label: "Revenue Share (M)", value: "₹0", icon: Wallet, color: "text-blue-400", sub: "Calculated from tokens" },
            { label: "Active Trainers", value: stats.activeTrainers.toString(), icon: Dumbbell, color: "text-purple-400", sub: "Full roster" },
            { label: "New Registrations", value: stats.newRegistrations.toString(), icon: Users, color: "text-orange-400", sub: "Last 7 days" },
          ].map((stat, i) => (
            <Card key={i} className="bg-[#111] border-white/5">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</p>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <div className="text-3xl font-black mb-1">{stat.value}</div>
                <p className="text-[10px] text-white/20 font-medium">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue/Visits Chart */}
          <Card className="bg-[#111] border-white/5 lg:col-span-2 p-4">
            <CardHeader className="flex flex-row items-center justify-between pb-8">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Weekly Performance</CardTitle>
                <p className="text-xs text-white/30">Total check-ins visualized across the week</p>
              </div>
              <Button variant="ghost" size="sm" className="text-white/40 text-xs">
                Export Data <ArrowUpRight size={12} className="ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VISITS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#444" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#444" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(163,251,46,0.05)' }}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px' }}
                    itemStyle={{ color: '#a3fb2e', fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#a3fb2e" 
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-[#111] border-white/5">
            <CardHeader className="flex flex-row items-center gap-2 pt-6 px-6">
              <Calendar size={16} className="text-neon-lime" />
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Scanner Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {stats.recentActivity.map((log: any, i: number) => (
                  <div key={i} className="flex justify-between items-start group">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-white/40 border border-white/5 text-xs">
                        {log.user.name?.[0] || "?"}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold group-hover:text-neon-lime transition-colors">{log.user.name}</h4>
                        <p className="text-[10px] text-white/30">Checked-in</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <span className="text-[8px] px-1.5 py-0.5 bg-white/5 text-white/40 rounded border border-white/10">Member</span>
                    </div>
                  </div>
                ))}
                {stats.recentActivity.length === 0 && (
                  <p className="text-center text-white/20 py-10 text-xs">No recent activity</p>
                )}
                <Button variant="ghost" className="w-full text-[10px] font-bold text-neon-lime hover:bg-neon-lime/10 tracking-widest uppercase">
                  View All Session Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
