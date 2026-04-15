"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  tokenBalance: number;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [tokenAmount, setTokenAmount] = useState(10);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fetchUsers = async () => {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as unknown;
      setUsers(Array.isArray(data) ? (data as UserRow[]) : []);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) => {
      return (
        (u.email ?? "").toLowerCase().includes(s) ||
        (u.name ?? "").toLowerCase().includes(s) ||
        (u.role ?? "").toLowerCase().includes(s)
      );
    });
  }, [q, users]);

  const addTokens = async (userId: string) => {
    setBusyId(userId);
    setErr(null);
    try {
      const res = await fetch("/api/admin/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: tokenAmount }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchUsers();
    } catch (e: any) {
      setErr(e?.message ?? "Failed to add tokens");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="space-y-1">
          <div className="text-2xl font-black tracking-tighter">
            Users <span className="text-neon-lime">Management</span>
          </div>
          <div className="text-white/45 text-sm">Add sample tokens to any user.</div>
        </div>

        <div className="flex gap-3 items-center">
          <div className="text-xs text-white/40 font-bold uppercase tracking-widest">Token amount</div>
          <Input
            value={tokenAmount}
            type="number"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTokenAmount(Number(e.target.value))}
            className="w-28 bg-white/5 border-white/10"
            min={1}
          />
          <Button variant="outline" className="border-white/10 bg-white/5" onClick={fetchUsers}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Input
          value={q}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
          placeholder="Search by name, email, role..."
          className="bg-white/5 border-white/10"
        />
      </div>

      {err && <div className="text-sm text-red-400">{err}</div>}

      <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
          <div className="col-span-4">User</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Tokens</div>
          <div className="col-span-4 text-right">Action</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/30 text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-white/30 text-sm">No users found.</div>
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="grid grid-cols-12 gap-3 px-6 py-4 border-b border-white/5 items-center">
              <div className="col-span-4 min-w-0">
                <div className="font-bold truncate">{u.name ?? "Unnamed"}</div>
                <div className="text-[11px] text-white/35 truncate">{u.email ?? "No email"}</div>
              </div>
              <div className="col-span-2 text-sm text-white/70 font-bold">{u.role}</div>
              <div className="col-span-2 text-sm font-black">{u.tokenBalance}</div>
              <div className="col-span-4 flex justify-end">
                <Button
                  className="bg-neon-lime text-black font-bold"
                  disabled={busyId === u.id}
                  onClick={() => addTokens(u.id)}
                >
                  {busyId === u.id ? "Adding..." : `+${tokenAmount} tokens`}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

