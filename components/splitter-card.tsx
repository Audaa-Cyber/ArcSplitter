"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, X, AlertCircle, Loader2, ExternalLink, Save, FolderOpen, ArrowRight, Wallet, Tag, User } from "lucide-react"
import { AllocationDonut } from "@/components/allocation-donut"
import { ConnectWalletDialog } from "@/components/connect-wallet-dialog"
import { useWallet } from "@/components/wallet-provider"
import { validateRecipients, sendSplit, waitForReceipt, computeBreakdown } from "@/lib/splitter"
import { appendHistory, loadGroups, saveGroup, updateHistoryStatus, type Recipient, type SavedGroup } from "@/lib/storage"
import { ARC_TESTNET } from "@/lib/arc-config"
import { formatUSDC, formatUSDCFull } from "@/lib/format"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Mode = "fixed" | "percentage"
type TxState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "confirming"; hash: `0x${string}` }
  | {
      kind: "confirmed"
      hash: `0x${string}`
      total: string
      count: number
      fee: number
      recipientTotal: number
    }
  | { kind: "failed"; message: string }

const MAX = 20

function newRecipient(): Recipient {
  return { address: "", amount: "", label: "" }
}

export function SplitterCard() {
  const { address, isConnected, isCorrectNetwork, provider, refreshBalance, balance } = useWallet()

  const [mode, setMode] = React.useState<Mode>("fixed")
  const [total, setTotal] = React.useState<string>("")
  const [recipients, setRecipients] = React.useState<Recipient[]>([newRecipient(), newRecipient()])
  const [tx, setTx] = React.useState<TxState>({ kind: "idle" })
  const [saveOpen, setSaveOpen] = React.useState(false)
  const [groupName, setGroupName] = React.useState("")
  const [loadOpen, setLoadOpen] = React.useState(false)
  const [groups, setGroups] = React.useState<SavedGroup[]>([])
  const [connectOpen, setConnectOpen] = React.useState(false)

  React.useEffect(() => {
    if (address) setGroups(loadGroups(address))
  }, [address, saveOpen, loadOpen])

  const sum = recipients.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
  const totalNum = Number(total) || 0
  const validation = validateRecipients(recipients, total, mode)
  const breakdown = computeBreakdown(recipients, total, mode)

  function updateRecipient(i: number, patch: Partial<Recipient>) {
    setRecipients((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }
  function addRecipient() {
    if (recipients.length >= MAX) {
      toast.error(`You can split to at most ${MAX} wallets in one go.`)
      return
    }
    setRecipients((prev) => [...prev, newRecipient()])
  }
  function removeRecipient(i: number) {
    setRecipients((prev) => (prev.length === 1 ? [newRecipient()] : prev.filter((_, idx) => idx !== i)))
  }
  function clearAll() {
    setRecipients([newRecipient(), newRecipient()])
    setTotal("")
  }

  async function handleSend() {
    if (!address || !provider) return
    if (!validation.valid) {
      toast.error(validation.errors[0])
      return
    }
    setTx({ kind: "sending" })
    try {
      const hash = await sendSplit({ from: address, recipients, total, mode, provider })
      setTx({ kind: "confirming", hash })

      appendHistory(address, {
        txHash: hash,
        from: address,
        total: total,
        recipientCount: recipients.filter((r) => r.address).length,
        recipients,
        mode,
        status: "pending",
      })

      const receipt = await waitForReceipt(hash)
      // ethers v6: receipt.status is 1 for success, 0 for failure (null while pending)
      const ok = receipt?.status === 1
      updateHistoryStatus(address, hash, ok ? "confirmed" : "failed")
      if (ok) {
        setTx({
          kind: "confirmed",
          hash,
          total,
          count: recipients.filter((r) => r.address).length,
          fee: breakdown.fee,
          recipientTotal: breakdown.recipientTotal,
        })
        refreshBalance()
      } else {
        setTx({ kind: "failed", message: "The transaction did not go through. Your funds are still in your wallet." })
      }
    } catch (err: any) {
      console.log("[v0] send failed", err)
      setTx({ kind: "failed", message: err?.shortMessage || err?.message || "Transaction failed." })
    }
  }

  function handleSaveGroup() {
    if (!address) return
    if (!groupName.trim()) {
      toast.error("Please give your group a name.")
      return
    }
    saveGroup(address, {
      name: groupName.trim(),
      mode,
      recipients: recipients.filter((r) => r.address || r.amount),
    })
    toast.success("Group saved")
    setGroupName("")
    setSaveOpen(false)
  }

  function applyGroup(g: SavedGroup) {
    setMode(g.mode)
    setRecipients(g.recipients.length ? g.recipients : [newRecipient()])
    setLoadOpen(false)
    toast.success(`Loaded "${g.name}"`)
  }

  const matchExact = mode === "fixed" ? Math.abs(sum - totalNum) < 1e-6 && totalNum > 0 : Math.abs(sum - 100) < 1e-6

  if (tx.kind === "confirmed") {
    return (
      <SuccessScreen
        hash={tx.hash}
        total={tx.total}
        count={tx.count}
        fee={tx.fee}
        recipientTotal={tx.recipientTotal}
        onReset={() => {
          setTx({ kind: "idle" })
          clearAll()
        }}
      />
    )
  }

  return (
    <Card className="overflow-hidden border-border p-0 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.18)]">
      {/* header */}
      <div className="flex flex-col gap-4 border-b border-border p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Payment splitter</div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance">Split USDC across wallets</h2>
        </div>

        <div className="inline-flex w-full rounded-lg border border-border bg-secondary/50 p-0.5 text-sm md:w-auto">
          <button
            type="button"
            onClick={() => setMode("fixed")}
            className={`flex-1 rounded-md px-3 py-1.5 transition-all md:flex-none ${
              mode === "fixed"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Fixed amount
          </button>
          <button
            type="button"
            onClick={() => setMode("percentage")}
            className={`flex-1 rounded-md px-3 py-1.5 transition-all md:flex-none ${
              mode === "percentage"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Percentage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* left form */}
        <div className="space-y-6 p-5 md:p-6">
          {/* total */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="total" className="text-sm font-medium">
                Total to send
              </Label>
              {isConnected && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setTotal(balance)}
                >
                  Use max: {formatUSDC(balance)} USDC
                </button>
              )}
            </div>
            <div className="relative">
              <Input
                id="total"
                inputMode="decimal"
                placeholder="0.00"
                value={total}
                onChange={(e) => setTotal(e.target.value.replace(/[^0-9.]/g, ""))}
                className="h-14 pr-20 font-mono text-2xl tabular-nums shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)]"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                USDC
              </span>
            </div>
          </div>

          {/* recipients */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Recipients</Label>
                <span className="ml-2 text-xs text-muted-foreground">
                  {recipients.length} of {MAX}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setLoadOpen(true)}
                  disabled={!isConnected}
                  className="h-8 text-xs"
                >
                  <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                  Load
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSaveOpen(true)}
                  disabled={!isConnected}
                  className="h-8 text-xs"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {recipients.map((r, i) => (
                <RecipientRow
                  key={i}
                  index={i}
                  recipient={r}
                  mode={mode}
                  onChange={(patch) => updateRecipient(i, patch)}
                  onRemove={() => removeRecipient(i)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRecipient}
                disabled={recipients.length >= MAX}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add recipient
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                Clear all
              </Button>
            </div>
          </div>

          {/* warning */}
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="leading-relaxed">
              {mode === "fixed" ? (
                <>
                  The <span className="font-medium">total</span>{" "}you enter must exactly match the sum of
                  every recipient&apos;s amount.
                </>
              ) : (
                <>The percentages of all recipients must add up to exactly 100%.</>
              )}
            </p>
          </div>

          {/* sum strip */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-1 text-sm">
              <span className="text-muted-foreground">
                {mode === "fixed" ? "Sum of recipients" : "Sum of percentages"}
              </span>
              <span className="font-mono font-medium tabular-nums">
                {mode === "fixed"
                  ? `${formatUSDC(sum)} of ${formatUSDC(totalNum)} USDC`
                  : `${sum.toFixed(2)} of 100.00%`}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, mode === "fixed" ? (totalNum > 0 ? (sum / totalNum) * 100 : 0) : sum)}%`,
                  background: matchExact ? "#00fdff" : "#0a0a0a",
                  boxShadow: matchExact ? "0 0 12px rgba(0, 253, 255, 0.6)" : "none",
                }}
              />
            </div>

            {/* Fee breakdown */}
            {breakdown.grandTotal > 0 && (
              <div className="mt-3 space-y-1 border-t border-border/60 pt-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Platform fee (0.1%)</span>
                  <span className="font-mono tabular-nums">{formatUSDC(breakdown.fee)} USDC</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span>{mode === "fixed" ? "You pay total" : "Total to split"}</span>
                  <span className="font-mono tabular-nums">
                    {formatUSDC(breakdown.grandTotal)} USDC
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* validation errors */}
          {!validation.valid && recipients.some((r) => r.address || r.amount) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
              <div className="font-medium">Please fix before sending:</div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {validation.errors.slice(0, 3).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA */}
          <div className="pt-2">
            {!isConnected ? (
              <Button
                size="lg"
                onClick={() => setConnectOpen(true)}
                className="group h-12 w-full bg-foreground text-background hover:bg-foreground/90"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            ) : !isCorrectNetwork ? (
              <Button
                size="lg"
                disabled
                className="h-12 w-full bg-foreground/40 text-background"
              >
                Switch to {ARC_TESTNET.name} to continue
              </Button>
            ) : (
              <Button
                size="lg"
                disabled={!validation.valid || tx.kind === "sending" || tx.kind === "confirming"}
                onClick={handleSend}
                className="group h-12 w-full bg-foreground text-background hover:bg-foreground/90 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.4)]"
              >
                {tx.kind === "sending" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending transaction...
                  </>
                )}
                {tx.kind === "confirming" && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Waiting for confirmation...
                  </>
                )}
                {tx.kind === "idle" && (
                  <>
                    Send {breakdown.grandTotal > 0 ? `${formatUSDC(breakdown.grandTotal)} ` : ""}USDC
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
                {tx.kind === "failed" && <>Try again</>}
              </Button>
            )}
            {tx.kind === "failed" && (
              <p className="mt-2 text-center text-xs text-destructive">{tx.message}</p>
            )}
          </div>
        </div>

        {/* right donut */}
        <div className="border-t border-border bg-muted/20 p-5 md:p-6 lg:border-l lg:border-t-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Allocation</div>
          <div className="mt-6">
            <AllocationDonut recipients={recipients} total={total} mode={mode} />
          </div>
        </div>
      </div>

      {/* save group dialog */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save group</DialogTitle>
            <DialogDescription>
              Save these recipients as a reusable group. You can load them anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              placeholder="Q1 contractor payroll"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveGroup} className="bg-foreground text-background hover:bg-foreground/90">
              Save group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* load group dialog */}
      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load saved group</DialogTitle>
            <DialogDescription>
              Replace the current recipient list with a saved group.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 space-y-2 overflow-auto">
            {groups.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No saved groups yet.</p>
            ) : (
              groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => applyGroup(g)}
                  className="flex w-full items-center justify-between rounded-md border border-border p-3 text-left hover:border-foreground/40 hover:bg-secondary/40"
                >
                  <div>
                    <div className="text-sm font-medium">{g.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {g.recipients.length} recipients · {g.mode === "fixed" ? "Fixed" : "Percentage"}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConnectWalletDialog open={connectOpen} onOpenChange={setConnectOpen} redirectTo={null} />
    </Card>
  )
}

function RecipientRow({
  index,
  recipient,
  mode,
  onChange,
  onRemove,
}: {
  index: number
  recipient: Recipient
  mode: Mode
  onChange: (patch: Partial<Recipient>) => void
  onRemove: () => void
}) {
  return (
    <div
      className={cn(
        "group/row rounded-xl border border-border bg-background p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.08)]",
        "transition-all focus-within:border-foreground/30 focus-within:shadow-[0_4px_20px_-6px_rgba(0,0,0,0.14)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-[11px] font-mono font-medium tabular-nums text-foreground/80">
            {index + 1}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Recipient</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover/row:opacity-100"
          aria-label={`Remove recipient ${index + 1}`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-[1fr_180px_160px]">
        {/* Address box */}
        <FieldBox icon={<User className="h-3.5 w-3.5" />} label="Wallet address">
          <Input
            placeholder="0x..."
            value={recipient.address}
            onChange={(e) => onChange({ address: e.target.value.trim() })}
            className="h-9 border-0 bg-transparent px-0 font-mono text-xs shadow-none focus-visible:ring-0"
          />
        </FieldBox>

        {/* Label box */}
        <FieldBox icon={<Tag className="h-3.5 w-3.5" />} label="Label (optional)">
          <Input
            placeholder="Alice"
            value={recipient.label ?? ""}
            onChange={(e) => onChange({ label: e.target.value })}
            className="h-9 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />
        </FieldBox>

        {/* Amount box */}
        <FieldBox label={mode === "fixed" ? "Amount" : "Share"} align="right">
          <div className="relative">
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={recipient.amount}
              onChange={(e) => onChange({ amount: e.target.value.replace(/[^0-9.]/g, "") })}
              className="h-9 border-0 bg-transparent px-0 pr-10 text-right font-mono text-sm tabular-nums shadow-none focus-visible:ring-0"
            />
            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">
              {mode === "fixed" ? "USDC" : "%"}
            </span>
          </div>
        </FieldBox>
      </div>
    </div>
  )
}

function FieldBox({
  icon,
  label,
  align = "left",
  children,
}: {
  icon?: React.ReactNode
  label: string
  align?: "left" | "right"
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-colors focus-within:bg-background focus-within:border-foreground/30">
      <div
        className={cn(
          "flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground",
          align === "right" && "justify-end",
        )}
      >
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  )
}

function SuccessScreen({
  hash,
  total,
  count,
  fee,
  recipientTotal,
  onReset,
}: {
  hash: string
  total: string
  count: number
  fee: number
  recipientTotal: number
  onReset: () => void
}) {
  // Fire confetti once on mount
  React.useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const confetti = (await import("canvas-confetti")).default
        if (cancelled) return
        const fire = (ratio: number, opts: Record<string, unknown>) =>
          confetti({
            ...opts,
            origin: { y: 0.6 },
            particleCount: Math.floor(220 * ratio),
            colors: ["#00fdff", "#0a0a0a", "#ffffff", "#a6f9fb"],
          })
        fire(0.25, { spread: 26, startVelocity: 55 })
        fire(0.2, { spread: 60 })
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 })
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
        fire(0.1, { spread: 120, startVelocity: 45 })
      } catch (err) {
        console.log("[v0] confetti failed", err)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Card className="relative overflow-hidden border-border p-0 shadow-[0_8px_40px_-20px_rgba(0,0,0,0.18)] animate-fade-up">
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[120%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
        aria-hidden
      />

      <div className="relative flex flex-col items-center justify-center px-6 py-14 text-center md:py-20">
        {/* Animated check with pulsing rings */}
        <div className="relative">
          <span className="absolute inset-0 rounded-full border border-[#00fdff]/40 animate-ring" />
          <span
            className="absolute inset-0 rounded-full border border-[#00fdff]/40 animate-ring"
            style={{ animationDelay: "0.5s" }}
          />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-background border border-[#00fdff] cyan-glow animate-pulse-glow">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#00fdff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12"
            >
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h3 className="mt-10 text-3xl font-semibold tracking-tight md:text-4xl animate-fade-up" style={{ animationDelay: "0.15s" }}>
          Payment sent
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground animate-fade-up" style={{ animationDelay: "0.25s" }}>
          Your USDC has been distributed to all recipients. They should see it in their wallets now.
        </p>

        <div className="mt-10 grid w-full max-w-md grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-background animate-fade-up" style={{ animationDelay: "0.35s" }}>
          <div className="px-3 py-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Recipients got</div>
            <div className="mt-1 font-mono text-xl font-medium tabular-nums">
              {formatUSDCFull(recipientTotal)}
            </div>
            <div className="text-xs text-muted-foreground">USDC</div>
          </div>
          <div className="px-3 py-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Platform fee</div>
            <div className="mt-1 font-mono text-xl font-medium tabular-nums">
              {formatUSDCFull(fee)}
            </div>
            <div className="text-xs text-muted-foreground">0.1%</div>
          </div>
          <div className="px-3 py-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Wallets</div>
            <div className="mt-1 font-mono text-xl font-medium tabular-nums">{count}</div>
            <div className="text-xs text-muted-foreground">recipients</div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row animate-fade-up" style={{ animationDelay: "0.45s" }}>
          <a
            href={`${ARC_TESTNET.explorerUrl}/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm hover:border-foreground/40 hover:bg-secondary/40 transition-colors"
          >
            View on Arcscan
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <Button
            onClick={onReset}
            className="bg-foreground text-background hover:bg-foreground/90 h-10"
          >
            Send another payment
          </Button>
        </div>

        <div className="mt-6 max-w-md break-all rounded-md bg-muted/40 px-3 py-2 font-mono text-[10px] text-muted-foreground">
          {hash}
        </div>
      </div>
    </Card>
  )
}
