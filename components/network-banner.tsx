"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/components/wallet-provider"
import { ARC_TESTNET } from "@/lib/arc-config"

export function NetworkBanner() {
  const { isConnected, isCorrectNetwork, switchNetwork } = useWallet()
  if (!isConnected || isCorrectNetwork) return null

  return (
    <div className="border-b border-border bg-[#fffbeb]">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-6 py-3 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600" />
          <div className="text-sm">
            <div className="font-medium text-foreground">You&apos;re on the wrong network</div>
            <div className="text-muted-foreground">
              ArcSplitter only works on {ARC_TESTNET.name}. Switch your wallet to continue.
            </div>
          </div>
        </div>
        <Button
          size="sm"
          onClick={switchNetwork}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          Switch to {ARC_TESTNET.name}
        </Button>
      </div>
    </div>
  )
}
