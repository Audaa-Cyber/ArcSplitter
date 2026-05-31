"use client"

import * as React from "react"
import { useWallet } from "@/components/wallet-provider"
import { Card } from "@/components/ui/card"
import { ARC_TESTNET } from "@/lib/arc-config"
import { shortAddr } from "@/lib/format"
import { Copy, ExternalLink, Star, Wallet, Camera, Pencil, Mail } from "lucide-react"
import { toast } from "sonner"
import { loadHistory, loadGroups } from "@/lib/storage"

type SocialLinks = {
  email: string
  twitter: string
  telegram: string
  discord: string
  website: string
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.11 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  )
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function Identicon({ address, size = 64 }: { address: string; size?: number }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !address) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const gridSize = 5
    const cellSize = size / gridSize
    const hash = address.toLowerCase().replace("0x", "")
    ctx.clearRect(0, 0, size, size)
    const r = parseInt(hash.slice(0, 2), 16)
    const g = parseInt(hash.slice(2, 4), 16)
    const b = parseInt(hash.slice(4, 6), 16)
    const color = `rgb(${r},${g},${b})` 
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < Math.ceil(gridSize / 2); col++) {
        const index = row * Math.ceil(gridSize / 2) + col
        const on = parseInt(hash[index % hash.length], 16) % 2 === 0
        if (on) {
          ctx.fillStyle = color
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize)
          ctx.fillRect((gridSize - 1 - col) * cellSize, row * cellSize, cellSize, cellSize)
        }
      }
    }
  }, [address, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded-xl"
    />
  )
}

export default function ProfilePage() {
  const { address, balance, isConnected } = useWallet()
  const [copied, setCopied] = React.useState(false)
  const [txCount, setTxCount] = React.useState(0)
  const [groupCount, setGroupCount] = React.useState(0)
  const [pfp, setPfp] = React.useState<string | null>(null)
  const [username, setUsername] = React.useState<string>("")
  const [editingUsername, setEditingUsername] = React.useState(false)
  const [socials, setSocials] = React.useState<SocialLinks>({
    email: "",
    twitter: "",
    telegram: "",
    discord: "",
    website: "",
  })
  const [editingSocials, setEditingSocials] = React.useState(false)

  React.useEffect(() => {
    if (!address) return
    const history = loadHistory(address)
    const groups = loadGroups(address)
    setTxCount(history.filter((h) => h.status === "confirmed").length)
    setGroupCount(groups.length)
  }, [address])

  React.useEffect(() => {
    if (!address) return
    const saved = localStorage.getItem(`arc:pfp:${address.toLowerCase()}`)
    if (saved) setPfp(saved)
    const savedUsername = localStorage.getItem(`arc:username:${address.toLowerCase()}`)
    if (savedUsername) setUsername(savedUsername)
    const savedSocials = localStorage.getItem(`arc:socials:${address.toLowerCase()}`)
    if (savedSocials) setSocials(JSON.parse(savedSocials))
  }, [address])

  const isPremium = txCount >= 5

  function copyAddress() {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success("Address copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  function handlePfpUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setPfp(result)
      localStorage.setItem(`arc:pfp:${address!.toLowerCase()}`, result)
      toast.success("Profile picture updated!")
    }
    reader.readAsDataURL(file)
  }

  function handleSaveUsername() {
    if (!address) return
    if (username.trim().length < 2) {
      toast.error("Username must be at least 2 characters")
      return
    }
    localStorage.setItem(`arc:username:${address.toLowerCase()}`, username.trim())
    setEditingUsername(false)
    toast.success("Username saved!")
  }

  function handleSaveSocials() {
    if (!address) return
    localStorage.setItem(`arc:socials:${address.toLowerCase()}`, JSON.stringify(socials))
    setEditingSocials(false)
    toast.success("Social links saved!")
  }

  if (!isConnected || !address) {
    return (
      <div className="space-y-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Profile</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your profile</h1>
        </div>
        <Card className="flex flex-col items-center justify-center border-dashed py-20 text-center">
          <Wallet className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-base font-medium">Connect your wallet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Connect to view your profile.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Profile</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your profile</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Avatar + Identity Card */}
        <Card className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <label htmlFor="pfp-upload" className="cursor-pointer">
                {pfp ? (
                  <img
                    src={pfp}
                    alt="Profile"
                    className="h-[72px] w-[72px] rounded-xl object-cover"
                  />
                ) : (
                  <Identicon address={address} size={72} />
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </label>
              <input
                id="pfp-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePfpUpload}
              />
              {isPremium && (
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#00fdff]">
                  <Star className="h-3 w-3 text-black" fill="black" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveUsername()}
                      placeholder="Enter username"
                      className="rounded-md border border-border bg-background px-2 py-1 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#00fdff]"
                      maxLength={20}
                    />
                    <button onClick={handleSaveUsername} className="text-xs text-[#00fdff] hover:underline">Save</button>
                    <button onClick={() => setEditingUsername(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {username || shortAddr(address)}
                    </span>
                    <button
                      onClick={() => setEditingUsername(true)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#ecfeff] px-2 py-0.5 text-[10px] font-medium text-[#067a7c] border border-[#00fdff]/30">
                    <Star className="h-2.5 w-2.5" fill="currentColor" />
                    Premium
                  </span>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Arc Testnet</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Wallet address</div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <span className="flex-1 truncate font-mono text-xs">{address}</span>
              <button onClick={copyAddress} className="shrink-0 text-muted-foreground hover:text-foreground">
                <Copy className="h-3.5 w-3.5" />
              </button>
              <a
                href={`${ARC_TESTNET.explorerUrl}/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </Card>

        {/* Balance + Stats Card */}
        <Card className="flex flex-col gap-6 p-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Balance</div>
            <div className="mt-2 font-mono text-4xl font-semibold tabular-nums">
              {Number(balance).toFixed(2)}
              <span className="ml-2 text-base font-normal text-muted-foreground">USDC</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Splits sent</div>
              <div className="mt-2 font-mono text-2xl font-semibold">{txCount}</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Saved groups</div>
              <div className="mt-2 font-mono text-2xl font-semibold">{groupCount}</div>
            </div>
          </div>

          {!isPremium && (
            <div className="rounded-xl border border-[#00fdff]/30 bg-[#ecfeff]/50 p-4 text-sm">
              <div className="font-medium">Unlock Premium</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Send {5 - txCount} more split{5 - txCount !== 1 ? "s" : ""} to unlock Premium status.
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(txCount / 5) * 100}%`, background: "#00fdff" }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Social Links Card */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Social links</div>
            {!editingSocials ? (
              <button
                onClick={() => setEditingSocials(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={handleSaveSocials} className="text-xs text-[#00fdff] hover:underline">Save</button>
                <button onClick={() => setEditingSocials(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { key: "email", label: "Email", placeholder: "you@example.com", icon: <Mail className="h-3.5 w-3.5" /> },
              { key: "twitter", label: "X (Twitter)", placeholder: "@username", icon: <XIcon className="h-3.5 w-3.5" /> },
              { key: "telegram", label: "Telegram", placeholder: "@username", icon: <TelegramIcon className="h-3.5 w-3.5" /> },
              { key: "discord", label: "Discord", placeholder: "username#0000", icon: <DiscordIcon className="h-3.5 w-3.5" /> },
              { key: "website", label: "Website", placeholder: "https://yoursite.com", icon: <GlobeIcon className="h-3.5 w-3.5" /> },
            ].map((field) => (
              <div key={field.key} className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {field.icon}
                  <span>{field.label}</span>
                </div>
                {editingSocials ? (
                  <input
                    value={socials[field.key as keyof SocialLinks]}
                    onChange={(e) => setSocials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="mt-1 w-full bg-transparent text-sm focus:outline-none"
                  />
                ) : (
                  <div className="mt-1 text-sm">
                    {socials[field.key as keyof SocialLinks] || (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
