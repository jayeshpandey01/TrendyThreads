"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  TrendingUp, 
  History, 
  CreditCard, 
  QrCode, 
  User as UserIcon,
  ChevronRight,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

type WeeklyVisitPoint = { name: string; visits: number };

export default function UserDashboard() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState(0);
  const [qrCode, setQrCode] = useState("");
  const [visits, setVisits] = useState<any[]>([]);
  const [weeklyVisits, setWeeklyVisits] = useState<WeeklyVisitPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/dashboard");
        if (res.ok) {
          const data = await res.json();
          setTokens(data.tokenBalance);
          setVisits(data.recentVisits);
          setWeeklyVisits(Array.isArray(data.weeklyVisits) ? data.weeklyVisits : []);
          
          if (session?.user) {
            const qr = await QRCode.toDataURL((session.user as any).id);
            setQrCode(qr);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">HELLO, <span className="text-neon-lime">{session?.user?.name?.toUpperCase() || "ATHLETE"}</span></h1>
            <p className="text-white/40 text-sm font-light uppercase tracking-widest">Ready for your next session?</p>
          </div>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="bg-neon-lime text-black hover:bg-neon-lime/90 font-bold group"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" /> 
              {showQR ? "Hide QR Access" : "My QR Access"}
            </Button>
          </div>
        </div>

        {showQR && (
          <Card className="bg-[#111] border-white/5 p-8 flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
            <div className="bg-white p-4 rounded-xl mb-4">
               {qrCode && <img src={qrCode} alt="Access QR" className="w-48 h-48" />}
            </div>
            <h3 className="text-xl font-bold mb-2 uppercase italic tracking-tighter">Your Identity <span className="text-neon-lime">Vault</span></h3>
            <p className="text-white/40 text-xs text-center max-w-xs uppercase tracking-widest font-light">Show this to your trainer at the gym reception to log your session.</p>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-[#111] border-white/5 col-span-1 border-l-4 border-l-neon-lime">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white/40 uppercase tracking-widest">Available Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-white">{tokens}</div>
              <p className="text-[10px] text-white/30 mt-2">1 Token = 1 Workout Session</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#111] border-white/5 col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-white/40 uppercase tracking-widest">Avg. Weekly Visits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-white">4.2</div>
              <p className="text-[10px] text-neon-lime mt-2">↑ 12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/5 col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-white/40 uppercase tracking-widest">Current Streak</CardTitle>
              <TrendingUp className="text-neon-lime w-4 h-4" />
            </CardHeader>
            <CardContent className="flex gap-4">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className={`flex-1 h-12 rounded-lg flex items-center justify-center border ${day < 6 ? 'bg-neon-lime/10 border-neon-lime/20 text-neon-lime' : 'bg-white/5 border-white/10 text-white/20'}`}>
                  <div className="text-xs font-black">{day}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <Card className="bg-[#111] border-white/5 lg:col-span-2 p-4">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Activity Analytics</CardTitle>
              <CardDescription>Visualizing your performance over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyVisits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis 
                    dataKey="name" 
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
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px' }}
                    itemStyle={{ color: '#a3fb2e', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="#a3fb2e" 
                    strokeWidth={4} 
                    dot={{ fill: '#a3fb2e', strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 8, stroke: '#a3fb2e', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions & Recent History */}
          <div className="space-y-6 lg:col-span-1">
             <Card className="bg-[#111] border-white/5 overflow-hidden">
                <CardHeader className="bg-neon-lime">
                  <CardTitle className="text-black text-sm font-black flex items-center justify-between uppercase tracking-tighter">
                    Quick Buy
                    <CreditCard size={16} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-neon-lime/30 transition-all group cursor-pointer">
                    <div>
                      <h4 className="font-bold text-sm">10 Sessions</h4>
                      <p className="text-[10px] text-white/40">Popular choice</p>
                    </div>
                    <div className="text-neon-lime font-black">₹450</div>
                  </div>
                  <Button className="w-full h-12 bg-white text-black hover:bg-white/90">
                    <Plus className="mr-2 w-4 h-4" /> Customized Package
                  </Button>
                </CardContent>
             </Card>

             <Card className="bg-[#111] border-white/5">
                <CardHeader className="pb-0 pt-6 px-6">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <History size={16} className="text-neon-lime" /> Recent Logins
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-5">
                    {visits.map((v: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold group-hover:text-neon-lime transition-colors">{v.gym.name}</h4>
                          <p className="text-[10px] text-white/30">{new Date(v.timestamp).toLocaleString()}</p>
                        </div>
                        <div className="text-red-400 text-xs font-bold">-{v.tokensDeducted}</div>
                      </div>
                    ))}
                    {visits.length === 0 && (
                      <p className="text-center text-white/20 py-10 text-xs">No recent visits</p>
                    )}
                  </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
