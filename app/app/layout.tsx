import { AppNavbar } from "@/components/app-navbar"
import { NetworkBanner } from "@/components/network-banner"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning className="min-h-screen bg-background">
      <AppNavbar />
      <NetworkBanner />
      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  )
}
