"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Dumbbell, 
  MessageSquare, 
  Scan, 
  CheckCircle, 
  Activity,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TrainerDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Task Assign Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/trainer/dashboard");
      if (res.ok) {
        setData(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const handleAssignTask = async () => {
    if (!taskTitle || !selectedUser) return;
    try {
      const res = await fetch("/api/trainer/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          title: taskTitle,
          description: taskDesc
        })
      });
      if (res.ok) {
        setShowTaskModal(false);
        setTaskTitle("");
        setTaskDesc("");
        fetchDashboardData(); // Refresh tasks
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-lime"></div>
      </div>
    );
  }

  if (!data?.gym) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-3xl font-bold">Unassigned Trainer</h1>
        <p className="text-white/40 max-w-md">You are not assigned to any gym. Ask your Gym Owner to add you.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 lg:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tighter">TRAINER <span className="text-neon-lime">HUB</span></h1>
            <p className="text-white/40 text-sm font-light uppercase tracking-widest">At: <span className="text-white font-bold">{data.gym.name}</span></p>
          </div>
          <div className="flex gap-4">
            <Button asChild className="bg-neon-lime text-black hover:bg-neon-lime/90 font-bold">
              <Link href="/trainer/scan">
                <Scan className="mr-2 h-4 w-4" /> Scan QR
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Athlete Roster */}
          <Card className="bg-[#111] border-white/5 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="text-neon-lime" /> Your Athletes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.athletes?.map((athlete: any) => (
                <div key={athlete.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-neon-lime">
                      {athlete.name?.[0] || "?"}
                    </div>
                    <div>
                      <h4 className="font-bold">{athlete.name}</h4>
                      <p className="text-[10px] text-white/40">Last visit: {new Date(athlete.lastVisit).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      className="bg-white/5 hover:bg-neon-lime hover:text-black transition-colors rounded-xl"
                      onClick={() => { setSelectedUser(athlete); setShowTaskModal(true); }}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Task
                    </Button>
                    <Button asChild variant="ghost" className="bg-white/5 hover:bg-blue-500 hover:text-white transition-colors rounded-xl">
                      <Link href={`/trainer/chat/${athlete.id}`}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Chat
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              {data.athletes?.length === 0 && (
                <p className="text-center text-white/30 text-sm">No athletes have visited this gym yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Assigned Tasks Tracker */}
          <Card className="bg-[#111] border-white/5">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Activity className="text-neon-lime" /> Assigned Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.assignedTasks?.map((task: any) => (
                <div key={task.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold">{task.title}</h4>
                    {task.isCompleted ? (
                      <CheckCircle className="text-neon-lime h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-white/30" />
                    )}
                  </div>
                  <p className="text-[10px] text-neon-lime uppercase tracking-widest">{task.user?.name}</p>
                </div>
              ))}
              {data.assignedTasks?.length === 0 && (
                <p className="text-center text-white/30 text-xs">No tasks assigned yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="bg-[#111] border-white/10 max-w-md w-full shadow-2xl">
            <CardHeader>
              <CardTitle>Assign Task to {selectedUser?.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-white/60">Task Title</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-neon-lime outline-none"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Do 50 Pushups"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/60">Description (Optional)</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:border-neon-lime outline-none"
                  rows={3}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Additional instructions..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setShowTaskModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-neon-lime text-black font-bold hover:bg-neon-lime/90" onClick={handleAssignTask}>Assign</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
