"use client"

import * as React from "react"
import { formatUnits } from "ethers"
import { useTheme } from "next-themes"
import { useWallet } from "@/components/wallet-provider"
import { ConnectWalletButton } from "@/components/connect-wallet-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"
import { ARC_TESTNET, ADMIN_WALLET_ADDRESS, SPLITTER_PROXY_ADDRESS } from "@/lib/arc-config"
import { getReadContract } from "@/lib/splitter"
import { formatUSDC, shortAddr } from "@/lib/format"
import {
  AlertTriangle,
  Lock,
  ShieldCheck,
  Loader2,
  ExternalLink,
  TrendingUp,
  Coins,
  Hash,
  Users,
} from "lucide-react"

const DECIMALS = ARC_TESTNET.currency.decimals

type SplitEvent = {
  txHash: string
  sender: string
  totalSent: bigint
  recipientTotal: bigint
  feeAmount: bigint
  mode: number
  recipientsCount: number
  timestamp: number
}

function toAdminAddress(address: string | null): string {
  return address?.toLowerCase() ?? ""
}

export default function AnalyticsPage() {
  const { theme, resolvedTheme } = useTheme()
  const { address, isConnected, isCorrectNetwork, switchNetwork } = useWallet()
  const [events, setEvents] = React.useState<SplitEvent[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const normalizedAddress = toAdminAddress(address)
  const currentTheme = theme === "system" ? resolvedTheme : theme
  const adminAddress = ADMIN_WALLET_ADDRESS.toLowerCase()
  const isAdmin = normalizedAddress === adminAddress
  const canView = isConnected && isCorrectNetwork && isAdmin

  React.useEffect(() => {
    let cancelled = false
    if (!canView) {
      setEvents([])
      setError(null)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    setLoading(true)
    void (async () => {
      try {
        const contract = getReadContract()
        const provider = contract.runner?.provider
        if (!provider) throw new Error("No provider available")
        const latest = await provider.getBlockNumber()
        const CHUNK = 9_500
        const LOOKBACK = 200_000
        const from = Math.max(0, latest - LOOKBACK)
        const filter = contract.filters.SplitExecuted()
        const raw: any[] = []

        for (let start = from; start <= latest && !cancelled; start += CHUNK + 1) {
          const end = Math.min(start + CHUNK, latest)
          try {
            const batch = await contract.queryFilter(filter, start, end)
            raw.push(...batch)
          } catch (e) {
            console.log("[v0] analytics chunk failed", start, end, e)
          }
        }

        if (cancelled) return
        const parsed: SplitEvent[] = raw
          .map((log: any) => {
            const a = log.args
            if (!a) return null
            return {
              txHash: log.transactionHash,
              sender: a.sender as string,
              totalSent: a.totalSent as bigint,
              recipientTotal: a.recipientTotal as bigint,
              feeAmount: a.feeAmount as bigint,
              mode: Number(a.mode),
              recipientsCount: (a.recipients as string[]).length,
              timestamp: Number(a.timestamp),
            }
          })
          .filter((e): e is SplitEvent => e !== null)
          .sort((a, b) => b.timestamp - a.timestamp)

        setEvents(parsed)
      } catch (err: any) {
        console.log("[v0] analytics fetch failed", err)
        setError(err?.message || "Failed to load on-chain analytics.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [canView])

  const totals = React.useMemo(() => {
    let volume = BigInt(0)
    let fees = BigInt(0)
    let recipients = 0
    for (const e of events) {
      volume += e.totalSent
      fees += e.feeAmount
      recipients += e.recipientsCount
    }
    const txCount = events.length
    return { volume, fees, recipients, txCount }
  }, [events])

  return (
    <div className="mx-auto max-w-6xl px-8 py-16 space-y-8">
      <div className="flex flex-col gap-6 rounded-3xl border border-border bg-background/80 p-8 shadow-xl shadow-slate-900/5 dark:bg-slate-950/80">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Admin access</div>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hidden analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            This page is only visible by the designated ArcSplitter admin wallet. If you are not signed in
            with the admin address, connect the configured wallet or return to the public site.
          </p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="rounded-2xl bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
            Current mode: {currentTheme ?? "light"}
          </div>
          <ThemeToggle />
        </div>
      </div>

      {!isConnected ? (
        <Card className="space-y-4 border-border bg-slate-50 p-6 dark:bg-slate-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="text-lg font-semibold">Wallet required</h2>
              <p className="text-sm text-muted-foreground">
                Connect a wallet to access this hidden analytics page. Only the admin owner can view the
                data.
              </p>
            </div>
          </div>
          <ConnectWalletButton size="lg" redirectTo="/analytics">
            Connect admin wallet
          </ConnectWalletButton>
        </Card>
      ) : !isCorrectNetwork ? (
        <Card className="space-y-4 border-border bg-slate-50 p-6 dark:bg-slate-950">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <h2 className="text-lg font-semibold">Wrong network</h2>
              <p className="text-sm text-muted-foreground">
                ArcSplitter analytics only run on {ARC_TESTNET.name}. Switch your wallet to keep going.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={switchNetwork}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            Switch to {ARC_TESTNET.name}
          </button>
        </Card>
      ) : !isAdmin ? (
        <Card className="space-y-4 border-border bg-slate-50 p-6 dark:bg-slate-950">
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 text-slate-900 dark:text-slate-100" />
            <div>
              <h2 className="text-lg font-semibold">Unauthorized wallet</h2>
              <p className="text-sm text-muted-foreground">
                This page is restricted to admin wallet <code className="font-mono">{shortAddr(ADMIN_WALLET_ADDRESS)}</code>.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Connected as {address ? <span className="font-mono">{shortAddr(address)}</span> : "unknown"}.
              </p>
            </div>
          </div>
        </Card>
      ) : loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading hidden analytics data…
        </div>
      ) : error ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={<Coins className="h-3.5 w-3.5" />} label="Total volume" value={formatUSDC(formatUnits(totals.volume, DECIMALS))} suffix="USDC" />
            <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Total fees" value={formatUSDC(formatUnits(totals.fees, DECIMALS))} suffix="USDC" />
            <Stat icon={<Hash className="h-3.5 w-3.5" />} label="Transactions" value={totals.txCount.toString()} />
            <Stat icon={<Users className="h-3.5 w-3.5" />} label="Recipients paid" value={totals.recipients.toString()} />
          </div>

          <Card className="overflow-hidden border-border p-0">
            <div className="border-b border-border px-5 py-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Recent splits</div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{events.length} event{events.length === 1 ? "" : "s"}</h2>
            </div>
            {events.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">No splits have happened yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {events.slice(0, 50).map((e) => (
                  <div key={e.txHash} className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                          {e.mode === 0 ? "Fixed" : "Percentage"}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(e.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">from {shortAddr(e.sender)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm tabular-nums">{formatUSDC(formatUnits(e.recipientTotal, DECIMALS))}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">to recipients</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm tabular-nums">{e.recipientsCount}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">wallets</div>
                    </div>
                    <a href={`${ARC_TESTNET.explorerUrl}/tx/${e.txHash}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 justify-self-start rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-foreground/40 hover:text-foreground md:justify-self-end">
                      Arcscan
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="text-xs text-muted-foreground">
            Contract:{" "}
            <a href={`${ARC_TESTNET.explorerUrl}/address/${SPLITTER_PROXY_ADDRESS}`} target="_blank" rel="noreferrer" className="font-mono hover:text-foreground">
              {SPLITTER_PROXY_ADDRESS}
            </a>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: string; suffix?: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-mono text-2xl font-medium tabular-nums">{value}</span>
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </Card>
  )
}
