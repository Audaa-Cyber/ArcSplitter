"use client"

import * as React from "react"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SWAP_CONTRACTS, SWAP_TOKENS, ARC_TESTNET } from "@/lib/arc-config"
import { getSwapQuote, getEURCBalance, executeSwap, addLiquidity } from "@/lib/swap"
import { parseUnits } from "viem"
import { ArrowUpDown, Loader2, AlertTriangle, ExternalLink, Droplets, Settings } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { cn } from "@/lib/utils"

type Token = typeof SWAP_TOKENS[number]

export default function SwapPage() {
  const { address, provider, refreshBalance, balance } = useWallet()

  // swap state
  const [tokenIn, setTokenIn] = React.useState<Token>(SWAP_TOKENS[1]) // EURC
  const [tokenOut, setTokenOut] = React.useState<Token>(SWAP_TOKENS[0]) // USDC
  const [amountIn, setAmountIn] = React.useState("")
  const [amountOut, setAmountOut] = React.useState("")
  const [priceImpact, setPriceImpact] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [quoteLoading, setQuoteLoading] = React.useState(false)
  const [balanceIn, setBalanceIn] = React.useState("0.00")
  const [txHash, setTxHash] = React.useState<string | null>(null)

  // liquidity state
  const [showLiquidity, setShowLiquidity] = React.useState(false)
  const [liqEURC, setLiqEURC] = React.useState("")
  const [liqUSDC, setLiqUSDC] = React.useState("")
  const [liqLoading, setLiqLoading] = React.useState(false)
  const [liqTxHash, setLiqTxHash] = React.useState<string | null>(null)
  const [eurcBalance, setEurcBalance] = React.useState("0.00")

  React.useEffect(() => {
    if (!address) return
    getEURCBalance(address as any).then(setEurcBalance)
    if (tokenIn.symbol === "EURC") {
      getEURCBalance(address as any).then(setBalanceIn)
    } else {
      setBalanceIn(balance ?? "0.00")
    }
  }, [address, tokenIn, balance])

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
      toast.success(`Swapped ${amountIn} ${tokenIn.symbol} → ${Number(amountOut).toFixed(4)} ${tokenOut.symbol}`, { id: "swap" })
      refreshBalance()
      getEURCBalance(address as any).then(setEurcBalance)
      setAmountIn("")
      setAmountOut("")
    } catch (err: any) {
      toast.error(err?.message || "Swap failed", { id: "swap" })
    } finally {
      setLoading(false)
    }
  }

  async function handleAddLiquidity() {
    if (!address || !provider || !liqEURC || !liqUSDC) return
    setLiqLoading(true)
    setLiqTxHash(null)
    try {
      toast.loading("Approving EURC...", { id: "liq" })
      const hash = await addLiquidity(liqEURC, liqUSDC, provider, address as any)
      setLiqTxHash(hash)
      toast.success("Liquidity added successfully", { id: "liq" })
      refreshBalance()
      getEURCBalance(address as any).then(setEurcBalance)
      setLiqEURC("")
      setLiqUSDC("")
    } catch (err: any) {
      toast.error(err?.message || "Add liquidity failed", { id: "liq" })
    } finally {
      setLiqLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Swap</h1>
          <p className="text-sm text-muted-foreground">Arc Testnet Only</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLiquidity(!showLiquidity)}
          className={cn("gap-2", showLiquidity && "border-primary text-primary")}
        >
          <Droplets className="h-4 w-4" />
          {showLiquidity ? "Hide Liquidity" : "Add Liquidity"}
        </Button>
      </div>

      {/* swap card */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        {/* token in */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">From</span>
            <button
              onClick={() => setAmountIn(balanceIn)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Balance: {Number(balanceIn).toFixed(4)} {tokenIn.symbol}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shrink-0">
              <Image src={tokenIn.logo} alt={tokenIn.symbol} width={20} height={20} className="rounded-full" />
              <span className="text-sm font-medium">{tokenIn.symbol}</span>
            </div>
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value.replace(/[^0-9.]/g, ""))}
              className="flex-1 border-0 bg-transparent text-right font-mono text-xl shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        {/* flip */}
        <div className="flex justify-center">
          <button
            onClick={flipTokens}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background hover:bg-secondary transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>

        {/* token out */}
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">To</span>
            {quoteLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shrink-0">
              <Image src={tokenOut.logo} alt={tokenOut.symbol} width={20} height={20} className="rounded-full" />
              <span className="text-sm font-medium">{tokenOut.symbol}</span>
            </div>
            <div className="flex-1 text-right font-mono text-xl text-muted-foreground">
              {amountOut || "0.00"}
            </div>
          </div>
        </div>

        {/* price impact */}
        {priceImpact !== null && priceImpact > 1 && (
          <div className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
            priceImpact > 5 ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
          )}>
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Price impact: {priceImpact.toFixed(2)}%
            {priceImpact > 5 && " — High impact, consider a smaller amount"}
          </div>
        )}

        {/* rate */}
        {amountIn && amountOut && (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span>Rate</span>
            <span className="text-right font-mono">1 {tokenIn.symbol} ≈ {(Number(amountOut) / Number(amountIn)).toFixed(4)} {tokenOut.symbol}</span>
            <span>Price impact</span>
            <span className="text-right font-mono">{priceImpact?.toFixed(2) ?? "—"}%</span>
            <span>Max slippage</span>
            <span className="text-right font-mono">1.00%</span>
            <span>Receive at least</span>
            <span className="text-right font-mono">{amountOut ? (Number(amountOut) * 0.99).toFixed(4) : "—"} {tokenOut.symbol}</span>
          </div>
        )}

        {/* swap button */}
        <Button
          onClick={handleSwap}
          disabled={!amountIn || !amountOut || loading || quoteLoading || !address}
          className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90"
        >
          {!address ? "Connect Wallet" : loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Swapping...</>
          ) : (
            `Swap ${tokenIn.symbol} → ${tokenOut.symbol}` 
          )}
        </Button>

        {txHash && (
          <a
            href={ARC_TESTNET.explorerUrl + "/tx/" + txHash}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
          >
            View transaction <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* liquidity card */}
      {showLiquidity && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-4">
          <div>
            <h2 className="font-semibold">Add Liquidity</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add EURC + USDC to the pool. Ratio determines the swap rate.
              Current EURC balance: {Number(eurcBalance).toFixed(4)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">EURC amount</span>
                <button onClick={() => setLiqEURC(eurcBalance)} className="text-xs text-muted-foreground hover:text-foreground">
                  Max: {Number(eurcBalance).toFixed(4)}
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shrink-0">
                  <Image src="/tokens/eurc.png" alt="EURC" width={20} height={20} className="rounded-full" />
                  <span className="text-sm font-medium">EURC</span>
                </div>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={liqEURC}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "")
                    setLiqEURC(val)
                    if (val && Number(val) > 0) {
                      setLiqUSDC((Number(val) * 1.058).toFixed(6))
                    }
                  }}
                  className="flex-1 border-0 bg-transparent text-right font-mono text-xl shadow-none focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <span className="text-xs text-muted-foreground">+</span>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">USDC amount</span>
                <span className="text-xs text-muted-foreground">Balance: {Number(balance ?? 0).toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 shrink-0">
                  <Image src="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=040" alt="USDC" width={20} height={20} className="rounded-full" />
                  <span className="text-sm font-medium">USDC</span>
                </div>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  value={liqUSDC}
                  onChange={(e) => setLiqUSDC(e.target.value.replace(/[^0-9.]/g, ""))}
                  className="flex-1 border-0 bg-transparent text-right font-mono text-xl shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            Tip: To set rate to 1 EURC = 1.058 USDC, add them in a 1:1.058 ratio (e.g. 100 EURC + 105.8 USDC)
          </div>

          <Button
            onClick={handleAddLiquidity}
            disabled={!liqEURC || !liqUSDC || liqLoading || !address}
            className="w-full h-11"
            variant="outline"
          >
            {liqLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding Liquidity...</>
            ) : (
              <><Droplets className="mr-2 h-4 w-4" />Add Liquidity</>
            )}
          </Button>

          {liqTxHash && (
            <a
              href={ARC_TESTNET.explorerUrl + "/tx/" + liqTxHash}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            >
              View transaction <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
