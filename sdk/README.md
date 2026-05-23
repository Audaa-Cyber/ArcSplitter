# @arcsplitter/sdk

A reusable TypeScript SDK for ArcSplitter's USDC splitting functionality.

## Install

```bash
pnpm add @arcsplitter/sdk ethers
```

## Usage

```ts
import { ArcSplitterSDK, ARC_TESTNET, SPLITTER_PROXY_ADDRESS } from "@arcsplitter/sdk"

const sdk = new ArcSplitterSDK({
  chainId: ARC_TESTNET.chainId,
  name: ARC_TESTNET.name,
  rpcUrl: ARC_TESTNET.rpcUrl,
  splitterAddress: SPLITTER_PROXY_ADDRESS,
})

const recipients = [
  { address: "0x...", amount: "10" },
  { address: "0x...", amount: "20" },
]

const validation = sdk.validateRecipients(recipients, "30", "fixed")
if (!validation.valid) {
  console.error(validation.errors)
}

const txHash = await sdk.sendSplit({
  from: "0xYourAddress",
  recipients,
  total: "30",
  mode: "fixed",
  provider: window.ethereum,
})

await sdk.waitForReceipt(txHash)
```

## Exported API

- `ArcSplitterSDK`
- `ARC_TESTNET`
- `SPLITTER_PROXY_ADDRESS`
- `BASIS_POINTS`
- `FEE_BPS`
- `MAX_RECIPIENTS`
- `SPLITTER_ABI`
- `Recipient`
- `SplitMode`
- `ValidationResult`
- `ComputedAmount`
- `ComputeBreakdownResult`
- `EthereumProvider`
- `SendSplitParams`
