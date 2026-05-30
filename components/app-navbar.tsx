"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useWallet } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Copy, LogOut, ExternalLink } from "lucide-react"
import { ARC_TESTNET } from "@/lib/arc-config"
import { toast } from "sonner"
import { ArcLogo } from "@/components/arc-logo"
import { ConnectWalletDialog } from "@/components/connect-wallet-dialog"
import { formatUSDC, shortAddr } from "@/lib/format"

const tabs = [
  { href: "/app", label: "Splitter" },
  { href: "/app/groups", label: "Saved Groups" },
  { href: "/app/history", label: "History" },
]

export function AppNavbar() {
  const pathname = usePathname()
  const { address, balance, isConnected, disconnect, switchWallet, walletType } = useWallet()
  const [connectOpen, setConnectOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2">
            <ArcLogo className="h-6 w-6" />
            <span className="text-base font-semibold tracking-tight">ArcSplitter</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((t) => {
              const active = pathname === t.href
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {isConnected && address ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs md:flex">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-mono font-medium tabular-nums">
                  {formatUSDC(balance)}
                </span>
                <span className="text-muted-foreground">USDC</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: "#00fdff", boxShadow: "0 0 8px #00fdff" }}
                    />
                    {shortAddr(address)}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="border-b border-border px-3 py-2 md:hidden">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</div>
                    <div className="font-mono text-sm tabular-nums">
                      {formatUSDC(balance)} <span className="text-muted-foreground">USDC</span>
                    </div>
                  </div>
                  <DropdownMenuItem
                    onClick={() => {
                      navigator.clipboard.writeText(address)
                      toast.success("Address copied")
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy address
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={`${ARC_TESTNET.explorerUrl}/address/${address}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Arcscan
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">Switch Wallet</div>
                  <DropdownMenuItem onClick={() => switchWallet("metamask")}>
                    Switch to MetaMask
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchWallet("coinbase")}>
                    Switch to Coinbase
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchWallet("rabby")}>
                    Switch to Rabby
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={disconnect} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setConnectOpen(true)}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {tabs.map((t) => {
          const active = pathname === t.href
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm transition-colors ${
                active ? "bg-secondary text-foreground" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </Link>
          )
        })}
      </nav>

      <ConnectWalletDialog open={connectOpen} onOpenChange={setConnectOpen} redirectTo="/app" />
    </header>
  )
}
