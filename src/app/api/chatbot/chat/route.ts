import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const userName = session.user.name || "Athlete";
    
    // System instruction based on the fitness_chatbot.py logic
    const systemPrompt = `
You are an enthusiastic AI Fitness Coach for "Trendy Threads". Your tone should be professional, encouraging, and science-based.
Regard the user as ${userName}.

Core Responsibilities:
1. Provide personalized advice on nutrition, workouts, and health guidelines.
2. Analyze user questions and determine the type of response needed. 
3. Warn the user in case of unsafe or unhealthy requests.
4. Provide complete structured plans with specific details. Suggest plans only if they result in healthy outcomes.
5. Be concise and clear.
6. Base recommendations on scientific evidence and best practices.
7. If the user asks for meal plans, diet plans, or fitness plans, provide them in a structured markdown table format.
8. Always prioritize user safety and well-being.

Current Context:
User Name: ${userName}
(Note: Full profile data like height/weight will be available in future updates. For now, provide expert general advice tailored to the user's goals mentioned in chat.)
`;

    const ollamaMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      }))
    ];

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:1b",
        messages: ollamaMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama error: ${errorText}`);
    }

    const data = await response.json();
    const responseContent = data.message?.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ content: responseContent });
  } catch (error: any) {
    console.error("Chatbot API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate response. Is Ollama running?" },
      { status: 500 }
    );
  }
}
