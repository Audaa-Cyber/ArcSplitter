"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Fades in and slides up when scrolled into view.
 * Add `stagger` to animate immediate children in sequence.
 */
export function Reveal({
  children,
  className,
  stagger,
  as: Tag = "div",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  stagger?: boolean
  as?: keyof React.JSX.IntrinsicElements
  delay?: number
}) {
  const ref = React.useRef<HTMLElement | null>(null)
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            window.setTimeout(() => setVisible(true), delay)
            obs.unobserve(el)
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return React.createElement(
    Tag,
    {
      ref,
      className: cn(stagger ? "reveal-stagger" : "reveal", visible && "is-visible", className),
    },
    children,
  )
}
