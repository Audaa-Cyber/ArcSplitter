import { createPublicClient, http, parseUnits, formatUnits, type Address } from "viem"
import { ARC_TESTNET, SIMPLE_POOL } from "@/lib/arc-config"

const client = createPublicClient({
  chain: {
    id: ARC_TESTNET.chainId,
    name: ARC_TESTNET.name,
    nativeCurrency: ARC_TESTNET.currency,
    rpcUrls: { default: { http: [ARC_TESTNET.rpcUrl] } },
  },
  transport: http(ARC_TESTNET.rpcUrl),
})

const ERC20_ABI = [
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

// getReserves via 0902f1ac — returns (reserve0 USDC, reserve1 EURC)
async function getReserves(): Promise<{ r0: bigint; r1: bigint } | null> {
  try {
    const result = await client.call({
      to: SIMPLE_POOL.address,
      data: "0x0902f1ac",
    })
    if (!result.data || result.data === "0x") return null
    const raw = result.data.slice(2)
    const r0 = BigInt("0x" + raw.slice(0, 64))
    const r1 = BigInt("0x" + raw.slice(64, 128))
    return { r0, r1 }
  } catch (err) {
    console.error("[swap] getReserves failed", err)
    return null
  }
}

// getAmountOut(uint256,bool) = 0x11106ee2
// bool true = token0→token1 (USDC→EURC), false = token1→token0 (EURC→USDC)
async function rawGetAmountOut(
  amountIn: bigint,
  zeroForOne: boolean
): Promise<bigint | null> {
  try {
    const paddedAmount = amountIn.toString(16).padStart(64, "0")
    const paddedBool = zeroForOne ? "0000000000000000000000000000000000000000000000000000000000000001" : "0000000000000000000000000000000000000000000000000000000000000000"
    const data = ("0x11106ee2" + paddedAmount + paddedBool) as `0x${string}` 
    const result = await client.call({
      to: SIMPLE_POOL.address,
      data,
    })
    if (!result.data || result.data === "0x") return null
    return BigInt("0x" + result.data.slice(2, 66))
  } catch (err) {
    console.error("[swap] rawGetAmountOut failed", err)
    return null
  }
}

export async function getSwapQuote(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  decimalsIn: number,
  decimalsOut: number = 6
): Promise<{ amountOut: string; priceImpact: number } | null> {
  try {
    const amountInWei = parseUnits(amountIn, decimalsIn)
    // token0 = USDC, token1 = EURC
    // zeroForOne = true means USDC→EURC, false means EURC→USDC
    const zeroForOne = tokenIn.toLowerCase() === SIMPLE_POOL.token0.toLowerCase()
    const amountOutRaw = await rawGetAmountOut(amountInWei, zeroForOne)

    if (amountOutRaw === null) {
      return { amountOut: amountIn, priceImpact: 0 }
    }

    const amountOutFormatted = formatUnits(amountOutRaw, decimalsOut)
    const priceImpact = Math.abs(1 - Number(amountOutFormatted) / Number(amountIn)) * 100
    return { amountOut: amountOutFormatted, priceImpact }
  } catch (err) {
    console.error("[swap] getSwapQuote failed", err)
    return null
  }
}

export async function getEURCBalance(address: Address): Promise<string> {
  try {
    const balance = await client.readContract({
      address: SIMPLE_POOL.token1,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [address],
    })
    return formatUnits(balance, 6)
  } catch {
    return "0.00"
  }
}

async function approveToken(
  tokenAddress: Address,
  spender: Address,
  amount: bigint,
  from: Address,
  provider: any
): Promise<void> {
  const allowance = await client.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: [from, spender],
  })
  if (allowance >= amount) return

  const selector = "0x095ea7b3"
  const paddedSpender = spender.toLowerCase().replace("0x", "").padStart(64, "0")
  const paddedAmount = amount.toString(16).padStart(64, "0")
  await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to: tokenAddress, data: selector + paddedSpender + paddedAmount }],
  })
  await new Promise((r) => setTimeout(r, 4000))
}

export async function executeSwap(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: string,
  decimalsIn: number,
  minAmountOut: string,
  decimalsOut: number,
  provider: any,
  from: Address
): Promise<string> {
  const amountInWei = parseUnits(amountIn, decimalsIn)
  const minOutWei = parseUnits(minAmountOut, decimalsOut)

  // approve tokenIn to Simple Pool
  await approveToken(tokenIn, SIMPLE_POOL.address, amountInWei, from, provider)

  // swap(uint256 amountIn, uint256 minAmountOut, address to) = 0x99d96739
  // works for both directions — contract detects direction from which token is approved
  const paddedAmountIn = amountInWei.toString(16).padStart(64, "0")
  const paddedMinOut = minOutWei.toString(16).padStart(64, "0")
  const paddedTo = from.toLowerCase().replace("0x", "").padStart(64, "0")
  const swapData = "0x99d96739" + paddedAmountIn + paddedMinOut + paddedTo

  const txHash = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to: SIMPLE_POOL.address, data: swapData }],
  })
  return txHash as string
}

export async function addLiquidity(
  amountEURC: string,
  amountUSDC: string,
  provider: any,
  from: Address
): Promise<string> {
  const eurcWei = parseUnits(amountEURC, 6)
  const usdcWei = parseUnits(amountUSDC, 6)

  // approve USDC first
  await approveToken(SIMPLE_POOL.token0, SIMPLE_POOL.address, usdcWei, from, provider)
  // approve EURC second
  await approveToken(SIMPLE_POOL.token1, SIMPLE_POOL.address, eurcWei, from, provider)

  // addLiquidity(uint256 amount0USDC, uint256 amount1EURC, uint256 minLP, uint256 deadline) = 0xaebf3e41
  const paddedUSDC = usdcWei.toString(16).padStart(64, "0")
  const paddedEURC = eurcWei.toString(16).padStart(64, "0")
  const paddedMinLP = BigInt(0).toString(16).padStart(64, "0")
  const paddedDeadline = BigInt(0).toString(16).padStart(64, "0")
  const data = "0xaebf3e41" + paddedUSDC + paddedEURC + paddedMinLP + paddedDeadline

  const txHash = await provider.request({
    method: "eth_sendTransaction",
    params: [{ from, to: SIMPLE_POOL.address, data }],
  })
  return txHash as string
}
