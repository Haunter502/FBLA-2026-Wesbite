import { NextResponse } from "next/server";
import { generateChatResponse } from "@/lib/ai-client";

export const dynamic = 'force-dynamic';

/** Blocklist: obvious profanity (word boundaries only to avoid false positives). */
const PROFANITY_PATTERN = /\b(fuck|shit|damn|hell|ass|bitch|crap|dumbass|bullshit|bait)\b/i;

function containsProfanity(text: string): boolean {
  return PROFANITY_PATTERN.test(text);
}

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

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();
    if (lastUserMessage && containsProfanity(lastUserMessage.content)) {
      return NextResponse.json(
        {
          error:
            "Please keep your questions respectful and appropriate. I'm here to help with πumera and math!",
        },
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
      { error: "Failed to generate a response from the πumera tutor." },
      { status: 500 }
    );
  }
}

