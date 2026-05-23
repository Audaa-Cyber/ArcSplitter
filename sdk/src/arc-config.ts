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

export const SPLITTER_PROXY_ADDRESS = "0x327fA342e2595342518EE8FC771bd3f41271D6Dc" as const
export const BASIS_POINTS = 10_000
export const FEE_BPS = 10
export const MAX_RECIPIENTS = 20
export const DEFAULT_DECIMALS = 18

export const SPLITTER_ABI = [
  "function splitFixed(address[] recipients, uint256[] amounts) payable",
  "function splitPercentage(address[] recipients, uint256[] percentages) payable",
  "event SplitExecuted(address indexed sender, uint256 totalSent, uint256 recipientTotal, uint256 feeAmount, address treasury, uint8 mode, address[] recipients, uint256[] amounts, uint256 timestamp)",
] as const
