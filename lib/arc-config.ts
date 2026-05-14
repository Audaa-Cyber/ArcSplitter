// Arc Testnet configuration for ArcSplitter
// Deployed UUPS proxy: 0x327fA342e2595342518EE8FC771bd3f41271D6Dc
// Implementation (do NOT use from frontend): 0x09CDc292001648fB01323C73b1c5386C35ed28ac

export const ARC_TESTNET = {
  chainId: 5042002,
  chainIdHex: "0x4cf1b2",
  name: "Arc Testnet",
  rpcUrl: "https://rpc.testnet.arc.network",
  explorerUrl: "https://testnet.arcscan.app",
  currency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
} as const

export const walletAddArcTestnetParams = {
  chainId: ARC_TESTNET.chainIdHex,
  chainName: ARC_TESTNET.name,
  rpcUrls: [ARC_TESTNET.rpcUrl],
  blockExplorerUrls: [ARC_TESTNET.explorerUrl],
  nativeCurrency: ARC_TESTNET.currency,
}

// ─── Deployed contract addresses ─────────────────────────────────────────────
// The frontend MUST always interact with the proxy, never the implementation.
export const SPLITTER_PROXY_ADDRESS = "0x327fA342e2595342518EE8FC771bd3f41271D6Dc" as const
export const TREASURY_ADDRESS = "0xAbB8CfDb703d2300E0f35280C97ed364032106A8" as const

// Kept for legacy imports — points at the proxy.
export const SPLITTER_CONTRACT_ADDRESS: `0x${string}` = SPLITTER_PROXY_ADDRESS
export const ADMIN_WALLET_ADDRESS = "0x2f1Da578303fe89FC891adca8A1A062Cd03cA337" as const

// ─── Protocol constants (must mirror ArcSplitterV2.sol) ──────────────────────
export const BASIS_POINTS = 10_000
export const FEE_BPS = 10 // 0.1 %
export const MAX_RECIPIENTS = 20

// ─── ABI ─────────────────────────────────────────────────────────────────────
// Human-readable ABI for ethers.js. Matches the deployed ArcSplitterV2 proxy.
export const SPLITTER_ABI = [
  "function splitFixed(address[] recipients, uint256[] amounts) payable",
  "function splitPercentage(address[] recipients, uint256[] percentages) payable",
  "event SplitExecuted(address indexed sender, uint256 totalSent, uint256 recipientTotal, uint256 feeAmount, address treasury, uint8 mode, address[] recipients, uint256[] amounts, uint256 timestamp)",
] as const
