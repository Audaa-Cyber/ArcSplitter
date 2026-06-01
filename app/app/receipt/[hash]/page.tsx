"use client"

import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { ARC_TESTNET } from "@/lib/arc-config"
import { ExternalLink, Check, Copy, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QRCode } from "@/components/qr-code"
import Link from "next/link"

export default function ReceiptPage() {
  const { hash } = useParams<{ hash: string }>()
  const searchParams = useSearchParams()
  const [copied, setCopied] = React.useState(false)

  const amount = searchParams.get("amount") ?? "10"
  const recipients = searchParams.get("recipients") ?? "2"
  const fee = searchParams.get("fee") ?? "0.01"
  const network = searchParams.get("network") ?? "Arc Network"
  const date = searchParams.get("date") ?? formatUTC(new Date())
  const txHash = hash ?? ""
  const shortHash = txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}` : ""
  const txUrl = txHash ? `${ARC_TESTNET.explorerUrl}/tx/${txHash}` : ""

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl space-y-6">

        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to ArcSplitter
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_80px_-32px_rgba(0,0,0,0.35)]">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-52 w-[28rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
            aria-hidden
          />

          <div className="relative grid gap-8 px-6 py-8 md:grid-cols-[1fr_172px] md:px-10 md:py-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-[#00fdff] font-medium">ArcSplitter</div>
                <h1 className="text-3xl font-semibold tracking-tight">Payment Receipt</h1>
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Transaction details for this split. Scan the QR code to view the transaction on Arcscan.
                </p>
              </div>

              <div className="grid gap-3 rounded-[2rem] border border-border bg-muted/50 p-5 text-sm">
                <ReceiptField label="Amount" value={`${amount} USDC`} />
                <ReceiptField label="Recipients" value={`${recipients}`} />
                <ReceiptField label="Platform Fee" value={`${fee} USDC`} />
                <ReceiptField label="Network" value={network} />
                <ReceiptField label="Date" value={date} />
                <ReceiptField label="TX Hash" value={shortHash} />
              </div>
            </div>

            <div className="flex items-end justify-end">
              {txHash ? (
                <div className="rounded-[2rem] border border-border bg-background p-4 shadow-sm">
                  <QRCode value={txUrl} size={172} />
                  <div className="mt-3 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    Scan for transaction details
                  </div>
                </div>
              ) : (
                <div className="flex h-[172px] w-[172px] items-center justify-center rounded-[2rem] border border-border bg-muted/30 text-center text-xs text-muted-foreground">
                  Transaction QR will appear here
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border px-6 py-5 md:px-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{network}</p>
                <p className="truncate">{txHash}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={copyLink} variant="outline" className="flex items-center gap-2">
                  {copied ? <Check className="h-3.5 w-3.5 text-[#00fdff]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy receipt link"}
                </Button>
                {txUrl && (
                  <a
                    href={txUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  >
                    Full details
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-background px-4 py-4 shadow-sm shadow-black/5">
      <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

function formatUTC(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date) + " UTC"
}
