import Image from "next/image"

export function ArcLogo({ className }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-lg ${className ?? "h-8 w-8"}`}>
      <Image
        src="/brand/arcsplitter.png"
        alt="ArcSplitter"
        fill
        sizes="32px"
        className="object-contain"
        priority
      />
    </div>
  )
}
