import * as React from "react"
import PayPageClient from "./PayPageClient"

export default function PayPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PayPageClient />
  </React.Suspense>
  )
}
