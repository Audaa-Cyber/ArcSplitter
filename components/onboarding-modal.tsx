"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Wallet, Users, Zap } from "lucide-react"

const STEPS = [
  {
    icon: Wallet,
    title: "Connect your wallet",
    body: "Use MetaMask, Coinbase, Rabby or WalletConnect. We'll auto-switch you to Arc Testnet.",
  },
  {
    icon: Users,
    title: "Add recipients",
    body: "Paste up to 20 wallet addresses. Split by fixed amount or percentage.",
  },
  {
    icon: Zap,
    title: "Send in one click",
    body: "Sign once. Everyone gets paid in the same transaction. View receipt on Arcscan.",
  },
]

export function OnboardingModal() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const seen = localStorage.getItem("arc:onboarding:seen")
    if (!seen) {
      setTimeout(() => setOpen(true), 1000)
    }
  }, [])

  function handleClose() {
    localStorage.setItem("arc:onboarding:seen", "1")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
        <div className="relative bg-gradient-to-b from-[#ecfeff] to-background dark:from-slate-900 dark:to-background px-6 pt-8 pb-6 border-b border-border">
          <div
            className="pointer-events-none absolute -top-16 left-1/2 h-32 w-72 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
            aria-hidden
          />
          <DialogHeader className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00fdff]" />
              Welcome to ArcSplitter
            </div>
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              How it works
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-4 p-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-medium">{s.title}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <Button
            onClick={handleClose}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            Got it, let's go!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
