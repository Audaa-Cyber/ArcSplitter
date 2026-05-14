import { SplitterCard } from "@/components/splitter-card"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Dashboard</div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Send a payment</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Pay up to 20 wallets in one transaction. Choose fixed amounts or percentages, then sign once
          to send to everyone.
        </p>
      </div>
      <SplitterCard />
    </div>
  )
}
