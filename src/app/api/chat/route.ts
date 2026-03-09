import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai-client";

export const dynamic = 'force-dynamic';

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatRequestBody {
  messages?: ChatMessage[];
  pagePath?: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Missing messages array in request body." },
        { status: 400 }
      );
    }

    const messages: ChatMessage[] = body.messages
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-12); // keep last 12 turns for context

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages provided." },
        { status: 400 }
      );
    }

    const reply = await generateChatResponse({
      messages,
      pagePath: body.pagePath,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);

    if (error instanceof Error) {
      // Surface specific configuration problems to the client
      if (
        error.message.includes("GEMINI_API_KEY is not set") ||
        error.message.includes("AI provider")
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate a response from the Numera tutor." },
      { status: 500 }
    );
  }
}

