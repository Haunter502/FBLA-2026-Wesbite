import 'server-only'

type ChatRole = 'user' | 'assistant'

interface AiMessage {
  role: ChatRole
  content: string
}

interface GenerateChatResponseParams {
  messages: AiMessage[]
  pagePath?: string
}

const DEFAULT_MODEL = 'gemini-2.5-flash'

export async function generateChatResponse({
  messages,
  pagePath,
}: GenerateChatResponseParams): Promise<string> {
  const provider = process.env.AI_PROVIDER || 'gemini'

  if (provider !== 'gemini') {
    throw new Error(
      `AI provider "${provider}" is not configured yet. Set AI_PROVIDER=gemini to use the Gemini free tier.`
    )
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add it to your .env.local or hosting environment to enable the πumera tutor.'
    )
  }

  const systemPrompt = buildSystemPrompt(pagePath)

  const userAndAssistantMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemPrompt }],
    },
    ...userAndAssistantMessages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  ]

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 320,
        },
      }),
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error('Gemini API error', res.status, text)
    throw new Error(
      res.status === 429
        ? 'The πumera tutor is hitting its daily free limit. Please try again later.'
        : 'The πumera tutor could not generate a response right now.'
    )
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
    }>
  }

  const reply =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join(' ').trim() ||
    ''

  if (!reply) {
    throw new Error('The πumera tutor returned an empty response.')
  }

  return reply
}

function buildSystemPrompt(pagePath?: string): string {
  const contextBits: string[] = []

  if (pagePath) {
    contextBits.push(`The user is currently on the page with path: "${pagePath}".`)
  }

  return [
    'You are πumera, an AI math tutor for middle and high school students.',
    '',
    'Scope: Only answer questions about (1) the πumera website and its features (tutoring, units, resources, analytics, etc.), (2) math (algebra and related topics), and (3) study skills or learning in that context. Do NOT answer off-topic questions (e.g. legal questions, general knowledge, sports, entertainment, coding outside of math, etc.). If the user asks something off-topic, politely say you are here to help with πumera, math, and studying, and invite them to ask about those instead.',
    '',
    'Language: Do not respond to profanity, hate speech, harassment, or other inappropriate language. If you detect any such content, politely say that you are here to help with πumera and math in a respectful way, and ask the user to rephrase their question.',
    '',
    'You help students with:',
    '- Understanding and navigating the πumera website and its features (tutoring, units, resources, analytics, etc.).',
    '- Explaining algebra and other math concepts step-by-step.',
    '- Helping them think through problems rather than just giving final answers.',
    '',
    'Guidelines:',
    '- Use friendly, encouraging language.',
    '- Keep answers concise by default: aim for 3–5 short bullet points or fewer than 6 sentences unless the student asks for more detail.',
    '- Break explanations into clear, small steps instead of long paragraphs.',
    '- Whenever possible, relate your help to study skills and good habits, not just computation.',
    '- If you need site-specific details that you do not have (like the exact content of a private dashboard), say so honestly and answer more generally.',
    contextBits.length ? '' : '',
    ...contextBits,
  ]
    .filter(Boolean)
    .join('\n')
}

