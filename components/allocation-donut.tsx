"use client"

import * as React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import type { Recipient } from "@/lib/storage"

const PALETTE = [
  "#00fdff",
  "#0a0a0a",
  "#6b7280",
  "#a1a1aa",
  "#52525b",
  "#d4d4d8",
  "#3f3f46",
  "#71717a",
  "#e4e4e7",
  "#27272a",
  "#18181b",
  "#9ca3af",
  "#374151",
  "#1f2937",
  "#111827",
  "#4b5563",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#e5e7eb",
]

function short(addr: string) {
  if (!addr) return "—"
  if (addr.length < 12) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function AllocationDonut({
  recipients,
  total,
  mode,
}: {
  recipients: Recipient[]
  total: string
  mode: "fixed" | "percentage"
}) {
  const totalNum = Number(total) || 0

  const data = React.useMemo(() => {
    const items = recipients
      .map((r, i) => {
        const amt = Number(r.amount) || 0
        const usdc = mode === "fixed" ? amt : (totalNum * amt) / 100
        const pct = mode === "fixed"
          ? totalNum > 0
            ? (amt / totalNum) * 100
            : 0
          : amt
        return {
          name: r.label?.trim() || short(r.address) || `Recipient ${i + 1}`,
          value: usdc,
          pct,
          color: PALETTE[i % PALETTE.length],
        }
      })
      .filter((d) => d.value > 0)

    if (items.length === 0) {
      return [{ name: "No allocations", value: 1, pct: 0, color: "#f4f4f5", empty: true as const }]
    }
    return items
  }, [recipients, totalNum, mode])

  const isEmpty = data.length === 1 && (data[0] as any).empty
  const filledTotal = isEmpty ? 0 : data.reduce((acc, d) => acc + d.value, 0)

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-56 w-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={isEmpty ? 0 : 2}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            {!isEmpty && (
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload as any
                  return (
                    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-sm">
                      <div className="font-medium">{p.name}</div>
                      <div className="text-muted-foreground">
                        {p.value.toFixed(4)} USDC · {p.pct.toFixed(2)}%
                      </div>
                    </div>
                  )
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
          <div className="font-mono text-2xl font-medium tabular-nums">
            {filledTotal.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">USDC</div>
        </div>
      </div>

      {!isEmpty && (
        <div className="mt-6 grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
          {data.slice(0, 10).map((d, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: d.color }}
                />
                <span className="truncate text-muted-foreground">{d.name}</span>
              </div>
              <span className="font-mono tabular-nums">{d.pct.toFixed(1)}%</span>
            </div>
          ))}
          {data.length > 10 && (
            <div className="text-xs text-muted-foreground">+{data.length - 10} more</div>
          )}
        </div>
      )}
    </div>
  )
}
