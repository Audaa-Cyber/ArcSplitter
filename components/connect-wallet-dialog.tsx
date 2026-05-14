"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/wallet-provider"
import { Loader2, ArrowRight, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

type WalletOption = {
  id: "metamask" | "coinbase" | "injected"
  label: string
  description: string
  src: string
}

const WALLETS: WalletOption[] = [
  {
    id: "metamask",
    label: "MetaMask",
    description: "Most popular browser wallet",
    src: "/wallets/metamask.png",
  },
  {
    id: "coinbase",
    label: "Coinbase Wallet",
    description: "Self custody wallet by Coinbase",
    src: "/wallets/coinbase.png",
  },
  {
    id: "injected",
    label: "WalletConnect",
    description: "Scan with any mobile wallet",
    src: "/wallets/walletconnect.png",
  },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Redirect target after a successful connection. */
  redirectTo?: string | null
}

export function ConnectWalletDialog({ open, onOpenChange, redirectTo = "/app" }: Props) {
  const router = useRouter()
  const { connect, isConnecting, isConnected } = useWallet()
  const [pending, setPending] = React.useState<WalletOption["id"] | null>(null)

  // After a connection completes while the dialog is open, redirect.
  React.useEffect(() => {
    if (open && isConnected && redirectTo) {
      onOpenChange(false)
      router.push(redirectTo)
    }
  }, [open, isConnected, redirectTo, router, onOpenChange])

  async function pick(id: WalletOption["id"]) {
    setPending(id)
    try {
      await connect(id)
    } finally {
      setPending(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-border">
        <div className="relative border-b border-border bg-gradient-to-b from-[#ecfeff] to-background dark:from-slate-900 dark:to-background px-6 pt-7 pb-6">
          <div
            className="absolute -top-16 left-1/2 h-32 w-72 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
            aria-hidden
          />
          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <DialogHeader className="text-left">
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  Connect your wallet
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Choose a wallet to continue to ArcSplitter.
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4">
          {WALLETS.map((w) => {
            const isPending = pending === w.id && isConnecting
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => pick(w.id)}
                disabled={isConnecting}
                className={cn(
                  "group flex w-full items-center gap-4 rounded-2xl border border-border bg-background p-3 text-left transition-all",
                  "hover:border-[#00fdff] hover:shadow-[0_8px_30px_-12px_rgba(0,253,255,0.45)]",
                  "disabled:opacity-60",
                )}
              >
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background overflow-hidden">
                  <Image
                    src={w.src}
                    alt={`${w.label} logo`}
                    width={32}
                    height={32}
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium tracking-tight">{w.label}</div>
                  <div className="text-xs text-muted-foreground">{w.description}</div>
                </div>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            )
          })}
        </div>

        <div className="border-t border-border bg-muted/30 px-6 py-4 text-center text-[11px] leading-relaxed text-muted-foreground">
          New to crypto wallets? We recommend starting with MetaMask. ArcSplitter never holds your funds.
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Drop in button. When clicked it opens the wallet picker.
 * If the user is already connected, it goes straight to the dashboard.
 */
export function ConnectWalletButton({
  children,
  className,
  size = "default",
  variant = "primary",
  redirectTo = "/app",
}: {
  children?: React.ReactNode
  className?: string
  size?: "sm" | "default" | "lg" | "xl"
  variant?: "primary" | "ghost-cyan" | "outline"
  redirectTo?: string | null
}) {
  const [open, setOpen] = React.useState(false)
  const { isConnected } = useWallet()
  const router = useRouter()

  function handleClick() {
    if (isConnected && redirectTo) {
      router.push(redirectTo)
      return
    }
    setOpen(true)
  }

  const sizeClasses =
    size === "xl"
      ? "h-14 px-8 text-base"
      : size === "lg"
        ? "h-12 px-6 text-sm"
        : size === "sm"
          ? "h-9 px-3 text-xs"
          : "h-10 px-4 text-sm"

  const variantClasses =
    variant === "primary"
      ? "border border-cyan-400/40 bg-[#ecfeff]/90 text-foreground shadow-[0_10px_35px_-20px_rgba(0,253,255,0.32)] hover:bg-[#dbfcff] dark:border-cyan-500/40 dark:bg-slate-900/80 dark:text-slate-100"
      : variant === "ghost-cyan"
        ? "bg-transparent text-foreground hover:bg-[#ecfeff]"
        : "border border-border bg-background hover:border-foreground/30"

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-lg font-medium tracking-tight transition-all",
          sizeClasses,
          variantClasses,
          className,
        )}
      >
        {children ?? (isConnected ? "Open Dashboard" : "Connect Wallet")}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
      <ConnectWalletDialog open={open} onOpenChange={setOpen} redirectTo={redirectTo} />
    </>
  )
}
