"use client"

import * as React from "react"
import Link from "next/link"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, Users, ArrowRight, FolderOpen } from "lucide-react"
import { deleteGroup, loadGroups, type SavedGroup } from "@/lib/storage"
import { formatUSDC, shortAddr } from "@/lib/format"
import { toast } from "sonner"

export default function GroupsPage() {
  const { address, isConnected } = useWallet()
  const [groups, setGroups] = React.useState<SavedGroup[]>([])

  React.useEffect(() => {
    if (address) setGroups(loadGroups(address))
  }, [address])

  function handleDelete(id: string) {
    if (!address) return
    deleteGroup(address, id)
    setGroups((g) => g.filter((x) => x.id !== id))
    toast.success("Group deleted")
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Saved groups</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Reusable recipient lists</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Groups are stored locally and tied to your wallet address. Load any group into the splitter to
            reuse recipients for recurring payouts.
          </p>
        </div>
        <Link href="/app">
          <Button className="bg-foreground text-background hover:bg-foreground/90">
            New split
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {!isConnected ? (
        <EmptyState
          icon={Users}
          title="Connect your wallet"
          body="Groups are tied to your wallet address. Connect to view and manage saved groups."
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No saved groups yet"
          body="Save a recipient list from the splitter to reuse it later."
          action={
            <Link href="/app">
              <Button variant="outline">Go to splitter</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} onDelete={() => handleDelete(g.id)} />
          ))}
        </div>
      )}

      {isConnected && address && groups.length > 0 && (
        <div className="text-xs text-muted-foreground">
          Showing groups for <span className="font-mono">{shortAddr(address)}</span>
        </div>
      )}
    </div>
  )
}

function GroupCard({ group, onDelete }: { group: SavedGroup; onDelete: () => void }) {
  const totalAmount = group.recipients.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)
  return (
    <Card className="group relative flex flex-col gap-4 border-border p-5 transition-colors hover:border-foreground/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-base font-medium tracking-tight">{group.name}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#00fdff" }} />
              {group.mode === "fixed" ? "Fixed" : "Percentage"}
            </span>
            <span>{group.recipients.length} recipients</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label="Delete group"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1.5">
        {group.recipients.slice(0, 3).map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-md bg-muted/30 px-2.5 py-1.5 text-xs"
          >
            <span className="truncate font-mono text-muted-foreground">
              {r.label || shortAddr(r.address)}
            </span>
            <span className="font-mono tabular-nums">
              {group.mode === "percentage" ? Number(r.amount).toFixed(2) : formatUSDC(r.amount)}
              <span className="ml-1 text-muted-foreground">{group.mode === "fixed" ? "USDC" : "%"}</span>
            </span>
          </div>
        ))}
        {group.recipients.length > 3 && (
          <div className="px-2.5 text-xs text-muted-foreground">+{group.recipients.length - 3} more</div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
        <span className="text-muted-foreground">
          {group.mode === "fixed" ? `${formatUSDC(totalAmount)} USDC` : `${totalAmount.toFixed(2)}%`}
        </span>
        <span className="text-muted-foreground">
          {new Date(group.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </Card>
  )
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-border bg-muted/20 px-6 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="mt-5 text-base font-medium">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </Card>
  )
}
