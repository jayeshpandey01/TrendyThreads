"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  Dumbbell, 
  Info,
  ChevronLeft,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatbotPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Fitness Coach. How can I help you reach your goals today? Whether it's a workout plan, nutrition advice, or health tips, I'm here for you!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-neon-lime/10 rounded-3xl flex items-center justify-center mx-auto border border-neon-lime/20">
            <Bot className="w-10 h-10 text-neon-lime" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Access <span className="text-neon-lime">Coach</span></h1>
          <p className="text-white/40">Please log in to chat with your personal AI Fitness coach and get tailored plans.</p>
          <Button asChild className="bg-neon-lime text-black hover:bg-neon-lime/90 font-bold w-full h-12">
            <Link href="/login">Login to Start</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader />
      
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-10 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6 text-white/40" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neon-lime rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(163,251,46,0.2)]">
                <Bot className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight uppercase italic flex items-center gap-2">
                  AI Fitness <span className="text-neon-lime">Coach</span>
                  <Sparkles className="w-4 h-4 text-neon-lime fill-neon-lime" />
                </h1>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Active & Ready</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
            <Dumbbell className="w-4 h-4 text-neon-lime" />
            <span className="text-xs font-bold text-white/60">Vectorless Engine</span>
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-chat"
        >
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`flex items-start gap-3 max-w-[85%] md:max-w-[70%]`}>
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mt-1">
                    <Bot className="w-4 h-4 text-neon-lime" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl border ${
                  msg.role === "user" 
                  ? "bg-neon-lime text-black border-neon-lime font-medium" 
                  : "bg-white/5 text-white/80 border-white/10 backdrop-blur-sm"
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {msg.content.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-neon-lime/20 border border-neon-lime/30 flex items-center justify-center mt-1">
                    <UserIcon className="w-4 h-4 text-neon-lime" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-neon-lime" />
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <Loader2 className="w-5 h-5 animate-spin text-neon-lime" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="relative group pt-4">
          <div className="absolute inset-0 bg-neon-lime/10 blur-2xl opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none rounded-3xl" />
          <div className="relative bg-[#111] border border-white/10 rounded-[2rem] p-2 flex items-center gap-2 focus-within:border-neon-lime/50 transition-all shadow-2xl">
            <div className="p-3">
              <Info className="w-5 h-5 text-white/20 select-none" />
            </div>
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask for a workout plan, meal ideas, or gym tips..."
              className="flex-1 border-none bg-transparent h-12 focus-visible:ring-0 text-white placeholder:text-white/20 text-lg"
            />
            <Button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-neon-lime text-black hover:bg-neon-lime/90 h-12 w-12 rounded-full p-0 flex items-center justify-center shadow-[0_0_15px_rgba(163,251,46,0.3)]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-center text-white/20 font-bold uppercase tracking-widest pb-4">
          Personalized AI Coach powered by Groq & Llama 3.1
        </p>
      </main>
      
      <style jsx global>{`
        .scrollbar-chat::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-chat::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-chat::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .scrollbar-chat::-webkit-scrollbar-thumb:hover {
          background: rgba(163, 251, 46, 0.2);
        }
      `}</style>
    </div>
  );
}
