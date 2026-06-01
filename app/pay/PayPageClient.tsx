"use client"

import * as React from "react"
import { SplitterCard } from "@/components/splitter-card"
import { ArcNetworkStats } from "@/components/arc-network-stats"
import { ArcLogo } from "@/components/arc-logo"
import { AppNavbar } from "@/components/app-navbar"
import { NetworkBanner } from "@/components/network-banner"
import { AIChat } from "@/components/ai-chat"

export default function PayPageClient() {
  const [searchParams, setSearchParams] = React.useState(() => new URLSearchParams(""))

  React.useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search))
  }, [])

  const total = searchParams.get("total") ?? ""
  const mode = (searchParams.get("mode") ?? "fixed") as "fixed" | "percentage"
  const note = searchParams.get("note") ?? ""

  // Parse recipients: r0=address,amount,label r1=address,amount,label
  const recipients: { address: string; amount: string; label: string }[] = []
  let i = 0
  while (searchParams.has(`r${i}`)) {
    const parts = (searchParams.get(`r${i}`) ?? "").split(",")
    recipients.push({
      address: parts[0] ?? "",
      amount: parts[1] ?? "",
      label: parts[2] ?? "",
    })
    i++
  }

  const hasData = recipients.length > 0 || total

  return (
    <div suppressHydrationWarning className="min-h-screen bg-background">
      <AppNavbar />
      <NetworkBanner />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="space-y-8">
          <div className="flex flex-col gap-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Payment Link</div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {note || "You've received a payment request"}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {hasData
                ? "This payment has been pre-filled for you. Connect your wallet and send."
                : "Connect your wallet to send a split payment."}
            </p>
          </div>
          <ArcNetworkStats />
          <SplitterCard
            prefillTotal={total}
            prefillMode={mode}
            prefillRecipients={recipients.length > 0 ? recipients : undefined}
          />
        </div>
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            Built on Arc Testnet ·{' '}
            <a
              href="https://github.com/The-offlines"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              The Offlines
            </a>
          </span>
          <div className="flex items-center gap-4">
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              Get Testnet USDC
            </a>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              Arcscan Explorer
            </a>
            <a href="https://docs.arc.io" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              Arc Docs
            </a>
          </div>
        </div>
      </footer>
      <AIChat />
    </div>
  )
}
