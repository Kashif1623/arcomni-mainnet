import { useState, useEffect } from 'react'
import { ConnectKitButton } from 'connectkit'
import { useAccount, useReadContract } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Zap, Shield, Terminal, MessageSquare, Menu, X } from 'lucide-react'
import { erc20Abi } from 'viem'
import { ARC_MAINNET_ID, ARC_USDC_ADDRESS } from '@/config'

const USDC_DECIMALS = 6

interface NavbarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'intent', label: 'Intent Parser', icon: Terminal },
  { id: 'tracker', label: 'Gas Tracker', icon: Zap },
  { id: 'shield', label: 'Security Shield', icon: Shield },
  { id: 'agent', label: 'AI Agent', icon: MessageSquare },
]

function formatUsdc(raw: bigint): string {
  const n = Number(raw) / 10 ** USDC_DECIMALS
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { address, isConnected } = useAccount()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [blockTime, setBlockTime] = useState(0)

  const { data: rawBalance } = useReadContract({
    address: ARC_USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: ARC_MAINNET_ID,
    query: { enabled: !!address },
  })

  const balance = rawBalance !== undefined ? formatUsdc(rawBalance) : null

  // Block ticker — Arc Mainnet ~2.8s block time
  useEffect(() => {
    const tick = setTimeout(() => setBlockTime(new Date().getTime()), 0)
    const interval = setInterval(() => setBlockTime(new Date().getTime()), 2800)
    return () => { clearTimeout(tick); clearInterval(interval) }
  }, [])

  const blockNum = Math.floor(blockTime / 2800) + 12_540_000

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className="glass-strong border-b border-[var(--border)] px-4 py-3"
        style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
      >
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-4">

          {/* Logo + MAINNET badge */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-purple)] opacity-20" />
              <div className="absolute inset-0.5 rounded-md bg-[var(--bg)] flex items-center justify-center">
                <Activity size={14} className="text-[var(--neon-cyan)]" />
              </div>
            </div>
            <span className="display font-bold text-lg text-[var(--ink)] tracking-tight">
              Arc<span className="text-[var(--neon-cyan)]">Omni</span>
            </span>
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold mono tracking-widest"
              style={{ background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.3)', color: 'var(--neon-green)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] pulse-dot" />
              MAINNET
            </span>
          </div>

          {/* Desktop nav tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: active ? 'var(--neon-cyan)' : 'var(--muted)' }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(0, 229, 255, 0.08)', border: '1px solid rgba(0, 229, 255, 0.2)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon size={14} />
                  <span className="relative">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Right: block + balance + connect */}
          <div className="flex items-center gap-3">
            {/* Live block */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs mono text-[var(--muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] pulse-dot" />
              <span>#{blockNum.toLocaleString()}</span>
            </div>

            {/* USDC balance */}
            {isConnected && balance !== null && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs font-medium text-[var(--ink-2)]">
                <span className="text-[var(--neon-cyan)]">◈</span>
                <span className="mono">{balance} USDC</span>
              </div>
            )}

            {/* ConnectKit */}
            <ConnectKitButton.Custom>
              {({ isConnected: ck_connected, show, address: ck_addr }) => (
                <button
                  onClick={show}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: ck_connected
                      ? 'rgba(0, 229, 255, 0.08)'
                      : 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                    border: `1px solid ${ck_connected ? 'rgba(0, 229, 255, 0.25)' : 'rgba(168, 85, 247, 0.35)'}`,
                    color: ck_connected ? 'var(--neon-cyan)' : 'var(--ink)',
                  }}
                >
                  {ck_connected ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] pulse-dot" />
                      <span className="mono">
                        {ck_addr ? `${ck_addr.slice(0, 6)}...${ck_addr.slice(-4)}` : ''}
                      </span>
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </button>
              )}
            </ConnectKitButton.Custom>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg glass"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen
                ? <X size={16} className="text-[var(--ink)]" />
                : <Menu size={16} className="text-[var(--ink)]" />
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-2 pb-1 flex flex-col gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { onTabChange(tab.id); setMobileOpen(false) }}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium"
                      style={{
                        background: active ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                        color: active ? 'var(--neon-cyan)' : 'var(--muted)',
                      }}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  )
                })}
                {/* Mobile balance */}
                {isConnected && balance !== null && (
                  <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[var(--ink-2)]">
                    <span className="text-[var(--neon-cyan)]">◈</span>
                    <span className="mono">{balance} USDC</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
