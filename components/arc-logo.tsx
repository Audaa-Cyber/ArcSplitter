import Image from "next/image"

export function ArcLogo({ className }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center rounded-[28px] ${className ?? "h-[72px] w-[96px]"}`}>
      <div className="absolute inset-0 rounded-[28px] border border-white/80 bg-slate-950/95 shadow-[0_14px_50px_-30px_rgba(0,0,0,0.75)]" />
      <div className="absolute inset-1 rounded-[26px] bg-slate-950/80" />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 z-20 h-full w-full animate-spin-slow origin-center"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="#00fdff"
          strokeWidth="5"
          strokeDasharray="24 258"
          strokeDashoffset="-10"
          strokeLinecap="round"
        />
      </svg>
      <div className="relative z-30 h-full w-full overflow-hidden rounded-[22px] bg-slate-950 p-2">
        <Image
          src="/brand/arcsplitter.jpg"
          alt="ArcSplitter"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
