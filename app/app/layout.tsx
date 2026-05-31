import { AppNavbar } from "@/components/app-navbar"
import { NetworkBanner } from "@/components/network-banner"
import { AIChat } from "@/components/ai-chat"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-background">
      <AppNavbar />
      <NetworkBanner />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>Built on Arc Testnet · <a href="https://github.com/The-offlines" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">The Offlines</a></span>
          <div className="flex items-center gap-4">
            <a href="https://faucet.circle.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Get Testnet USDC</a>
            <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Arcscan Explorer</a>
            <a href="https://docs.arc.io" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Arc Docs</a>
          </div>
        </div>
      </footer>
      <AIChat />
    </div>
  )
}
