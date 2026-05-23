# ArcSplitter 

ArcSplitter is a Next.js Web3 app for splitting USDC payments across multiple wallets in a single transaction.

## What it does

- Connects wallets using MetaMask, Coinbase Wallet, WalletConnect, and other supported providers.
- Splits a single USDC payment to up to 20 recipient wallets.
- Supports fixed-amount and percentage-based splits.
- Uses Arc Testnet for development and testing.
- Supports light/dark theme switching.


## Technology stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- `next-themes` for theme management
- `viem` / `ethers` for blockchain interactions
- Shadcn-based UI components

## SDK

A reusable SDK is available at `sdk/` for integrating ArcSplitter split logic into other applications. It exports validation, amount computation, contract helpers, and send/receipt helpers for ArcSplitter.





