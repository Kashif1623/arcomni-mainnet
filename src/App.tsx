import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Terminal, MessageSquare, ExternalLink } from 'lucide-react'
import Navbar from './components/Navbar'
import IntentParser from './components/IntentParser'
import DualPathTracker from './components/DualPathTracker'
import SecurityShield from './components/SecurityShield'
import AIAgentChat from './components/AIAgentChat'

type TabId = 'intent' | 'tracker' | 'shield' | 'agent'

// Floating orbs for background atmosphere
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div
        className="absolute rounded-full opacity-[0.06] blur-3xl"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--neon-cyan) 0%, transparent 70%)',
          top: '-200px',
          right: '-100px',
        }}
      />
      <div
        className="absolute rounded-full opacity-[0.05] blur-3xl"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--neon-purple) 0%, transparent 70%)',
          bottom: '-150px',
          left: '-100px',
        }}
      />
      <div
        className="absolute rounded-full opacity-[0.04] blur-2xl"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, var(--neon-green) 0%, transparent 70%)',
          bottom: '30%',
          right: '25%',
        }}
      />
    </div>
  )
}

// Dashboard stats bar
function StatsBar() {
  const [stats, setStats] = useState({
    tps: 312,
    blockHeight: 12_540_000,
    gasPrice: '20.4 Gwei',
    uptime: '99.97%',
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        tps: Math.max(80, Math.min(200, prev.tps + Math.round((Math.random() - 0.5) * 12))),
        blockHeight: prev.blockHeight + 1,
        gasPrice: `${(20 + Math.random() * 2).toFixed(1)} Gwei`,
        uptime: '99.97%',
      }))
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const items = [
    { label: 'TPS', value: stats.tps.toString(), color: 'var(--neon-cyan)' },
    { label: 'Block', value: `#${stats.blockHeight.toLocaleString()}`, color: 'var(--muted)' },
    { label: 'Gas Price', value: stats.gasPrice, color: 'var(--warning)' },
    { label: 'Uptime', value: stats.uptime, color: 'var(--neon-green)' },
  ]

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto py-2 px-4 rounded-2xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-3 flex-shrink-0">
          {i > 0 && <div className="w-px h-4" style={{ background: 'var(--border)' }} />}
          <div className="flex items-center gap-2 px-3">
            <span className="text-xs text-[var(--subtle)] uppercase tracking-wider">{item.label}</span>
            <span className="mono text-sm font-medium" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-1.5 pl-3 flex-shrink-0">
        <span className="text-xs text-[var(--subtle)]">Arc Mainnet</span>
        <a
          href="https://explorer.arc.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--subtle)] hover:text-[var(--neon-cyan)] transition-colors"
        >
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}

// Mobile tab bar
function MobileTabBar({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (t: TabId) => void }) {
  const tabs: { id: TabId; icon: React.ElementType; label: string }[] = [
    { id: 'intent', icon: Terminal, label: 'Intent' },
    { id: 'tracker', icon: Zap, label: 'Gas' },
    { id: 'shield', icon: Shield, label: 'Shield' },
    { id: 'agent', icon: MessageSquare, label: 'Agent' },
  ]

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
      style={{ background: 'rgba(8, 15, 30, 0.95)', backdropFilter: 'blur(20px)', borderColor: 'var(--border)' }}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors"
            style={{ color: active ? 'var(--neon-cyan)' : 'var(--subtle)' }}
          >
            <Icon size={18} />
            <span className="text-xs">{tab.label}</span>
            {active && (
              <motion.div
                layoutId="mobile-tab-indicator"
                className="absolute top-0 w-6 h-0.5 rounded-full"
                style={{ background: 'var(--neon-cyan)' }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

const PAGE_TRANSITION = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.22, ease: 'easeOut' },
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('intent')

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabId)
  }

  const tabContent: Record<TabId, React.ReactNode> = {
    intent: <IntentParser />,
    tracker: <DualPathTracker />,
    shield: <SecurityShield />,
    agent: <AIAgentChat />,
  }

  return (
    <div className="min-h-dvh bg-grid relative">
      <BackgroundOrbs />

      {/* Navbar */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main content */}
      <main className="relative z-10 pt-20 pb-20 md:pb-8 px-4">
        <div className="max-w-screen-xl mx-auto">

          {/* Hero header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs mono"
                    style={{ background: 'rgba(0,255,136,0.12)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.28)' }}
                  >
                    MAINNET
                  </span>
                  <span className="text-xs text-[var(--subtle)]">Arc Network Dashboard</span>
                </div>
                <h1 className="display font-bold text-3xl sm:text-4xl text-[var(--ink)] tracking-tight">
                  Arc<span className="text-[var(--neon-cyan)]">Omni</span>
                </h1>
                <p className="text-sm text-[var(--muted)] mt-1 text-pretty">
                  Autonomous onchain intelligence for the Arc network
                </p>
              </div>
              <div className="hidden sm:block">
                <StatsBar />
              </div>
            </div>
            {/* Mobile stats */}
            <div className="sm:hidden mt-3">
              <StatsBar />
            </div>
          </motion.div>

          {/* Desktop sidebar layout */}
          <div className="hidden md:flex gap-5">
            {/* Sidebar navigation */}
            <div className="w-56 flex-shrink-0">
              <div className="glass rounded-2xl p-2 sticky top-24">
                {[
                  { id: 'intent' as TabId, icon: Terminal, label: 'Intent Parser', desc: 'NL → execution' },
                  { id: 'tracker' as TabId, icon: Zap, label: 'Gas Tracker', desc: 'Dual-path routing' },
                  { id: 'shield' as TabId, icon: Shield, label: 'Security Shield', desc: 'Threat monitoring' },
                  { id: 'agent' as TabId, icon: MessageSquare, label: 'AI Agent', desc: 'Autonomous ops' },
                ].map((tab) => {
                  const Icon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all relative"
                      style={{
                        background: active ? 'rgba(0, 229, 255, 0.07)' : 'transparent',
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-pill"
                          className="absolute inset-0 rounded-xl"
                          style={{ background: 'rgba(0, 229, 255, 0.07)', border: '1px solid rgba(0, 229, 255, 0.18)' }}
                          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                      )}
                      <div
                        className="relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: active ? 'rgba(0,229,255,0.12)' : 'var(--surface)',
                        }}
                      >
                        <Icon
                          size={14}
                          style={{ color: active ? 'var(--neon-cyan)' : 'var(--subtle)' }}
                        />
                      </div>
                      <div className="relative">
                        <p
                          className="text-sm font-medium leading-none"
                          style={{ color: active ? 'var(--ink)' : 'var(--muted)' }}
                        >
                          {tab.label}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--subtle)' }}>{tab.desc}</p>
                      </div>
                    </button>
                  )
                })}

                {/* System status */}
                <div className="mt-3 pt-3 border-t border-[var(--border)] px-3">
                  <p className="text-xs text-[var(--subtle)] uppercase tracking-wider mb-2">System</p>
                  {[
                    { label: 'Shield', status: 'active', color: 'var(--neon-green)' },
                    { label: 'Gas Oracle', status: 'live', color: 'var(--neon-cyan)' },
                    { label: 'AI Agent', status: 'online', color: 'var(--neon-purple)' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between py-1">
                      <span className="text-xs text-[var(--muted)]">{s.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: s.color }} />
                        <span className="text-xs mono" style={{ color: s.color }}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main panel */}
            <div className="flex-1 min-w-0">
              <div className="glass rounded-2xl p-6 min-h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    {...PAGE_TRANSITION}
                  >
                    {tabContent[activeTab]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile single-panel */}
          <div className="md:hidden">
            <div className="glass rounded-2xl p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  {...PAGE_TRANSITION}
                >
                  {tabContent[activeTab]}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <MobileTabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  )
}
