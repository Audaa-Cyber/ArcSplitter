"use client"

import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  isAddress,
  getAddress,
  parseUnits,
  formatUnits,
  type Eip1193Provider,
} from "ethers"
import {
  ARC_TESTNET,
  BASIS_POINTS,
  FEE_BPS,
  MAX_RECIPIENTS,
  SPLITTER_ABI,
  SPLITTER_PROXY_ADDRESS,
} from "@/lib/arc-config"
import type { Recipient } from "@/lib/storage"

const DECIMALS = ARC_TESTNET.currency.decimals

// ─── Read-only RPC provider (for analytics / receipts) ───────────────────────
export const readProvider = new JsonRpcProvider(ARC_TESTNET.rpcUrl, {
  chainId: ARC_TESTNET.chainId,
  name: ARC_TESTNET.name,
})

export function getReadContract() {
  return new Contract(SPLITTER_PROXY_ADDRESS, SPLITTER_ABI, readProvider)
}

// ─── Validation ──────────────────────────────────────────────────────────────
export type ValidationResult = {
  valid: boolean
  errors: string[]
}

export function validateRecipients(
  recipients: Recipient[],
  total: string,
  mode: "fixed" | "percentage",
): ValidationResult {
  const errors: string[] = []

  if (recipients.length === 0) {
    errors.push("Add at least one recipient.")
  }
  if (recipients.length > MAX_RECIPIENTS) {
    errors.push(`Maximum of ${MAX_RECIPIENTS} recipients per transaction.`)
  }

  const seen = new Set<string>()
  for (const [i, r] of recipients.entries()) {
    if (!r.address || !isAddress(r.address)) {
      errors.push(`Row ${i + 1}: invalid wallet address.`)
      continue
    }
    if (/^0x0+$/i.test(r.address)) {
      errors.push(`Row ${i + 1}: zero address not allowed.`)
    }
    const lower = r.address.toLowerCase()
    if (seen.has(lower)) {
      errors.push(`Row ${i + 1}: duplicate address.`)
    }
    seen.add(lower)

    const n = Number(r.amount)
    if (!Number.isFinite(n) || n <= 0) {
      errors.push(`Row ${i + 1}: amount must be greater than 0.`)
    }
  }

  const totalNum = Number(total)
  if (!Number.isFinite(totalNum) || totalNum <= 0) {
    errors.push("Total USDC must be greater than 0.")
  }

  const sum = recipients.reduce((acc, r) => acc + (Number(r.amount) || 0), 0)

  if (mode === "fixed") {
    const diff = Math.abs(sum - totalNum)
    if (diff > 1e-6) {
      if (sum > totalNum) errors.push("Sum of recipients exceeds total USDC.")
      else if (sum < totalNum) errors.push("Sum of recipients is less than total USDC.")
    }
  } else {
    if (Math.abs(sum - 100) > 1e-6) {
      errors.push(`Percentages must sum to 100% (currently ${sum.toFixed(2)}%).`)
    }
  }

  return { valid: errors.length === 0, errors }
}

// ─── Fee math ────────────────────────────────────────────────────────────────
/** Platform fee for fixed-mode: fee = recipientTotal * 10 / 10000 (0.1%). */
export function computeFee(recipientTotal: number): number {
  return (recipientTotal * FEE_BPS) / BASIS_POINTS
}

/**
 * Pre-flight breakdown shown in the UI before sending.
 *  - fixed mode: total = sum(recipients); fee added on top.
 *  - percentage mode: total = msg.value; fee taken from it.
 */
export function computeBreakdown(
  recipients: Recipient[],
  total: string,
  mode: "fixed" | "percentage",
) {
  const totalNum = Number(total) || 0
  const sumRecipients = recipients.reduce((a, r) => a + (Number(r.amount) || 0), 0)

  if (mode === "fixed") {
    const recipientTotal = sumRecipients
    const fee = computeFee(recipientTotal)
    return {
      mode,
      recipientTotal,
      fee,
      grandTotal: recipientTotal + fee, // what the user actually pays
    }
  }
  const fee = (totalNum * FEE_BPS) / BASIS_POINTS
  return {
    mode,
    recipientTotal: totalNum - fee,
    fee,
    grandTotal: totalNum,
  }
}

// ─── Computed amounts (for preview / donut) ──────────────────────────────────
export function computeAmounts(
  recipients: Recipient[],
  total: string,
  mode: "fixed" | "percentage",
) {
  const totalNum = Number(total) || 0
  const distributable =
    mode === "percentage" ? totalNum - (totalNum * FEE_BPS) / BASIS_POINTS : 0

  return recipients
    .filter((r) => isAddress(r.address))
    .map((r) => {
      const pct = Number(r.amount) || 0
      const formatted =
        mode === "fixed" ? r.amount : ((distributable * pct) / 100).toFixed(6)
      return {
        address: getAddress(r.address),
        amount: parseUnits(formatted || "0", DECIMALS),
        formatted,
      }
    })
}

// ─── Convert UI 0–100 percentages to integer basis points summing to 10000 ───
function percentagesToBps(percentages: number[]): bigint[] {
  const raw = percentages.map((p) => Math.round(p * 100)) // 100% → 10000
  const sum = raw.reduce((a, b) => a + b, 0)
  if (sum !== BASIS_POINTS) {
    // Adjust the last non-zero entry to absorb rounding drift.
    const drift = BASIS_POINTS - sum
    for (let i = raw.length - 1; i >= 0; i--) {
      if (raw[i] + drift > 0) {
        raw[i] += drift
        break
      }
    }
  }
  return raw.map((n) => BigInt(n))
}

// ─── Send the split transaction ──────────────────────────────────────────────
export type EthereumProvider = Eip1193Provider & {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
}

export async function sendSplit(params: {
  from: string
  recipients: Recipient[]
  total: string
  mode: "fixed" | "percentage"
  provider: EthereumProvider
}): Promise<`0x${string}`> {
  const { recipients, total, mode, provider } = params

  const browser = new BrowserProvider(provider as any)
  const signer = await browser.getSigner()
  const contract = new Contract(SPLITTER_PROXY_ADDRESS, SPLITTER_ABI, signer)

  const cleaned = recipients.filter((r) => isAddress(r.address))
  const addresses = cleaned.map((r) => getAddress(r.address))

  if (mode === "fixed") {
    const amounts = cleaned.map((r) => parseUnits(r.amount || "0", DECIMALS))
    const recipientTotal = amounts.reduce((a, b) => a + b, BigInt(0))
    const fee = (recipientTotal * BigInt(FEE_BPS)) / BigInt(BASIS_POINTS)
    const value = recipientTotal + fee

    const tx = await contract.splitFixed(addresses, amounts, { value })
    return tx.hash as `0x${string}`
  }

  // percentage mode
  const pctNumbers = cleaned.map((r) => Number(r.amount) || 0)
  const bps = percentagesToBps(pctNumbers)
  const value = parseUnits(total || "0", DECIMALS)

  const tx = await contract.splitPercentage(addresses, bps, { value })
  return tx.hash as `0x${string}`
}

export async function waitForReceipt(txHash: `0x${string}`) {
  // ethers returns `null` while pending; `waitForTransaction` blocks until mined.
  const receipt = await readProvider.waitForTransaction(txHash)
  return receipt
}

// ─── Formatting helper for on-chain amounts ──────────────────────────────────
export function formatChainAmount(wei: bigint): string {
  return formatUnits(wei, DECIMALS)
}
