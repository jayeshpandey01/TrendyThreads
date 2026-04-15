"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { 
  ScanLine, 
  Dumbbell, 
  UserCheck, 
  AlertTriangle,
  RefreshCcw,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrainerScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedUser, setScannedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Camera only
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      setScanResult(decodedText);
      scanner.clear();
      processAttendance(decodedText);
    }

    function onScanFailure(error: any) {
      // Quietly continue
    }

    return () => {
      scanner.clear().catch(e => console.error("Failed to clear scanner", e));
    };
  }, []);

  const [stats, setStats] = useState({ shiftCheckins: 0, gymLoad: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/trainer/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch trainer stats", err);
    }
  };

  const processAttendance = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        const data = await res.json();
        setScannedUser({
          name: data.userName,
          tokensRemain: data.tokenBalance,
          status: "SUCCESS"
        });
        // Refresh stats after success
        fetchStats();
      } else {
        const errorText = await res.text();
        setScannedUser({
          name: "Scan Error",
          status: "ERROR",
          message: errorText
        });
      }
    } catch (err) {
      console.error(err);
      setScannedUser({
        name: "Network Error",
        status: "ERROR"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-6 lg:p-10">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-neon-lime rounded-2xl mb-4">
             <ScanLine className="text-black w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Trainer <span className="text-neon-lime">Vault</span></h1>
          <p className="text-white/40 text-sm font-light">Scan athlete QR to verify & deduct session token.</p>
        </div>

        {!scanResult ? (
          <Card className="bg-[#111] border-white/5 overflow-hidden border-t-4 border-t-neon-lime">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-white/50">Scanner Active</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div id="reader" className="w-full"></div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className={`bg-[#111] border-white/5 border-l-4 ${scannedUser?.status === 'SUCCESS' ? 'border-l-neon-lime' : 'border-l-red-500'}`}>
              <CardContent className="p-8 space-y-6 text-center">
                {loading ? (
                    <div className="space-y-4">
                      <RefreshCcw className="w-10 h-10 text-neon-lime animate-spin mx-auto" />
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Validating Token...</p>
                    </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-neon-lime/10 rounded-full flex items-center justify-center mx-auto border border-neon-lime/20">
                      <UserCheck className="text-neon-lime w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black">{scannedUser?.name}</h2>
                      {scannedUser?.status === 'SUCCESS' ? (
                        <p className="text-neon-lime text-xs font-bold uppercase tracking-widest">Access Granted</p>
                      ) : (
                        <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{scannedUser?.message || "Access Denied"}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                        <div className="text-center">
                           <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Deducted</p>
                           <p className="text-white font-black">1 Token</p>
                        </div>
                        <div className="text-center">
                           <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Balance</p>
                           <p className="text-white font-black">{scannedUser?.tokensRemain} Left</p>
                        </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Button 
                onClick={resetScanner} 
                className="w-full h-14 bg-white text-black hover:bg-neon-lime font-black text-lg transition-all active:scale-95"
            >
                Next Athlete
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
             <Card key="shift-checkins" className="bg-[#111] border-white/5 p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><Zap size={16} className="text-blue-500" /></div>
                <div>
                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Shift Checkins</p>
                   <p className="text-lg font-black">{stats.shiftCheckins}</p>
                </div>
             </Card>
             <Card key="gym-load" className="bg-[#111] border-white/5 p-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Dumbbell size={16} className="text-purple-500" /></div>
                <div>
                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Gym Load</p>
                   <p className="text-lg font-black tracking-tight">{stats.gymLoad}%</p>
                </div>
             </Card>
        </div>

        <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex gap-3">
           <AlertTriangle className="text-orange-500 h-5 w-5 shrink-0" />
           <p className="text-[10px] text-orange-500/80 leading-relaxed font-medium uppercase italic">
              Safety Reminder: Ensure all athletes sanitize equipment after use. Report any suspicious QR attempts to management.
           </p>
        </div>
      </div>
    </div>
  );
}
