import { createPublicClient, http, parseAbiItem, type Address } from "viem"
import { ARC_TESTNET, SPLITTER_PROXY_ADDRESS } from "@/lib/arc-config"

const client = createPublicClient({
  chain: {
    id: ARC_TESTNET.chainId,
    name: ARC_TESTNET.name,
    nativeCurrency: ARC_TESTNET.currency,
    rpcUrls: { default: { http: [ARC_TESTNET.rpcUrl] } },
  },
  transport: http(ARC_TESTNET.rpcUrl),
})

export type OnChainSplit = {
  txHash: string
  blockNumber: bigint
  sender: string
  totalSent: bigint
  recipientTotal: bigint
  feeAmount: bigint
  recipients: string[]
  amounts: bigint[]
  timestamp: bigint
  mode: "fixed" | "percentage"
}

const SPLIT_EXECUTED_ABI = parseAbiItem(
  "event SplitExecuted(address indexed sender, uint256 totalSent, uint256 recipientTotal, uint256 feeAmount, address treasury, uint8 mode, address[] recipients, uint256[] amounts, uint256 timestamp)"
)

// ArcSplitterV2 proxy deployed at approximately this block
// This avoids scanning from block 0
const DEPLOYMENT_BLOCK = 44818491n

export async function fetchOnChainHistory(address: Address): Promise<OnChainSplit[]> {
  try {
    const latestBlock = await client.getBlockNumber()
    const chunkSize = 9000n
    const results: OnChainSplit[] = []

    for (let from = DEPLOYMENT_BLOCK; from <= latestBlock; from += chunkSize) {
      const to = from + chunkSize - 1n > latestBlock ? latestBlock : from + chunkSize - 1n
      try {
        const logs = await client.getLogs({
          address: SPLITTER_PROXY_ADDRESS,
          event: SPLIT_EXECUTED_ABI,
          args: { sender: address },
          fromBlock: from,
          toBlock: to,
        })
        for (const log of logs) {
          results.push({
            txHash: log.transactionHash ?? "",
            blockNumber: log.blockNumber ?? 0n,
            sender: log.args.sender ?? "",
            totalSent: log.args.totalSent ?? 0n,
            recipientTotal: log.args.recipientTotal ?? 0n,
            feeAmount: log.args.feeAmount ?? 0n,
            recipients: [...(log.args.recipients ?? [])],
            amounts: [...(log.args.amounts ?? [])],
            timestamp: log.args.timestamp ?? 0n,
            mode: log.args.mode === 0 ? "fixed" : "percentage",
          })
        }
      } catch (chunkErr) {
        console.warn(`[fetch-history] chunk ${from}-${to} failed`, chunkErr)
      }
    }

    return results.reverse()
  } catch (err) {
    console.error("[fetch-history] failed", err)
    return []
  }
}
