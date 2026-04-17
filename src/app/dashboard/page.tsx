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
  Plus,
  LogOut,
  Download,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
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
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";

type WeeklyVisitPoint = { name: string; visits: number };

export default function UserDashboard() {
  const { data: session } = useSession();
  const [tokens, setTokens] = useState(0);
  const [qrCode, setQrCode] = useState("");
  const [visits, setVisits] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [weeklyVisits, setWeeklyVisits] = useState<WeeklyVisitPoint[]>([]);
  const [avgWeeklyVisits, setAvgWeeklyVisits] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakArray, setStreakArray] = useState<boolean[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [buyingTokens, setBuyingTokens] = useState(false);
  const [customTokens, setCustomTokens] = useState(5);
  const [tokenMsg, setTokenMsg] = useState<string | null>(null);

  const handleBuyTokens = async (count: number) => {
    if (buyingTokens || count <= 0) return;
    setBuyingTokens(true);
    setTokenMsg(null);
    try {
      const res = await fetch("/api/user/tokens/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens: count }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create order");
      }
      const { id, amount, currency } = await res.json();

      await openRazorpayCheckout({
        rzpOrderId: id,
        amount,
        currency,
        name: "Trendy Threads",
        description: `${count} Gym Session Tokens`,
        email: session?.user?.email || "",
        prefillName: session?.user?.name || "",
        onSuccess: async (response) => {
          // Verify on server
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              type: "TOKEN_PURCHASE",
            }),
          });
          const result = await verifyRes.json();
          if (result.success) {
            setTokens((prev) => prev + count);
            setTokenMsg(`✓ ${count} tokens added successfully!`);
            // Refresh transactions
            const dashRes = await fetch("/api/user/dashboard");
            if (dashRes.ok) {
              const data = await dashRes.json();
              setTransactions(data.recentTransactions || []);
            }
          } else {
            setTokenMsg("Payment verified but tokens not credited. Contact support.");
          }
          setBuyingTokens(false);
        },
        onDismiss: () => {
          setBuyingTokens(false);
          setTokenMsg("Payment cancelled.");
        },
      });
    } catch (e: any) {
      console.error(e);
      setTokenMsg(e?.message || "Failed to buy tokens");
      setBuyingTokens(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/user/dashboard");
        if (res.ok) {
          const data = await res.json();
          setTokens(data.tokenBalance);
          setVisits(data.recentVisits);
          setTransactions(data.recentTransactions || []);
          setWeeklyVisits(Array.isArray(data.weeklyVisits) ? data.weeklyVisits : []);
          setAvgWeeklyVisits(data.avgWeeklyVisits || 0);
          setCurrentStreak(data.currentStreak || 0);
          setStreakArray(data.streakArray || []);
          setTasks(data.tasks || []);
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

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/trainer/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, isCompleted: !currentStatus })
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: !currentStatus } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Dynamic QR rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const refreshQR = async () => {
      if (!session || !showQR) return;
      try {
        const res = await fetch("/api/user/qr");
        if (res.ok) {
          const { qrString } = await res.json();
          const qrDataUrl = await QRCode.toDataURL(qrString);
          setQrCode(qrDataUrl);
        }
      } catch (err) {
        console.error("Failed to refresh QR:", err);
      }
    };

    if (showQR) {
      refreshQR();
      interval = setInterval(refreshQR, 30000); // Refresh every 30s
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [session, showQR]);

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
            <Button 
                variant="outline" 
                size="lg" 
                className="border-white/10 bg-white/5 hover:bg-red-500/10 text-red-500 hover:text-red-400 font-bold"
                onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
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
              <div className="text-5xl font-black text-white">{avgWeeklyVisits}</div>
              <p className="text-[10px] text-neon-lime mt-2">Past 28 Days</p>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/5 col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-white/40 uppercase tracking-widest">Current Streak</CardTitle>
              <TrendingUp className="text-neon-lime w-4 h-4" />
            </CardHeader>
            <CardContent className="flex gap-4">
              {streakArray.length > 0 ? streakArray.map((visited, i) => (
                <div key={i} className={`flex-1 h-12 rounded-lg flex items-center justify-center border ${visited ? 'bg-neon-lime/10 border-neon-lime/20 text-neon-lime' : 'bg-white/5 border-white/10 text-white/20'}`}>
                  <div className="text-xs font-black">{visited ? '✓' : '-'}</div>
                </div>
              )) : [1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className="flex-1 h-12 rounded-lg flex items-center justify-center border bg-white/5 border-white/10 text-white/20">
                  <div className="text-xs font-black">-</div>
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
             <Card className="bg-[#111] border-white/5 border-t-4 border-t-neon-lime group">
                <CardHeader>
                  <CardTitle className="text-sm font-black flex items-center justify-between uppercase tracking-tighter">
                    Daily Tasks
                    <Sparkles size={16} className="text-neon-lime group-hover:animate-spin-slow" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex gap-3 items-start cursor-pointer hover:border-neon-lime/30 transition-colors" onClick={() => toggleTask(task.id, task.isCompleted)}>
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${task.isCompleted ? 'bg-neon-lime border-neon-lime text-black' : 'border-white/30'}`}>
                        {task.isCompleted && <span className="text-[10px] font-black">✓</span>}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold ${task.isCompleted ? 'text-white/40 line-through' : 'text-white'}`}>{task.title}</h4>
                        {task.description && <p className="text-[10px] text-white/40 mt-1">{task.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-[8px] text-neon-lime uppercase tracking-widest">Assigned by {task.trainer?.name}</p>
                          <Link href={`/dashboard/chat/${task.trainerId}`} className="text-[8px] text-blue-400 hover:text-blue-300 uppercase tracking-widest ml-2">Chat</Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-xs text-white/40 leading-relaxed text-center">
                      No daily tasks assigned.
                    </p>
                  )}
                </CardContent>
             </Card>

             <Card className="bg-[#111] border-white/5 overflow-hidden">
                <CardHeader className="bg-neon-lime">
                  <CardTitle className="text-black text-sm font-black flex items-center justify-between uppercase tracking-tighter">
                    Buy Tokens
                    <CreditCard size={16} />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {tokenMsg && (
                    <div className={`text-xs p-3 rounded-xl border ${tokenMsg.startsWith('✓') ? 'bg-neon-lime/10 border-neon-lime/20 text-neon-lime' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                      {tokenMsg}
                    </div>
                  )}
                  {[{ count: 5, label: "5 Sessions", price: 250, tag: "Starter" }, { count: 10, label: "10 Sessions", price: 500, tag: "Popular" }, { count: 25, label: "25 Sessions", price: 1250, tag: "Pro" }].map((pkg) => (
                    <button
                      key={pkg.count}
                      onClick={() => handleBuyTokens(pkg.count)}
                      disabled={buyingTokens}
                      className="w-full flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-neon-lime/30 transition-all group cursor-pointer disabled:opacity-50"
                    >
                      <div className="text-left">
                        <h4 className="font-bold text-sm">{pkg.label}</h4>
                        <p className="text-[10px] text-white/40">{pkg.tag}</p>
                      </div>
                      <div className="text-neon-lime font-black">₹{pkg.price}</div>
                    </button>
                  ))}

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={customTokens}
                      onChange={(e) => setCustomTokens(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-center font-bold focus:border-neon-lime/50 focus:outline-none"
                    />
                    <Button
                      className="h-12 bg-white text-black hover:bg-white/90 font-bold px-6 rounded-xl"
                      disabled={buyingTokens}
                      onClick={() => handleBuyTokens(customTokens)}
                    >
                      {buyingTokens ? "Processing..." : `Buy ₹${customTokens * 50}`}
                    </Button>
                  </div>
                  <p className="text-[10px] text-white/20 text-center">1 Token = ₹50 • Powered by Razorpay</p>
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

             <Card className="bg-[#111] border-white/5">
                <CardHeader className="pb-0 pt-6 px-6">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <CreditCard size={16} className="text-neon-lime" /> Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {transactions.map((t: any, i: number) => (
                      <div key={i} className="flex items-center justify-between group p-3 bg-white/5 rounded-xl border border-transparent hover:border-neon-lime/30 transition-all">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase">{t.tokens} Tokens</h4>
                          <p className="text-[10px] text-white/30">{new Date(t.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-white font-black text-xs">₹{t.amount}</div>
                          <a 
                            href={`/api/user/invoices/${t.id}`}
                            download
                            className="p-2 bg-neon-lime/10 text-neon-lime rounded-lg hover:bg-neon-lime hover:text-black transition-colors"
                            title="Download Invoice"
                          >
                            <Download size={14} />
                          </a>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-center text-white/20 py-5 text-xs">No transactions yet</p>
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
