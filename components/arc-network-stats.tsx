"use client"

import * as React from "react"
import { createPublicClient, http } from "viem"
import { ARC_TESTNET } from "@/lib/arc-config"

const client = createPublicClient({
  chain: {
    id: ARC_TESTNET.chainId,
    name: ARC_TESTNET.name,
    nativeCurrency: ARC_TESTNET.currency,
    rpcUrls: { default: { http: [ARC_TESTNET.rpcUrl] } },
  },
  transport: http(ARC_TESTNET.rpcUrl),
})

export function ArcNetworkStats() {
  const [blockNumber, setBlockNumber] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<"online" | "offline">("online")
  const [latency, setLatency] = React.useState<number | null>(null)

  React.useEffect(() => {
    async function fetchStats() {
      const start = Date.now()
      try {
        const block = await client.getBlockNumber()
        const end = Date.now()
        setBlockNumber(block.toLocaleString())
        setLatency(end - start)
        setStatus("online")
      } catch {
        setStatus("offline")
      }
    }
    fetchStats()
    const interval = setInterval(fetchStats, 12000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: status === "online" ? "#00fdff" : "#ef4444",
            boxShadow: status === "online" ? "0 0 6px #00fdff" : "none",
          }}
        />
        <span className="font-medium text-foreground">Arc Testnet</span>
        <span>{status === "online" ? "Online" : "Offline"}</span>
      </div>
      {blockNumber && (
        <div className="flex items-center gap-1">
          <span>Block</span>
          <span className="font-mono font-medium text-foreground">#{blockNumber}</span>
        </div>
      )}
      {latency && (
        <div className="flex items-center gap-1">
          <span>Latency</span>
          <span className="font-mono font-medium text-foreground">{latency}ms</span>
        </div>
      )}
      <a
        href="https://testnet.arcscan.app"
        target="_blank"
        rel="noreferrer"
        className="ml-auto hover:text-foreground transition-colors"
      >
        View Explorer →
      </a>
    </div>
  )
}
