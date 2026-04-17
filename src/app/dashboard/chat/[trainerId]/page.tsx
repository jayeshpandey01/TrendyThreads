"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserChatPage() {
  const { data: session } = useSession();
  const { trainerId } = useParams();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?otherUserId=${trainerId}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [session, trainerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const content = input;
    setInput("");
    
    // Optimistic update
    const tempMsg = {
      id: Date.now().toString(),
      content,
      senderId: (session?.user as any)?.id,
      receiverId: trainerId,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: trainerId, content })
      });
      fetchMessages();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-neon-lime">Loading Chat...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <div className="h-20 border-b border-white/10 flex items-center px-6 gap-4 bg-[#111]">
        <Button variant="ghost" className="p-2" onClick={() => router.back()}>
          <ArrowLeft className="text-white/60" />
        </Button>
        <div>
          <h2 className="font-black text-xl">Trainer Chat</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest">Get expert advice</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === (session?.user as any)?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] p-4 rounded-2xl ${isMe ? "bg-neon-lime text-black rounded-tr-sm" : "bg-white/10 text-white rounded-tl-sm"}`}>
                <p className="text-sm font-medium">{msg.content}</p>
                <span className={`text-[10px] mt-2 block ${isMe ? "text-black/50" : "text-white/30"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            No messages yet. Ask your trainer a question!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 bg-[#111] border-t border-white/10">
        <form onSubmit={sendMessage} className="flex gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:border-neon-lime outline-none"
          />
          <Button type="submit" className="bg-neon-lime text-black hover:bg-neon-lime/90 h-12 w-12 rounded-xl p-0">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
