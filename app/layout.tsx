import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/components/wallet-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "ArcSplitter Split USDC instantly across multiple wallets",
  description:
    "ArcSplitter is a USDC payment splitter built for Arc Testnet. Send to up to 20 wallets in a single transaction. Built for teams, DAOs, and on-chain payroll.",
  generator: "v0.app",
  openGraph: {
    title: "ArcSplitter USDC payment splitter for Arc Testnet",
    description:
      "Split USDC instantly across multiple wallets. Built for Arc Testnet.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-background">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} enableColorScheme={false}>
          <WalletProvider>{children}</WalletProvider>
          <Toaster position="bottom-right" />
          {process.env.NODE_ENV === "production" && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
