"use client"

// Wallet-scoped local storage for saved groups & transaction history.
// History is also cached client-side; the explorer (testnet.arcscan.app) is
// the canonical source of truth for transaction status.

export type Recipient = {
  address: string
  amount: string // formatted USDC amount string
  label?: string
}

export type SavedGroup = {
  id: string
  name: string
  mode: "fixed" | "percentage"
  recipients: Recipient[]
  createdAt: number
  updatedAt: number
}

export type HistoryEntry = {
  id: string
  txHash: string
  from: string
  total: string
  recipientCount: number
  recipients: Recipient[]
  mode: "fixed" | "percentage"
  status: "pending" | "confirmed" | "failed"
  createdAt: number
}

const GROUPS_KEY = (addr: string) => `arc:groups:${addr.toLowerCase()}`
const HISTORY_KEY = (addr: string) => `arc:history:${addr.toLowerCase()}`

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadGroups(address: string): SavedGroup[] {
  return safeRead<SavedGroup[]>(GROUPS_KEY(address), [])
}

export function saveGroup(address: string, group: Omit<SavedGroup, "id" | "createdAt" | "updatedAt">): SavedGroup {
  const all = loadGroups(address)
  const now = Date.now()
  const entry: SavedGroup = {
    ...group,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  safeWrite(GROUPS_KEY(address), [entry, ...all])
  return entry
}

export function deleteGroup(address: string, id: string) {
  const all = loadGroups(address).filter((g) => g.id !== id)
  safeWrite(GROUPS_KEY(address), all)
}

export function loadHistory(address: string): HistoryEntry[] {
  return safeRead<HistoryEntry[]>(HISTORY_KEY(address), [])
}

export function appendHistory(address: string, entry: Omit<HistoryEntry, "id" | "createdAt">): HistoryEntry {
  const all = loadHistory(address)
  const item: HistoryEntry = { ...entry, id: crypto.randomUUID(), createdAt: Date.now() }
  safeWrite(HISTORY_KEY(address), [item, ...all].slice(0, 200))
  return item
}

export function updateHistoryStatus(address: string, txHash: string, status: HistoryEntry["status"]) {
  const all = loadHistory(address).map((h) => (h.txHash === txHash ? { ...h, status } : h))
  safeWrite(HISTORY_KEY(address), all)
}
