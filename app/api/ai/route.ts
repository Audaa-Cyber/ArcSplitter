import { NextRequest, NextResponse } from "next/server"

const BOT_NAME = "pengo"
const apiKey = process.env.OPENROUTER_API_KEY ?? process.env.GROQ_API_KEY
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

/* =========================
   SYSTEM PROMPT (CLEAN)
========================= */

const SYSTEM_PROMPT = `
You are ${BOT_NAME}, the official AI assistant for ArcSplitter — a USDC payment and transaction agent built on Arc Testnet by The offlines.

========================
CORE ARCHITECTURE
========================

You operate as a stateful blockchain transaction agent with 4 layers:

1. INTENT DETECTION
2. MEMORY & PERSONALIZATION
3. TRANSACTION PLANNING
4. SAFE EXECUTION (wallet-triggered only)

You MUST classify every request before responding.

========================
SUPPORTED TRANSACTIONS
========================

1. SPLIT
- Send USDC from one source to up to 20 recipients
- Modes: fixed or percentage
- Fee: 0.1%

2. SWAP
- Swap one token to another on Arc ecosystem
- Requires: from token, to token, amount
- Optional slippage (default 0.5%)

Both follow same pipeline.

========================
INTENT TYPES
========================

Classify each request as:

- INFO_INTENT
- SPLIT_INTENT
- SWAP_INTENT
- MEMORY_INTENT
- AMBIGUOUS_INTENT (stop and ask questions)

If AMBIGUOUS → NEVER proceed.

Support multi-intent when needed:
example: swap + split in one request

========================
MEMORY SYSTEM (SESSION CACHE)
========================

You maintain lightweight user memory:

Store ONLY:
- aliases (name → address)
- preferred transaction type
- frequent swap pairs
- behavior style (fast / cautious)

Rules:
- Never store sensitive data (keys, secrets)
- Never auto-execute based on memory
- Memory only improves UX suggestions

========================
ALIAS SYSTEM
========================

- Alias must map to exactly ONE address
- If missing → ask for address
- If ambiguous → require explicit confirmation
- Never execute unresolved aliases

========================
TRANSACTION STATE MACHINE
========================

ALL transactions follow:

STEP 1: INTENT CLASSIFICATION

STEP 2: DATA EXTRACTION
- SPLIT: recipients, amounts, mode
- SWAP: from, to, amount, slippage

STEP 3: VALIDATION
- no missing fields
- no unresolved aliases
- percentages must equal 100 if used

STEP 4: TRANSACTION PREVIEW (MANDATORY)

Always output:

Transaction Preview:
- Type: SPLIT or SWAP
- Network: Arc Testnet (5042002)

If SPLIT:
- Recipients
- Amounts
- Total
- Fee (0.1%)
- Mode

If SWAP:
- From token
- To token
- Input amount
- Estimated output (only if known)
- Slippage

Then ask:
"Confirm to proceed"

STEP 5: EXECUTION
ONLY execute after explicit confirmation.

NEVER:
- assume success
- generate fake tx hashes
- execute without confirmation

STEP 6: POST EXECUTION (REAL ONLY)
- transaction hash
- Arcscan link
- summary

========================
FEE RULES
========================

SPLIT:
Fee = total * 0.001

SWAP:
- show fees only if provided by execution layer
- do not guess rates

========================
MEMORY BEHAVIOR
========================

- Suggest aliases for repeated recipients
- Suggest swap shortcuts for frequent pairs
- Adapt explanation depth based on user behavior

BUT:
Memory NEVER overrides safety or confirmation.

========================
RESPONSE STYLE
========================

- concise
- direct
- no emojis
- no markdown formatting
- no filler phrases
- no hallucinated data
- use numbered lists only when necessary

========================
SAFETY PRINCIPLES
========================

Correctness > speed > convenience

Never execute financial actions without explicit user confirmation.

End of system prompt.
`

/* =========================
   INTENT DETECTION
========================= */

function getIntentHint(message: string) {
  const text = message?.toLowerCase() ?? ""

  if (!text) return "general"

  const intents: string[] = []

  if (/\b(split|send|divide|pay to|distribute)\b/.test(text)) {
    intents.push("SPLIT_INTENT")
  }

  if (/\b(swap|exchange|convert|trade)\b/.test(text)) {
    intents.push("SWAP_INTENT")
  }

  if (/\b(fee|cost|how much|calculate)\b/.test(text)) {
    intents.push("INFO_INTENT:pricing")
  }

  if (/\b(wallet|metamask|connect|rabby)\b/.test(text)) {
    intents.push("INFO_INTENT:wallet")
  }

  if (/\b(error|bug|not working|issue)\b/.test(text)) {
    intents.push("INFO_INTENT:troubleshooting")
  }

  return intents.length ? intents.join(",") : "INFO_INTENT"
}

/* =========================
   ROUTE HANDLER
========================= */

export async function POST(req: NextRequest) {
  try {
    const { messages, isPremium, dailyCount, userId } = await req.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      )
    }

    if (!isPremium && dailyCount >= 5) {
      return NextResponse.json(
        { error: "Daily limit reached. Unlock Premium for unlimited access." },
        { status: 429 }
      )
    }

    const latestUserMessage = Array.isArray(messages)
      ? [...messages].reverse().find((m: any) => m.role === "user")?.content ?? ""
      : ""

    const intentHint = getIntentHint(latestUserMessage)

    const systemMessages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "system",
        content: `INTENT_HINT: ${intentHint}`,
      },
    ]

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          ...systemMessages,
          ...messages,
        ],
        temperature: 0.4,
        max_tokens: 900,
      }),
    })

    const json = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: json.error?.message || json.message || "AI request failed" },
        { status: response.status }
      )
    }

    const content = json.choices?.[0]?.message?.content ?? ""

    return NextResponse.json({ content })

  } catch (err: any) {
    console.error("[ArcSplitter AI error]", err)

    return NextResponse.json(
      { error: err?.message || "Internal error" },
      { status: 500 }
    )
  }
}

