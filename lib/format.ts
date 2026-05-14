/**
 * Human friendly USDC formatting.
 * Examples:
 *   formatUSDC("9.21")        => "9.21"
 *   formatUSDC("1234.567")    => "1,234.57"
 *   formatUSDC("9821000")     => "9.82M"
 *   formatUSDC("0")           => "0.00"
 *   formatUSDC("0.0001")      => "0.0001"
 */
export function formatUSDC(
  value: string | number,
  opts: { compact?: boolean; maxDecimals?: number } = {},
): string {
  const { compact = true, maxDecimals = 2 } = opts
  const n = typeof value === "number" ? value : Number(value || 0)
  if (!Number.isFinite(n)) return "0.00"
  if (n === 0) return "0.00"

  // Very small but non zero amounts: show enough precision
  if (Math.abs(n) < 0.01) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 6, minimumFractionDigits: 2 })
  }

  if (compact && Math.abs(n) >= 1_000_000) {
    return Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(n)
  }

  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  })
}

/**
 * Full precision formatter (used in confirmation receipts).
 */
export function formatUSDCFull(value: string | number): string {
  const n = typeof value === "number" ? value : Number(value || 0)
  if (!Number.isFinite(n)) return "0.00"
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

/**
 * Shorten an Ethereum address to "0x1234...abcd".
 */
export function shortAddr(addr?: string | null): string {
  if (!addr) return ""
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}
