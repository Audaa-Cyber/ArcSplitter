"use client"

import * as React from "react"
import { SplitterCard } from "@/components/splitter-card"
import { Link2 } from "lucide-react"

export default function PayPage() {
  const [params, setParams] = React.useState(() => new URLSearchParams(""))

  React.useEffect(() => {
    setParams(new URLSearchParams(window.location.search))
  }, [])

  const prefillMode = (params.get("mode") === "percentage" ? "percentage" : "fixed") as "fixed" | "percentage"
  const prefillTotal = params.get("total") ?? undefined

  const prefillRecipients: { address: string; amount: string; label: string }[] = []
  let i = 0
  while (params.has(`r${i}`)) {
    const raw = params.get(`r${i}`) ?? ""
    const [address = "", amount = "", label = ""] = raw.split(",")
    prefillRecipients.push({ address, amount, label })
    i++
  }

  const hasData = prefillRecipients.length > 0 || prefillTotal

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Payment Link</div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {hasData ? "Pre-filled payment" : "Send a payment"}
        </h1>
        {hasData && (
          <div className="flex items-center gap-2 rounded-lg border border-[#00fdff]/30 bg-[#00fdff]/5 px-4 py-2.5 text-sm text-[#00fdff] w-fit">
            <Link2 className="h-3.5 w-3.5 shrink-0" />
            This split was pre-filled from a payment link. Review and send when ready.
          </div>
        )}
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Built on Arc Testnet. Pay up to 20 wallets in one transaction.
        </p>
      </div>
      <SplitterCard
        prefillTotal={prefillTotal}
        prefillMode={prefillMode}
        prefillRecipients={prefillRecipients.length > 0 ? prefillRecipients : undefined}
      />
    </div>
  )
}
