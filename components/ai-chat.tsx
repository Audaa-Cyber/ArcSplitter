"use client"

import * as React from "react"
import { useWallet } from "@/components/wallet-provider"
import { loadHistory } from "@/lib/storage"
import { cn } from "@/lib/utils"
import { Bot, X, Send, Loader2, Sparkles, Lock } from "lucide-react"
import { toast } from "sonner"

type Message = {
  role: "user" | "assistant"
  content: string
}

const BOT_NAME = "pengo"
const DAILY_KEY = (addr: string) => `arc:ai:daily:${addr.toLowerCase()}:${new Date().toDateString()}` 

const SUGGESTIONS = [
  "What is Arc Network?",
  "How does ArcSplitter work?",
  "What is the fee for 1000 USDC?",
  "How do I get testnet USDC?",
  "What wallets are supported?",
  "How do I unlock Premium?",
] 

const cleanContent = (content: string) => {
  return content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\{[\s\S]*?\}/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function AIChat() {
  const { address, isConnected } = useWallet()
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [dailyCount, setDailyCount] = React.useState(0)
  const [botAvatar, setBotAvatar] = React.useState<string | null>(null)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Check premium status
  const txCount = React.useMemo(() => {
    if (!address) return 0
    return loadHistory(address).filter((h) => h.status === "confirmed").length
  }, [address])
  const isPremium = txCount >= 5

  // Load daily count
  React.useEffect(() => {
    if (!address) return
    const count = parseInt(localStorage.getItem(DAILY_KEY(address)) ?? "0")
    setDailyCount(count)
    const savedAvatar = localStorage.getItem(`arc:pfp:${address.toLowerCase()}`)
    setBotAvatar(savedAvatar)
  }, [address, open])

  // Scroll to bottom on new message
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when opened
  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // Welcome message
  React.useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: isPremium
          ? `Welcome to ${BOT_NAME}. You have unlimited access. Ask anything about Arc Network, ArcSplitter fees, or how transactions work.`
          : `Welcome to ${BOT_NAME}. You have ${5 - dailyCount} free messages today. Ask anything about Arc or ArcSplitter. Send 5 splits to unlock Premium.`,
      }])
    }
  }, [open, dailyCount, isPremium])

  async function sendMessage() {
    if (!input.trim() || loading) return
    if (!isConnected) {
      toast.error("Connect your wallet first!")
      return
    }

    const userMsg: Message = { role: "user", content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // Update daily count
    const newCount = dailyCount + 1
    if (address) {
      localStorage.setItem(DAILY_KEY(address), newCount.toString())
      setDailyCount(newCount)
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          isPremium,
          dailyCount,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: data.error ?? "Something went wrong. Please try again.",
        }])
        return
      }

      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.content,
      }])

    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again.",
      }])
    } finally {
      setLoading(false)
    }
  }

  async function sendSuggestion(text: string) {
    if (loading) return
    const userMsg: Message = { role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    const newCount = dailyCount + 1
    if (address) {
      localStorage.setItem(DAILY_KEY(address), newCount.toString())
      setDailyCount(newCount)
    }

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          isPremium,
          dailyCount,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.error ?? data.content,
      }])
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const remainingMessages = Math.max(0, 5 - dailyCount)

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-foreground text-background hover:scale-105",
          open && "rotate-90"
        )}
        style={{ boxShadow: "0 0 24px rgba(0,253,255,0.3)" }}
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className={cn(
          "fixed bottom-24 right-6 z-50 flex w-[360px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl",
          "animate-fade-up"
        )}
        style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-foreground">
            {botAvatar ? (
              <img
                src={botAvatar}
                alt={`${BOT_NAME} avatar`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Bot className="h-4 w-4 text-background" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              {BOT_NAME}
              {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfeff] px-2 py-0.5 text-[10px] text-[#067a7c] border border-[#00fdff]/30">
                    <Sparkles className="h-2.5 w-2.5" />
                    Premium
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {isPremium ? "Unlimited messages" : `${remainingMessages} free messages today`}
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-foreground text-background rounded-br-sm"
                    : "bg-muted/50 text-foreground rounded-bl-sm border border-border"
                )}>
                  {cleanContent(m.content)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted/50 border border-border rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            {!loading && messages.length > 0 && messages[messages.length - 1].role === "assistant" && (
              <div className="flex flex-wrap gap-2 px-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendSuggestion(s)}
                    className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground hover:border-[#00fdff] hover:text-foreground transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            {!isPremium && remainingMessages === 0 ? (
              <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Daily limit reached. Send 5 splits to unlock Premium!
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
