import type { Eip1193Provider } from "ethers"

export type Recipient = {
  address: string
  amount: string
  label?: string
}

export type SplitMode = "fixed" | "percentage"

export type ValidationResult = {
  valid: boolean
  errors: string[]
}

export type ComputedAmount = {
  address: string
  amount: bigint
  formatted: string
}

export type ComputeBreakdownResult = {
  mode: SplitMode
  recipientTotal: number
  fee: number
  grandTotal: number
}

export type ArcSplitterSDKConfig = {
  chainId: number
  name: string
  rpcUrl: string
  splitterAddress: string
  feeBps?: number
  basisPoints?: number
  decimals?: number
}

export type EthereumProvider = Eip1193Provider & {
  request(args: { method: string; params?: unknown[] | object }): Promise<any>
}

export type SendSplitParams = {
  from: string
  recipients: Recipient[]
  total: string
  mode: SplitMode
  provider: EthereumProvider
}
