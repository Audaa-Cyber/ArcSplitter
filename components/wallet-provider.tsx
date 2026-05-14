"use client"

import * as React from "react"
import { createPublicClient, http, formatUnits, type Address } from "viem"
import { ARC_TESTNET, walletAddArcTestnetParams } from "@/lib/arc-config"
import { toast } from "sonner"

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<any>
  on?: (event: string, handler: (...args: any[]) => void) => void
  removeListener?: (event: string, handler: (...args: any[]) => void) => void
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
}

declare global {
  interface Window {
    ethereum?: EthereumProvider
  }
}

type WalletState = {
  address: Address | null
  chainId: number | null
  balance: string // formatted USDC string
  isConnecting: boolean
  isConnected: boolean
  isCorrectNetwork: boolean
}

type WalletContextValue = WalletState & {
  connect: (preferred?: "metamask" | "coinbase" | "injected") => Promise<void>
  disconnect: () => void
  switchNetwork: () => Promise<void>
  refreshBalance: () => Promise<void>
  provider: EthereumProvider | null
}

const WalletContext = React.createContext<WalletContextValue | null>(null)

const publicClient = createPublicClient({
  chain: {
    id: ARC_TESTNET.chainId,
    name: ARC_TESTNET.name,
    nativeCurrency: ARC_TESTNET.currency,
    rpcUrls: { default: { http: [ARC_TESTNET.rpcUrl] } },
  },
  transport: http(ARC_TESTNET.rpcUrl),
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = React.useState<Address | null>(null)
  const [chainId, setChainId] = React.useState<number | null>(null)
  const [balance, setBalance] = React.useState<string>("0.00")
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [provider, setProvider] = React.useState<EthereumProvider | null>(null)

  const isConnected = !!address
  const isCorrectNetwork = chainId === ARC_TESTNET.chainId

  const getInjectedProvider = React.useCallback(
    (preferred?: "metamask" | "coinbase" | "injected"): EthereumProvider | null => {
      if (typeof window === "undefined") return null
      const eth = window.ethereum as any
      if (!eth) return null
      // EIP-6963 style multi-provider
      const providers = eth.providers as EthereumProvider[] | undefined
      if (providers && providers.length) {
        if (preferred === "metamask") {
          return providers.find((p) => p.isMetaMask) ?? providers[0]
        }
        if (preferred === "coinbase") {
          return providers.find((p) => p.isCoinbaseWallet) ?? providers[0]
        }
        return providers[0]
      }
      return eth as EthereumProvider
    },
    [],
  )

  const refreshBalance = React.useCallback(async () => {
    if (!address) return
    try {
      const bal = await publicClient.getBalance({ address })
      // Native USDC balance in raw units. Convert to a clean decimal string.
      const human = formatUnits(bal, ARC_TESTNET.currency.decimals)
      setBalance(human)
    } catch (err) {
      console.log("[v0] balance fetch failed", err)
      setBalance("0.00")
    }
  }, [address])

  const handleAccountsChanged = React.useCallback((accounts: string[]) => {
    if (!accounts || accounts.length === 0) {
      setAddress(null)
      setBalance("0.00")
    } else {
      setAddress(accounts[0] as Address)
    }
  }, [])

  function parseChainId(cid: string | null | undefined): number | null {
    if (!cid) return null
    if (cid.startsWith("0x") || cid.startsWith("0X")) {
      return parseInt(cid, 16)
    }
    if (/^\d+$/.test(cid)) {
      return parseInt(cid, 10)
    }
    return null
  }

  const handleChainChanged = React.useCallback((cid: string) => {
    setChainId(parseChainId(cid))
  }, [])

  const connect = React.useCallback(
    async (preferred?: "metamask" | "coinbase" | "injected") => {
      const inj = getInjectedProvider(preferred)
      if (!inj) {
        toast.error("No wallet detected. Install MetaMask or Coinbase Wallet.")
        return
      }
      setIsConnecting(true)
      try {
        const accounts: string[] = await inj.request({ method: "eth_requestAccounts" })
        const cid: string = await inj.request({ method: "eth_chainId" })
        setProvider(inj)
        setAddress((accounts[0] as Address) ?? null)
        setChainId(parseChainId(cid))
        // attach listeners
        inj.on?.("accountsChanged", handleAccountsChanged)
        inj.on?.("chainChanged", handleChainChanged)
        if (typeof window !== "undefined") {
          localStorage.setItem("arc:wallet:connected", "1")
        }
      } catch (err: any) {
        console.log("[v0] connect failed", err)
        toast.error(err?.message || "Failed to connect wallet")
      } finally {
        setIsConnecting(false)
      }
    },
    [getInjectedProvider, handleAccountsChanged, handleChainChanged],
  )

  const disconnect = React.useCallback(() => {
    if (provider) {
      provider.removeListener?.("accountsChanged", handleAccountsChanged)
      provider.removeListener?.("chainChanged", handleChainChanged)
    }
    setAddress(null)
    setChainId(null)
    setBalance("0.00")
    setProvider(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("arc:wallet:connected")
    }
  }, [provider, handleAccountsChanged, handleChainChanged])

  const switchNetwork = React.useCallback(async () => {
    const inj = provider ?? getInjectedProvider()
    if (!inj) {
      toast.error("No wallet detected.")
      return
    }
    try {
      await inj.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_TESTNET.chainIdHex }],
      })
    } catch (err: any) {
      // 4902 = chain not added
      if (err?.code === 4902 || /Unrecognized chain/i.test(err?.message ?? "")) {
        try {
          await inj.request({
            method: "wallet_addEthereumChain",
            params: [walletAddArcTestnetParams],
          })
        } catch (addErr: any) {
          console.log("[v0] add chain failed", addErr)
          toast.error(addErr?.message || "Failed to add Arc Testnet")
        }
      } else {
        console.log("[v0] switch chain failed", err)
        toast.error(err?.message || "Failed to switch network")
      }
    }
  }, [provider, getInjectedProvider])

  // Reconnect on load if user previously connected
  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (localStorage.getItem("arc:wallet:connected") !== "1") return
    const inj = getInjectedProvider()
    if (!inj) return
    inj
      .request({ method: "eth_accounts" })
      .then(async (accounts: string[]) => {
        if (accounts && accounts.length) {
          const cid: string = await inj.request({ method: "eth_chainId" })
          setProvider(inj)
          setAddress(accounts[0] as Address)
          setChainId(parseChainId(cid))
          inj.on?.("accountsChanged", handleAccountsChanged)
          inj.on?.("chainChanged", handleChainChanged)
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll balance when address or chain changes
  React.useEffect(() => {
    refreshBalance()
    const t = setInterval(refreshBalance, 12_000)
    return () => clearInterval(t)
  }, [refreshBalance, chainId])

  const value: WalletContextValue = {
    address,
    chainId,
    balance,
    isConnecting,
    isConnected,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
    provider,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = React.useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider")
  return ctx
}

export function shortAddress(addr?: string | null) {
  if (!addr) return ""
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}
