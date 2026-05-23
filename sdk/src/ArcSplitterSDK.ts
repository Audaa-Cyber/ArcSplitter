import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  getAddress,
  isAddress,
  parseUnits,
  formatUnits,
} from "ethers"
import {
  ARC_TESTNET,
  BASIS_POINTS,
  DEFAULT_DECIMALS,
  FEE_BPS,
  MAX_RECIPIENTS,
  SPLITTER_ABI,
} from "./arc-config"
import type {
  ArcSplitterSDKConfig,
  ComputedAmount,
  ComputeBreakdownResult,
  EthereumProvider,
  Recipient,
  SendSplitParams,
  SplitMode,
  ValidationResult,
} from "./types"

export class ArcSplitterSDK {
  private config: Required<ArcSplitterSDKConfig>

  constructor(config?: ArcSplitterSDKConfig) {
    this.config = {
      chainId: config?.chainId ?? ARC_TESTNET.chainId,
      name: config?.name ?? ARC_TESTNET.name,
      rpcUrl: config?.rpcUrl ?? ARC_TESTNET.rpcUrl,
      splitterAddress: config?.splitterAddress ?? "",
      feeBps: config?.feeBps ?? FEE_BPS,
      basisPoints: config?.basisPoints ?? BASIS_POINTS,
      decimals: config?.decimals ?? DEFAULT_DECIMALS,
    }

    if (!this.config.splitterAddress) {
      throw new Error("ArcSplitterSDK requires a valid splitterAddress in config.")
    }
  }

  getReadProvider() {
    return new JsonRpcProvider(this.config.rpcUrl, {
      chainId: this.config.chainId,
      name: this.config.name,
    })
  }

  getReadContract() {
    return new Contract(this.config.splitterAddress, SPLITTER_ABI, this.getReadProvider())
  }

  validateRecipients(
    recipients: Recipient[],
    total: string,
    mode: SplitMode,
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

  computeFee(recipientTotal: number): number {
    return (recipientTotal * this.config.feeBps) / this.config.basisPoints
  }

  computeBreakdown(
    recipients: Recipient[],
    total: string,
    mode: SplitMode,
  ): ComputeBreakdownResult {
    const totalNum = Number(total) || 0
    const sumRecipients = recipients.reduce((a, r) => a + (Number(r.amount) || 0), 0)

    if (mode === "fixed") {
      const recipientTotal = sumRecipients
      const fee = this.computeFee(recipientTotal)
      return {
        mode,
        recipientTotal,
        fee,
        grandTotal: recipientTotal + fee,
      }
    }

    const fee = (totalNum * this.config.feeBps) / this.config.basisPoints
    return {
      mode,
      recipientTotal: totalNum - fee,
      fee,
      grandTotal: totalNum,
    }
  }

  computeAmounts(
    recipients: Recipient[],
    total: string,
    mode: SplitMode,
  ): ComputedAmount[] {
    const totalNum = Number(total) || 0
    const distributable =
      mode === "percentage"
        ? totalNum - (totalNum * this.config.feeBps) / this.config.basisPoints
        : 0

    return recipients
      .filter((r) => isAddress(r.address))
      .map((r) => {
        const pct = Number(r.amount) || 0
        const formatted =
          mode === "fixed"
            ? r.amount
            : ((distributable * pct) / 100).toFixed(6)

        return {
          address: getAddress(r.address),
          amount: parseUnits(formatted || "0", this.config.decimals),
          formatted,
        }
      })
  }

  async sendSplit(params: SendSplitParams): Promise<`0x${string}`> {
    const { recipients, total, mode, provider } = params

    const browser = new BrowserProvider(provider as any)
    const signer = await browser.getSigner()
    const contract = new Contract(this.config.splitterAddress, SPLITTER_ABI, signer)

    const cleaned = recipients.filter((r) => isAddress(r.address))
    const addresses = cleaned.map((r) => getAddress(r.address))

    if (mode === "fixed") {
      const amounts = cleaned.map((r) => parseUnits(r.amount || "0", this.config.decimals))
      const recipientTotal = amounts.reduce((a, b) => a + b, BigInt(0))
      const fee = (recipientTotal * BigInt(this.config.feeBps)) / BigInt(this.config.basisPoints)
      const value = recipientTotal + fee

      const tx = await contract.splitFixed(addresses, amounts, { value })
      return tx.hash as `0x${string}`
    }

    const pctNumbers = cleaned.map((r) => Number(r.amount) || 0)
    const bps = this.percentagesToBps(pctNumbers)
    const value = parseUnits(total || "0", this.config.decimals)

    const tx = await contract.splitPercentage(addresses, bps, { value })
    return tx.hash as `0x${string}`
  }

  async waitForReceipt(txHash: `0x${string}`) {
    const receipt = await this.getReadProvider().waitForTransaction(txHash)
    return receipt
  }

  formatChainAmount(wei: bigint): string {
    return formatUnits(wei, this.config.decimals)
  }

  private percentagesToBps(percentages: number[]): bigint[] {
    const raw = percentages.map((p) => Math.round(p * 100))
    const sum = raw.reduce((a, b) => a + b, 0)
    if (sum !== this.config.basisPoints) {
      const drift = this.config.basisPoints - sum
      for (let i = raw.length - 1; i >= 0; i--) {
        if (raw[i] + drift > 0) {
          raw[i] += drift
          break
        }
      }
    }
    return raw.map((n) => BigInt(n))
  }
}
