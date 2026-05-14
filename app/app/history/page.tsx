"use client"

import * as React from "react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, ExternalLink, ScrollText, Wallet } from "lucide-react"
import { loadHistory, type HistoryEntry } from "@/lib/storage"
import { ARC_TESTNET } from "@/lib/arc-config"
import { formatUSDC, shortAddr } from "@/lib/format"

export default function HistoryPage() {
  const { address, isConnected } = useWallet()
  const [history, setHistory] = React.useState<HistoryEntry[]>([])

  React.useEffect(() => {
    if (address) setHistory(loadHistory(address))
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
          <div className="hidden grid-cols-[1.4fr_120px_120px_1fr_100px] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground md:grid">
            <span>Transaction</span>
            <span>Amount</span>
            <span>Recipients</span>
            <span>Date</span>
            <span className="text-right">Status</span>
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

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const date = new Date(entry.createdAt)
  return (
    <li className="grid grid-cols-1 gap-3 px-5 py-4 transition-colors hover:bg-muted/20 md:grid-cols-[1.4fr_120px_120px_1fr_100px] md:items-center md:gap-4">
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
      <div className="md:text-right">
        <StatusBadge status={entry.status} />
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
