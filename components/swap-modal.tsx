"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/components/wallet-provider"
import { SWAP_CONTRACTS, SWAP_TOKENS, ARC_TESTNET } from "@/lib/arc-config"
import { getSwapQuote, getEURCBalance, executeSwap } from "@/lib/swap"
import { parseUnits, formatUnits } from "viem"
import { ArrowUpDown, Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"

type Token = typeof SWAP_TOKENS[number]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultAmountIn?: string
  onSwapComplete?: () => void
}

export function SwapModal({ open, onOpenChange, defaultAmountIn, onSwapComplete }: Props) {
  const { address, provider, refreshBalance, balance } = useWallet()

  const [tokenIn, setTokenIn] = React.useState<Token>(SWAP_TOKENS[1]) // EURC
  const [tokenOut, setTokenOut] = React.useState<Token>(SWAP_TOKENS[0]) // USDC
  const [amountIn, setAmountIn] = React.useState(defaultAmountIn ?? "")
  const [amountOut, setAmountOut] = React.useState("")
  const [priceImpact, setPriceImpact] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [quoteLoading, setQuoteLoading] = React.useState(false)
  const [balanceIn, setBalanceIn] = React.useState("0.00")
  const [txHash, setTxHash] = React.useState<string | null>(null)

  // Load balance of tokenIn
  React.useEffect(() => {
    if (!address || !open) return
    if (tokenIn.symbol === "EURC") {
      getEURCBalance(address as any).then(setBalanceIn)
    } else if (tokenIn.symbol === "USDC") {
      // Read USDC ERC-20 balance directly
      getEURCBalance(SWAP_CONTRACTS.USDC_ERC20 as any).then(() => {}).catch(() => {})
      // Use wallet context balance (native USDC)
      setBalanceIn(balance ?? "0.00")
    } else {
      setBalanceIn("0.00")
    }
  }, [address, tokenIn, open, balance])

  // Set default amount when opened
  React.useEffect(() => {
    if (open && defaultAmountIn) {
      setAmountIn(defaultAmountIn)
    }
  }, [open, defaultAmountIn])

  // Get quote when amountIn changes
  React.useEffect(() => {
    if (!amountIn || Number(amountIn) <= 0) {
      setAmountOut("")
      setPriceImpact(null)
      return
    }
    const timeout = setTimeout(async () => {
      setQuoteLoading(true)
      const quote = await getSwapQuote(
        tokenIn.address,
        tokenOut.address,
        amountIn,
        tokenIn.decimals,
        tokenOut.decimals
      )
      if (quote) {
        setAmountOut(Number(quote.amountOut).toFixed(6))
        setPriceImpact(quote.priceImpact)
      } else {
        setAmountOut("")
        setPriceImpact(null)
      }
      setQuoteLoading(false)
    }, 500)
    return () => clearTimeout(timeout)
  }, [amountIn, tokenIn, tokenOut])

  function flipTokens() {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn(amountOut)
    setAmountOut(amountIn)
  }

  async function handleSwap() {
    if (!address || !provider || !amountIn || !amountOut) return
    setLoading(true)
    setTxHash(null)
    try {
      const minOut = (Number(amountOut) * 0.99).toFixed(6)
      toast.loading("Approving token...", { id: "swap" })
      const hash = await executeSwap(
        tokenIn.address,
        tokenOut.address,
        amountIn,
        tokenIn.decimals,
        minOut,
        tokenOut.decimals,
        provider,
        address as any
      )
      setTxHash(hash)
      toast.success(
        `Swapped ${amountIn} ${tokenIn.symbol} → ${Number(amountOut).toFixed(4)} ${tokenOut.symbol}`,
        { id: "swap" }
      )
      refreshBalance()
      onSwapComplete?.()
      setAmountIn("")
      setAmountOut("")
    } catch (err: any) {
      if (err?.code === 4001 || err?.message?.includes("rejected") || err?.message?.includes("cancelled")) {
        toast.error("Transaction cancelled", { id: "swap" })
      } else {
        console.error("[swap] failed", err)
        toast.error(err?.message || "Swap failed", { id: "swap" })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
        <div className="relative border-b border-border bg-gradient-to-b from-[#ecfeff] to-background dark:from-slate-900 dark:to-background px-6 pt-7 pb-6">
          <div
            className="pointer-events-none absolute -top-16 left-1/2 h-32 w-72 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
            aria-hidden
          />
          <DialogHeader className="relative">
            <DialogTitle className="text-lg font-semibold tracking-tight">Swap tokens</DialogTitle>
            <p className="text-xs text-muted-foreground">Simple Pool LP on Arc Testnet</p>
          </DialogHeader>
        </div>

        <div className="space-y-3 p-4">
          {/* Token In */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">You pay</span>
              <button
                onClick={() => setAmountIn(balanceIn)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Balance: {Number(balanceIn).toFixed(2)} {tokenIn.symbol}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Image src={tokenIn.logo} alt={tokenIn.symbol} width={20} height={20} className="rounded-full" />
                <span className="text-sm font-medium">{tokenIn.symbol}</span>
              </div>
              <Input
                inputMode="decimal"
                placeholder="0.00"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value.replace(/[^0-9.]/g, ""))}
                className="flex-1 border-0 bg-transparent text-right font-mono text-lg shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {/* Flip button */}
          <div className="flex justify-center">
            <button
              onClick={flipTokens}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background hover:bg-secondary transition-colors"
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Token Out */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">You receive</span>
              {quoteLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <Image src={tokenOut.logo} alt={tokenOut.symbol} width={20} height={20} className="rounded-full" />
                <span className="text-sm font-medium">{tokenOut.symbol}</span>
              </div>
              <div className="flex-1 text-right font-mono text-lg text-muted-foreground">
                {amountOut || "0.00"}
              </div>
            </div>
          </div>

          {/* Price impact warning */}
          {priceImpact !== null && priceImpact > 1 && (
            <div className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
              priceImpact > 5 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
            )}>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Price impact: {priceImpact.toFixed(2)}%
              {priceImpact > 5 && " — High impact, consider a smaller amount"}
            </div>
          )}

          {/* Rate */}
          {amountIn && amountOut && (
            <div className="text-xs text-muted-foreground text-center">
              1 {tokenIn.symbol} ≈ {(Number(amountOut) / Number(amountIn)).toFixed(4)} {tokenOut.symbol}
            </div>
          )}

          {/* Swap button */}
          <Button
            onClick={handleSwap}
            disabled={!amountIn || !amountOut || loading || quoteLoading}
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              `Swap ${tokenIn.symbol} → ${tokenOut.symbol}` 
            )}
          </Button>

          {/* TX Hash */}
          {txHash && (
            <a
              href={`${ARC_TESTNET.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              View transaction
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
