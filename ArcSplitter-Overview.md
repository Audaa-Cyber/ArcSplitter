# ArcSplitter Overview

## What is ArcSplitter?

ArcSplitter is a Next.js Web3 application built for splitting USDC payments across multiple recipient wallets in a single transaction. It is designed for Arc Testnet and combines a payment splitter UI, a token swap ui, wallet connectivity, smart validation rules, receipt generation, and an AI assistant named `pengo`.

## What it does

ArcSplitter lets users:

- connect a Web3 wallet
- enter a total USDC amount
- distribute that amount to up to 20 recipients in one transaction
- choose between fixed amounts or percentage shares
- automatically calculate platform fees and totals
- save and load recipient groups
- generate a receipt with a QR code linking to Arcscan
- query the AI assistant for ArcSplitter and Arc Network guidance
- and also swap eurc to usdc and usdc to eurc

## Core features

### 1. Wallet connectivity

ArcSplitter supports connecting wallets through the integrated `ConnectWalletDialog`. Users can:

- connect a wallet
- verify they are on Arc Testnet
- view their USDC balance
- use a "Use max" button to fill the amount with their full balance

### 2. Split payments

The payment splitter is the main feature. It supports:

- splitting to up to 20 recipient wallets
- entering recipient addresses and optional labels
- choosing between two split modes:
  - `fixed` amount mode
  - `percentage` share mode
- automatic sum validation
- a live allocation donut chart that visualizes distribution

### 3. Fixed amount and percentage modes

ArcSplitter supports two split modes:

- `fixed` mode: each recipient receives a specific USDC amount
  - the total entered must equal the sum of recipients
- `percentage` mode: each recipient receives a percent share
  - percentages must add up to exactly 100%

### 4. Fee calculation and checkout

The app calculates platform fees automatically:

- fee = `total * 0.001` (0.1%)

It also displays:

- recipient sum
- platform fee
- final total amount to pay
- validation warnings when the recipient sums are incorrect

### 5. Transaction flow

The split workflow includes:

- validation before sending
- wallet signature and single transaction sending
- pending confirmation state
- success and failure handling
- toast notifications for user feedback

### 6. Saved groups

Users can:

- save a recipient group with a name
- load a saved group later
- reuse repeated split configurations without retyping recipients

### 7. Auto-swap suggestion

When the user has insufficient USDC but enough EURC, ArcSplitter can:

- detect the deficit automatically
- offer to swap EURC to USDC
- open the swap modal and continue the flow after swap

### 8. AI assistant (`pengo`)

ArcSplitter includes an AI chat assistant named `pengo` with these features:

- floating chat widget
- bot avatar support from local profile picture storage
- daily free message limit for non-premium users (5 messages)
- Premium mode unlocks unlimited messages after using ArcSplitter enough
- predefined helper suggestions for Arc and ArcSplitter questions
- backend AI route calling OpenRouter GPT-4o via `/api/ai`
- intent detection for split, swap, and informational requests

### 9. Receipt generation and QR code

After a split transaction, users can view a receipt page with:

- total amount
- recipient count
- platform fee
- network name
- transaction date
- shortened transaction hash
- QR code linking to Arcscan transaction details
- copy link and open Arcscan buttons

## Pages and sections in the app

ArcSplitter is organized into the following app routes:

- `/` or `/app` — dashboard and main payment splitter page
- `/app/receipt/[hash]` — transaction receipt page with QR code
- `/app/analytics` — analytics area (exists in folder structure)
- `/app/groups` — group management section
- `/app/history` — transaction history section
- `/app/pay` — payment-related page layout
- `/app/profile` — profile section
- `/app/swap` — swap modal and swap-supporting page
- `/api/ai` — server route for AI assistant chat requests

## What users can do in ArcSplitter

- connect a supported wallet
- choose Arc Testnet and confirm the network
- enter a total USDC payment value
- add up to 20 recipients with address and label
- set fixed amounts or percentages per recipient
- validate the split before sending
- submit a single transaction for all recipients
- monitor transaction progress and confirmation
- save recipient groups and reuse them later
- load saved groups for fast repeat payments
- ask the AI assistant questions about ArcSplitter, fees, wallets, or how to use the app
- view a receipt with transaction details and Arcscan QR code
- copy the receipt link or open the transaction in Arcscan

## Rules and business logic

ArcSplitter enforces the following rules:

- All transactions are on Arc Testnet
- The splitter supports a maximum of 20 recipient wallets
- Fixed mode requires the total to exactly match the sum of recipient amounts
- Percentage mode requires recipient shares to sum to exactly 100%
- Platform fee is always 0.1% of the total amount
- Users must connect a wallet before sending
- Users must be on the correct Arc testnet network
- Transactions are only sent after validation passes
- If USDC balance is insufficient, the app may suggest a swap from EURC
- AI assistant responses are limited for non-premium users and require wallet connection

## Transaction capabilities

ArcSplitter can perform:

- multi-recipient USDC transfers in a single transaction
- user-signed wallet transactions
- fee-aware totals and breakdowns
- balance-aware validation
- auto-swap paths when funds are low
- transaction history storage for users
- receipt creation with QR code and Arcscan links
- AI-guided support for ArcSplitter usage

## Technical stack and implementation

ArcSplitter is built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Shadcn UI components
- `next-themes` for theme switching
- `ethers` / `viem` for blockchain interactions
- `qrcode` for QR code generation
- `sonner` for toast notifications
- `lucide-react` for icons

Key files and components:

- `app/app/page.tsx` — main dashboard page
- `components/splitter-card.tsx` — payment splitter UI and transaction logic
- `components/ai-chat.tsx` — floating AI chat widget
- `app/api/ai/route.ts` — AI backend route
- `app/app/receipt/[hash]/page.tsx` — receipt display page
- `lib/splitter.ts` — split validation and transaction helpers
- `lib/storage.ts` — history, groups, and persistence helpers
- `components/connect-wallet-dialog.tsx` — wallet connection flow
- `components/swap-modal.tsx` — swap workflow integration
- `components/allocation-donut.tsx` — split allocation visualization

## User value summary

ArcSplitter is designed to:

- save users time by sending one transaction to many recipients
- reduce manual transfer errors
- make shared payments simple on Arc Testnet
- provide a guided experience with validation, feedback, and receipts
- offer secondary AI support for user questions and best practices

## Notes

- The app is currently targeted at Arc Testnet (Arc Network sandbox environment).
- The AI assistant is configured to use OpenRouter GPT-4o via the server route.
- The receipt page is built to show transaction details and provide a scannable Arcscan link.
- The application emphasizes safe execution and explicit user confirmation before sending funds.
