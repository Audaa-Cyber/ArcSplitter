"use client"

import * as React from "react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ExternalLink, ScrollText, Wallet, Loader2, Download } from "lucide-react"
import { loadHistory, type HistoryEntry } from "@/lib/storage"
import { ARC_TESTNET } from "@/lib/arc-config"
import { formatUSDC, shortAddr } from "@/lib/format"
import { fetchOnChainHistory, type OnChainSplit } from "@/lib/fetch-history"
import { formatUnits } from "viem"

export default function HistoryPage() {
  const { address, isConnected } = useWallet()
  const [history, setHistory] = React.useState<HistoryEntry[]>([])
  const [onChainHistory, setOnChainHistory] = React.useState<OnChainSplit[]>([])
  const [loadingChain, setLoadingChain] = React.useState(false)
  const [tab, setTab] = React.useState<"local" | "onchain">("onchain")

  React.useEffect(() => {
    if (address) setHistory(loadHistory(address))
  }, [address])

  React.useEffect(() => {
    if (!address) return
    setLoadingChain(true)
    fetchOnChainHistory(address as any)
      .then(setOnChainHistory)
      .catch(() => setOnChainHistory([]))
      .finally(() => setLoadingChain(false))
  }, [address])

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Transaction history</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Your splits</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every payment you&apos;ve sent from this wallet, with on chain status. Verifiable on Arcscan.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-secondary/50 p-0.5 text-sm">
          <button
            type="button"
            onClick={() => setTab("onchain")}
            className={`rounded-md px-3 py-1.5 transition-all ${tab === "onchain" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            On-chain
          </button>
          <button
            type="button"
            onClick={() => setTab("local")}
            className={`rounded-md px-3 py-1.5 transition-all ${tab === "local" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Local cache
          </button>
        </div>
        <Link href="/app">
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            New split
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {!isConnected ? (
        <EmptyState
          icon={Wallet}
          title="Connect your wallet"
          body="Connect to view your transaction history."
        />
      ) : tab === "onchain" ? (
        loadingChain ? (
          <Card className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Fetching on-chain history...</p>
          </Card>
        ) : onChainHistory.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No on-chain transactions yet"
            body="Once you send a split, it will appear here with a link to Arcscan."
            action={
              <Link href="/app">
                <Button variant="outline">Send a split</Button>
              </Link>
            }
          />
        ) : (
          <Card className="overflow-hidden border-border p-0">
            <div className="hidden grid-cols-[1.4fr_120px_120px_1fr_100px_40px] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground md:grid">
              <span>Transaction</span>
              <span>Amount</span>
              <span>Recipients</span>
              <span>Date</span>
              <span className="text-right">Status</span>
              <span></span>
            </div>
            <ul className="divide-y divide-border">
              {onChainHistory.map((h, i) => (
                <OnChainRow key={h.txHash + i} entry={h} />
              ))}
            </ul>
          </Card>
        )
      ) : history.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No transactions yet"
          body="Once you send a split, it will appear here with a link to Arcscan."
          action={
            <Link href="/app">
              <Button variant="outline">Send a split</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden border-border p-0">
          <div className="hidden grid-cols-[1.4fr_120px_120px_1fr_100px_40px] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground md:grid">
            <span>Transaction</span>
            <span>Amount</span>
            <span>Recipients</span>
            <span>Date</span>
            <span className="text-right">Status</span>
            <span></span>
          </div>
          <ul className="divide-y divide-border">
            {history.map((h) => (
              <HistoryRow key={h.id} entry={h} />
            ))}
          </ul>
        </Card>
      )}

      {isConnected && address && history.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing history for <span className="font-mono">{shortAddr(address)}</span>
        </div>
      )}
    </div>
  )
}

function downloadReceipt({
  hash,
  total,
  count,
  fee,
  date,
}: {
  hash: string
  total: string
  count: number
  fee?: string
  date: string
}) {
  const canvas = document.createElement("canvas")
  canvas.width = 600
  canvas.height = 480
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  ctx.fillStyle = "#0a0a0a"
  ctx.fillRect(0, 0, 600, 480)

  const gradient = ctx.createRadialGradient(300, 0, 0, 300, 0, 300)
  gradient.addColorStop(0, "rgba(0,253,255,0.15)")
  gradient.addColorStop(1, "rgba(0,253,255,0)")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 600, 480)

  ctx.strokeStyle = "#1a1a1a"
  ctx.lineWidth = 1
  ctx.strokeRect(1, 1, 598, 478)

  ctx.fillStyle = "#00fdff"
  ctx.font = "bold 13px monospace"
  ctx.fillText("ARCSPLITTER", 40, 50)

  ctx.fillStyle = "#ffffff"
  ctx.font = "bold 28px sans-serif"
  ctx.fillText("Payment Receipt", 40, 85)

  ctx.strokeStyle = "#222222"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, 105)
  ctx.lineTo(560, 105)
  ctx.stroke()

  const stats: [string, string][] = [
    ["Total Sent", `${total} USDC`],
    ["Recipients", `${count} wallets`],
    ["Platform Fee", fee ? `${fee} USDC (0.1%)` : "0.1%"],
    ["Date", date],
  ]

  stats.forEach(([label, value], i) => {
    const y = 145 + i * 52
    ctx.fillStyle = "#666666"
    ctx.font = "12px sans-serif"
    ctx.fillText(label.toUpperCase(), 40, y)
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px monospace"
    ctx.fillText(value, 40, y + 20)
  })

  ctx.strokeStyle = "#222222"
  ctx.beginPath()
  ctx.moveTo(40, 380)
  ctx.lineTo(560, 380)
  ctx.stroke()

  ctx.fillStyle = "#444444"
  ctx.font = "10px monospace"
  ctx.fillText("TX HASH", 40, 405)
  ctx.fillStyle = "#888888"
  ctx.font = "10px monospace"
  ctx.fillText(hash.slice(0, 42) + "...", 40, 420)

  ctx.fillStyle = "#333333"
  ctx.font = "11px sans-serif"
  ctx.fillText("Built on Arc Network · arc.network", 40, 460)

  const link = document.createElement("a")
  link.download = `arcsplitter-receipt-${hash.slice(0, 10)}.png`
  link.href = canvas.toDataURL("image/png")
  link.click()
}

function OnChainRow({ entry }: { entry: OnChainSplit }) {
  const date = entry.timestamp > 0n ? new Date(Number(entry.timestamp) * 1000) : null
  const total = formatUnits(entry.totalSent, 18)
  return (
    <li className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-muted/20 md:grid-cols-[1.4fr_120px_120px_1fr_100px_40px] md:items-center md:gap-4">
      <a
        href={`${ARC_TESTNET.explorerUrl}/tx/${entry.txHash}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-2 font-mono text-xs hover:text-foreground"
      >
        <span className="truncate">{entry.txHash}</span>
        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </a>
      <div className="font-mono text-sm tabular-nums">
        {formatUSDC(total)}
        <span className="ml-1 text-xs text-muted-foreground">USDC</span>
      </div>
      <div className="text-sm">
        <span className="font-mono tabular-nums">{entry.recipients.length}</span>
        <span className="ml-1 text-xs text-muted-foreground">wallets</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {date ? `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "—"}
      </div>
      <div className="md:text-right flex items-center justify-end gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#ecfeff] text-[#067a7c]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00fdff]" />
          Confirmed
        </span>
        <button
          onClick={() => downloadReceipt({
            hash: entry.txHash,
            total: formatUSDC(formatUnits(entry.totalSent, 18)),
            count: entry.recipients.length,
            date: date ? date.toLocaleString() : "—",
          })}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Download receipt"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  )
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const date = new Date(entry.createdAt)
  return (
    <li className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-muted/20 md:grid-cols-[1.4fr_120px_120px_1fr_100px_40px] md:items-center md:gap-4">
      <a
        href={`${ARC_TESTNET.explorerUrl}/tx/${entry.txHash}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-2 font-mono text-xs hover:text-foreground"
      >
        <span className="truncate">{entry.txHash}</span>
        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      </a>
      <div className="font-mono text-sm tabular-nums">
        {formatUSDC(entry.total)}
        <span className="ml-1 text-xs text-muted-foreground">USDC</span>
      </div>
      <div className="text-sm">
        <span className="font-mono tabular-nums">{entry.recipientCount}</span>
        <span className="ml-1 text-xs text-muted-foreground">wallets</span>
      </div>
      <div className="text-xs text-muted-foreground">
        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="md:text-right flex items-center justify-end gap-2">
        <StatusBadge status={entry.status} />
        <button
          onClick={() => downloadReceipt({
            hash: entry.txHash,
            total: formatUSDC(entry.total),
            count: entry.recipientCount,
            date: date.toLocaleString(),
          })}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Download receipt"
        >
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  )
}

function StatusBadge({ status }: { status: HistoryEntry["status"] }) {
  const map = {
    pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    confirmed: { label: "Confirmed", bg: "bg-[#ecfeff]", text: "text-[#067a7c]", dot: "bg-[#00fdff]" },
    failed: { label: "Failed", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  } as const
  const s = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-border bg-muted/20 px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-base font-medium">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  )
}
