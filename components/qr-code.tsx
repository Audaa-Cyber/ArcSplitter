"use client"

import * as React from "react"
import * as QrcodeLib from "qrcode"

interface QRCodeProps {
  value: string
  size?: number
}

export function QRCode({ value, size = 144 }: QRCodeProps) {
  const [src, setSrc] = React.useState<string>("")

  React.useEffect(() => {
    if (!value) {
      setSrc("")
      return
    }

    QrcodeLib.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    })
      .then(setSrc)
      .catch(() => setSrc(""))
  }, [value, size])

  if (!src) {
    return (
      <div
        className="flex h-[144px] w-[144px] items-center justify-center rounded-3xl border border-border bg-muted/40 text-xs text-muted-foreground"
      >
        Generating QR...
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="Transaction QR code"
      width={size}
      height={size}
      className="rounded-3xl border border-border bg-white shadow-sm"
    />
  )
}
