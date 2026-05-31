"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { ARC_TESTNET } from "@/lib/arc-config"
import { ExternalLink, Check, Copy, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ReceiptPage() {
  const { hash } = useParams<{ hash: string }>()
  const [copied, setCopied] = React.useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shortHash = hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : ""

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg space-y-6">

        {/* Back link */}
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to ArcSplitter
        </Link>

        {/* Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_8px_40px_-20px_rgba(0,0,0,0.25)]">

          {/* Cyan glow */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
            aria-hidden
          />

          {/* Header */}
          <div className="relative flex flex-col items-center gap-4 border-b border-border px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#00fdff] bg-background shadow-[0_0_20px_rgba(0,253,255,0.25)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#00fdff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#00fdff] font-medium">ArcSplitter</div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Payment Receipt</h1>
              <p className="mt-1 text-sm text-muted-foreground">This payment was sent on Arc Testnet</p>
            </div>
          </div>

          {/* TX Hash row */}
          <div className="px-6 py-4 border-b border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Transaction</div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-foreground truncate">{shortHash}</span>
              <a
                href={`${ARC_TESTNET.explorerUrl}/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-secondary transition-colors"
              >Arcscan <ExternalLink className="h-3 w-3" /></a>
            </div>
          </div>

          {/* Info rows */}
          <div className="divide-y divide-border">
            <InfoRow label="Network" value="Arc Testnet" />
            <InfoRow label="Token" value="USDC" />
            <InfoRow label="Protocol" value="ArcSplitter V2" />
            <InfoRow label="Date" value={new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
          </div>

          {/* Footer actions */}
          <div className="flex flex-col gap-2 px-6 py-5 sm:flex-row">
            <Button
              onClick={copyLink}
              variant="outline"
              className="flex-1 gap-2"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#00fdff]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy receipt link"}
            </Button>
            <a
              href={`${ARC_TESTNET.explorerUrl}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
            >
              Full details
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Built on Arc */}
          <div className="border-t border-border px-6 py-3 text-center text-[10px] text-muted-foreground">
            Built on Arc Network · <a href="https://arc.network" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">arc.network</a>
          </div>
        </div>

      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
