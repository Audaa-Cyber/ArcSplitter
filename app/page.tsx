"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  Zap,
  Shield,
  Layers,
  Wallet,
  Clock,
  Network,
  Lock,
  CircleCheck,
  Sparkles,
} from "lucide-react"
import { ArcLogo } from "@/components/arc-logo"
import { Reveal } from "@/components/reveal"
import { ConnectWalletButton } from "@/components/connect-wallet-dialog"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden px-4 sm:px-6 lg:px-8">
      <SiteNav />
      <Hero />
      <WalletStrip />
      <HowItWorks />
      <Features />
      <PreviewBlock />
      <Security />
      <Stats />
      <FAQ />
      <FinalCTA />
      <SiteFooter />
    </main>
  )
}

/* ============ NAV ============ */
function SiteNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-[22px]">
        <Link href="/" className="group flex items-center gap-2">
          <ArcLogo className="h-10 w-10 transition-transform group-hover:rotate-12" />
          <span className="text-base font-semibold tracking-tight">ArcSplitter</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#security" className="transition-colors hover:text-foreground">Security</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <ConnectWalletButton size="sm" className="border border-cyan-400/40 bg-foreground text-background shadow-[0_10px_35px_-20px_rgba(0,0,0,0.35)] hover:bg-foreground/90 dark:border-cyan-500/50 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            Connect Wallet
          </ConnectWalletButton>
        </div>
      </div>
    </header>
  )
}

/* ============ HERO ============ */
function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      {/* animated background */}
      <div className="absolute inset-0 bg-grid opacity-70" aria-hidden />
      <div
        className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-35 blur-3xl animate-blob"
        style={{ background: "radial-gradient(closest-side, rgba(0,253,255,0.45) 0%, transparent 70%)" }}
        aria-hidden
      />
      <div
        className="absolute right-0 top-1/3 h-[320px] w-[420px] rounded-full opacity-18 blur-3xl animate-blob"
        style={{
          background: "radial-gradient(closest-side, rgba(0,253,255,0.5) 0%, transparent 70%)",
          animationDelay: "4s",
        }}
        aria-hidden
      />

        <div className="relative mx-auto max-w-7xl px-[22px] pb-28 pt-24 md:pb-40 md:pt-36">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#00fdff", boxShadow: "0 0 12px #00fdff" }}
              />
              Live on Arc Testnet
              <Sparkles className="h-3 w-3 text-[#00fdff]" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-8 text-balance text-[3rem] font-semibold leading-[0.98] tracking-[-0.035em] text-foreground md:text-[5.25rem] lg:text-[6rem]">
              <span className="block">Many wallets.</span>
              <span className="relative mt-2 inline-block">
                <span className="relative z-10 block">One payment.</span>
                <span
                  className="absolute -bottom-1 left-0 right-0 h-3 -z-0 rounded-md opacity-80"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, #00fdff 50%, transparent 100%)",
                    filter: "blur(10px)",
                  }}
                />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={250}>
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              ArcSplitter is the easiest way to pay up to 20 wallets in a single transaction. Split by
              fixed amount or by percentage. No setup. No middlemen. Just connect your wallet and send.
            </p>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ConnectWalletButton size="xl">Launch App</ConnectWalletButton>
              <a
                href="#how"
                className="inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                How it works
              </a>
            </div>
          </Reveal>

          <Reveal delay={520}>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CircleCheck className="h-3.5 w-3.5 text-[#00fdff]" /> One signature
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CircleCheck className="h-3.5 w-3.5 text-[#00fdff]" /> Up to 20 recipients
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CircleCheck className="h-3.5 w-3.5 text-[#00fdff]" /> Non custodial
              </span>
            </div>
          </Reveal>
        </div>

        {/* Floating preview card */}
        <Reveal delay={650}>
          <div className="relative mx-auto mt-24 max-w-5xl">
            <div
              className="pointer-events-none absolute -inset-10 rounded-3xl opacity-50 blur-3xl"
              style={{ background: "radial-gradient(closest-side, rgba(0,253,255,0.4), transparent)" }}
              aria-hidden
            />
            <div className="relative animate-float rounded-2xl border border-border bg-background shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
              <MiniDashboard />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function MiniDashboard() {
  const rows = [
    { name: "Alice", addr: "0x7a4f...1Bc2", amt: "4,000.00", pct: 40, color: "#00fdff" },
    { name: "Bob", addr: "0xCe11...9Aa3", amt: "3,500.00", pct: 35, color: "#0a0a0a" },
    { name: "Carol", addr: "0x3D2e...44Fb", amt: "1,500.00", pct: 15, color: "#6b7280" },
    { name: "Dao Treasury", addr: "0xB0e7...21d9", amt: "1,000.00", pct: 10, color: "#a1a1aa" },
  ]
  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">
          arcsplitter.app
        </span>
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: "#00fdff", boxShadow: "0 0 8px #00fdff" }}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
        <div className="space-y-4 p-5 md:p-7">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="inline-flex rounded-md border border-border bg-secondary/50 p-0.5 text-[10px]">
              <span className="rounded-[4px] bg-background px-2 py-0.5 shadow-sm">Fixed</span>
              <span className="px-2 py-0.5 text-muted-foreground">%</span>
            </span>
          </div>
          <div className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-3xl tabular-nums shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
            10,000.00
            <span className="ml-2 align-middle text-xs text-muted-foreground">USDC</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-xs shadow-[0_2px_8px_-4px_rgba(0,0,0,0.08)]"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: r.color }} />
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-medium">{r.name}</div>
                  <div className="truncate font-mono text-[10px] text-muted-foreground">{r.addr}</div>
                </div>
              </div>
              <span className="shrink-0 font-mono tabular-nums">
                {r.amt}
                <span className="ml-1 text-[10px] text-muted-foreground">USDC</span>
              </span>
            </div>
          ))}
          <div className="rounded-xl bg-foreground py-2.5 text-center text-xs font-medium text-background shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]">
            Send 10,000 USDC
          </div>
        </div>
        <div className="flex items-center justify-center border-t border-border bg-muted/20 p-6 md:border-l md:border-t-0">
          <div className="relative h-40 w-40">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#ececec" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#00fdff" strokeWidth="3" strokeDasharray="40 100" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#0a0a0a" strokeWidth="3" strokeDasharray="35 100" strokeDashoffset="-40" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#6b7280" strokeWidth="3" strokeDasharray="15 100" strokeDashoffset="-75" strokeLinecap="round" />
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#a1a1aa" strokeWidth="3" strokeDasharray="10 100" strokeDashoffset="-90" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-xl font-medium tabular-nums">10K</div>
              <div className="text-[10px] text-muted-foreground">USDC</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============ WALLET STRIP (sliding marquee) ============ */
function WalletStrip() {
  const logos = [
    { name: "ArcSplitter", src: "/brand/arcsplitter.png", size: 40, isBrand: true },
    { name: "MetaMask", src: "/wallets/metamask.png", size: 56 },
    { name: "Coinbase Wallet", src: "/wallets/coinbase.png", size: 40 },
    { name: "WalletConnect", src: "/wallets/walletconnect.png", size: 40 },
  ]
  // Duplicate the list so the marquee loops seamlessly
  const loop = [...logos, ...logos]
  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/20 py-14">
      {/* fade masks on sides */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 md:w-40"
        style={{ background: "linear-gradient(to right, var(--background), transparent)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 md:w-40"
        style={{ background: "linear-gradient(to left, var(--background), transparent)" }}
        aria-hidden
      />

      <div className="relative flex w-full overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-16 pr-16 md:gap-24 md:pr-24">
          {loop.map((w, i) => (
            <div
              key={`${w.name}-${i}`}
              className="group flex shrink-0 items-center gap-3 opacity-80 transition-opacity hover:opacity-100"
            >
              <Image
                src={w.src}
                alt={`${w.name} logo`}
                width={w.size}
                height={w.size}
                className="object-contain"
                style={{
                  height: w.size,
                  width: w.wide ? "auto" : w.size,
                  maxWidth: w.wide ? w.size * 2.4 : w.size,
                }}
              />
              <span className="text-base font-medium text-foreground/85 group-hover:text-foreground md:text-lg">
                {w.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============ HOW IT WORKS ============ */
function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Connect your wallet",
      body: "MetaMask, Coinbase Wallet, or WalletConnect. We&apos;ll add Arc Testnet for you if it&apos;s missing.",
      icon: Wallet,
    },
    {
      n: "02",
      title: "Add your recipients",
      body: "Paste up to 20 wallet addresses. Choose fixed amounts or split a total by percentage.",
      icon: Layers,
    },
    {
      n: "03",
      title: "Send in one click",
      body: "Sign once. Everyone gets paid in the same transaction. View the receipt on Arcscan.",
      icon: Zap,
    },
  ]
  return (
    <section id="how" className="relative border-b border-border">
      <div className="mx-auto max-w-7xl px-[22px] py-28 md:py-40">
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="From one wallet to many, in three steps."
            description="Built for teams, DAOs, and anyone who needs to pay multiple people at once."
          />
        </Reveal>
        <Reveal stagger className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="group/step relative bg-background p-8 md:p-10 transition-colors hover:bg-muted/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition-all group-hover/step:border-[#00fdff] group-hover/step:cyan-glow">
                  <s.icon className="h-4 w-4 transition-colors group-hover/step:text-[#0a0a0a]" />
                </div>
              </div>
              <h3 className="mt-12 text-xl font-medium tracking-tight">{s.title}</h3>
              <p
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: s.body }}
              />
              <div
                className="mt-12 h-px w-12 transition-all duration-500 group-hover/step:w-full"
                style={{ background: "#00fdff", boxShadow: "0 0 8px rgba(0, 253, 255, 0.6)" }}
              />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* ============ FEATURES ============ */
function Features() {
  const features = [
    {
      icon: Layers,
      title: "Two ways to split",
      body: "Pick fixed amounts per wallet, or set percentages of a total. Switch with one click.",
    },
    {
      icon: Zap,
      title: "One transaction",
      body: "Pay everyone at once. No setup, no separate transfers, no waiting between sends.",
    },
    {
      icon: Shield,
      title: "Smart validation",
      body: "We catch duplicate addresses, invalid wallets, and totals that don&apos;t add up. Before you sign.",
    },
    {
      icon: Network,
      title: "Network aware",
      body: "If your wallet is on the wrong network, we offer a one click switch. You stay in flow.",
    },
    {
      icon: Clock,
      title: "Saved groups",
      body: "Save your team or contractor list once. Reuse it for recurring payments forever.",
    },
    {
      icon: Sparkles,
      title: "Live preview",
      body: "Watch the donut chart update as you type. Confirm the split looks right before sending.",
    },
  ]
  return (
    <section id="features" className="relative border-b border-border bg-muted/10">
      <div className="mx-auto max-w-7xl px-[22px] py-28 md:py-40">
        <Reveal>
          <SectionHeader
            eyebrow="Features"
            title="Everything you need to send payments."
            description="A focused tool that does one thing exceptionally well."
          />
        </Reveal>
        <Reveal stagger className="mt-20 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="group/f bg-background p-8 md:p-10 transition-colors hover:bg-[#f6fffe]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background transition-all group-hover/f:border-[#00fdff] group-hover/f:cyan-glow">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-8 text-lg font-medium tracking-tight">{f.title}</h3>
              <p
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: f.body }}
              />
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* ============ PREVIEW ============ */
function PreviewBlock() {
  return (
    <section className="relative border-b border-border">
      <div className="mx-auto max-w-7xl px-[22px] py-28 md:py-40">
        <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
          <Reveal>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Dashboard</div>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-balance md:text-6xl">
                A splitter that feels like a payment terminal.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
                Type a total, paste your recipients, watch the allocation update in real time. When everything
                looks good, sign once and the payments go out together.
              </p>
              <ul className="mt-10 space-y-4 text-sm">
                {[
                  "Live allocation chart",
                  "Smart sum validation",
                  "Save and reuse recipient groups",
                  "Wallet linked transaction history",
                ].map((t, i) => (
                  <li key={t} className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: "#00fdff", boxShadow: "0 0 10px #00fdff" }}
                    />
                    <span className="text-foreground/90">{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-12">
                <ConnectWalletButton size="lg">Try the dashboard</ConnectWalletButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-8 rounded-3xl opacity-40 blur-3xl"
                style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-border bg-background shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] animate-float">
                <MiniDashboard />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ============ SECURITY ============ */
function Security() {
  return (
    <section id="security" className="relative overflow-hidden border-b border-border bg-foreground text-background">
      <div
        className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full opacity-30 blur-3xl animate-blob"
        style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-0 h-96 w-96 rounded-full opacity-20 blur-3xl animate-blob"
        style={{ background: "radial-gradient(closest-side, #00fdff, transparent)", animationDelay: "5s" }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-[22px] py-28 md:py-40 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <div>
            <div className="text-xs uppercase tracking-wider text-background/60">Security</div>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-balance md:text-6xl">
              All or nothing.
              <br />
              <span className="text-[#00fdff] cyan-text-glow">Always safe.</span>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="space-y-10 text-sm leading-relaxed text-background/80">
            <p className="text-base md:text-lg">
              ArcSplitter sends to everyone in one transaction. Either every recipient gets paid, or the
              transaction fails and your funds stay in your wallet. There&apos;s no in between.
            </p>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-background/15 sm:grid-cols-2">
              {[
                {
                  icon: Lock,
                  title: "Non custodial",
                  body: "ArcSplitter never holds your funds. Every payment is signed by your wallet and goes directly to recipients.",
                },
                {
                  icon: Shield,
                  title: "Strict validation",
                  body: "Duplicate addresses, invalid wallets, and totals that don&apos;t match are blocked before you sign.",
                },
                {
                  icon: Network,
                  title: "Network locked",
                  body: "Only operates on Arc Testnet. Sending on the wrong network is impossible.",
                },
                {
                  icon: CircleCheck,
                  title: "Open and verifiable",
                  body: "Every transaction is public on Arcscan. Audit the receipt anytime.",
                },
              ].map((s) => (
                <div key={s.title} className="bg-foreground p-7">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-background/20">
                    <s.icon className="h-4 w-4 text-[#00fdff]" />
                  </div>
                  <h3 className="mt-5 text-base font-medium text-background">{s.title}</h3>
                  <p
                    className="mt-2 text-sm leading-relaxed text-background/70"
                    dangerouslySetInnerHTML={{ __html: s.body }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-background/50">
              Note: ArcSplitter is currently deployed on Arc Testnet for development and testing. Always
              double check recipient addresses before signing.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ============ STATS ============ */
function Stats() {
  const stats = [
    { value: "20", label: "Recipients per send" },
    { value: "1", label: "Signature needed" },
    { value: "0", label: "Manual steps" },
    { value: "∞", label: "Saved groups" },
  ]
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-[22px] py-24">
        <Reveal stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-background p-10 text-center">
              <div className="font-mono text-4xl font-medium tabular-nums md:text-5xl">{s.value}</div>
              <div className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* ============ FAQ ============ */
function FAQ() {
  const faqs = [
    {
      q: "Why does ArcSplitter only work on Arc Testnet?",
      a: "Arc Testnet is built around USDC as the main currency, which is exactly what makes one click splits possible. Mainnet support is coming once contracts are audited.",
    },
    {
      q: "Do I need any special tokens to use this?",
      a: "No. You just need USDC on Arc Testnet. Connect your wallet and you can send right away.",
    },
    {
      q: "How many wallets can I send to at once?",
      a: "Up to 20 wallets per transaction. This covers almost every real world use case while keeping fees predictable.",
    },
    {
      q: "Is my recipient list stored anywhere?",
      a: "Your saved groups live in your browser, tied to your wallet. They never leave your device unless you choose to share them.",
    },
    {
      q: "What happens if a payment fails?",
      a: "Payments are all or nothing. If any single transfer fails, the whole transaction is cancelled and your USDC stays safely in your wallet.",
    },
  ]
  return (
    <section id="faq" className="border-b border-border bg-muted/10">
      <div className="mx-auto max-w-4xl px-[22px] py-28 md:py-40">
        <Reveal>
          <SectionHeader eyebrow="FAQ" title="Questions, answered." />
        </Reveal>
        <Reveal stagger className="mt-14 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-sm font-medium transition-colors hover:bg-secondary/40 md:text-base">
                {f.q}
                <span className="ml-4 flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-6 pb-6 text-sm leading-relaxed text-muted-foreground">{f.a}</div>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

/* ============ FINAL CTA ============ */
function FinalCTA() {
  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(0,253,255,0.22), transparent 65%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[80%] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, #00fdff, transparent)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-[22px] py-28 text-center md:py-40">
        <Reveal>
          <h2 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Ready to send your first
            <br />
            <span className="text-[#00fdff] cyan-text-glow">split payment?</span>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Connect your wallet, add recipients, and send. Free to use on Arc Testnet.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-12">
            <ConnectWalletButton size="xl">Connect Wallet</ConnectWalletButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ============ FOOTER ============ */
function SiteFooter() {
  return (
    <footer>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 px-[22px] py-16 md:grid-cols-4">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <ArcLogo className="h-8 w-8" />
            <span className="text-base font-semibold tracking-tight">ArcSplitter</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The easiest way to send USDC to many wallets at once. Built for teams, DAOs, and anyone who pays
            multiple people.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            { label: "Dashboard", href: "/app" },
            { label: "Saved Groups", href: "/app/groups" },
            { label: "History", href: "/app/history" },
          ]}
        />
        <FooterCol
          title="Resources"
          links={[
            { label: "Arcscan", href: "https://testnet.arcscan.app" },
            { label: "FAQ", href: "#faq" },
            { label: "How it works", href: "#how" },
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-3 px-[22px] py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <span>© {new Date().getFullYear()} ArcSplitter. Testnet release.</span>
          <span>Made for the Arc community. The offlines.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{title}</div>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-foreground/80 transition-colors hover:text-foreground">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-block text-xs uppercase tracking-wider text-muted-foreground">
        <span className="border-b border-[#00fdff] pb-1">{eyebrow}</span>
      </div>
      <h2 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}
