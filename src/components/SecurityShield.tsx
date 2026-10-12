import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle2, XCircle, Eye, Zap, Lock, Unlock, Activity } from 'lucide-react'
import { useAccount } from 'wagmi'

interface ThreatLog {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: number
  resolved: boolean
}

interface RiskMetric {
  label: string
  score: number // 0-100
  status: 'safe' | 'warning' | 'danger'
}

const SEVERITY_COLOR = {
  low: 'var(--muted)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: '#ff0055',
}

const SEVERITY_BG = {
  low: 'rgba(139, 163, 190, 0.08)',
  medium: 'rgba(255, 184, 77, 0.08)',
  high: 'rgba(255, 77, 109, 0.08)',
  critical: 'rgba(255, 0, 85, 0.12)',
}

const SAMPLE_THREATS: ThreatLog[] = [
  { id: 't1', severity: 'low', message: 'Unusual transfer volume detected — within acceptable range', timestamp: Date.now() - 45000, resolved: true },
  { id: 't2', severity: 'medium', message: 'Known drainer pattern flagged on destination 0x4f2a...', timestamp: Date.now() - 20000, resolved: false },
  { id: 't3', severity: 'low', message: 'ERC-20 approval to unaudited contract — review recommended', timestamp: Date.now() - 8000, resolved: false },
]

function ScoreBar({ score, status }: { score: number; status: RiskMetric['status'] }) {
  const color = status === 'safe' ? 'var(--neon-green)' : status === 'warning' ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-muted)' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  )
}

function ShieldOrb({ active, panic }: { active: boolean; panic: boolean }) {
  return (
    <div className="relative w-24 h-24 mx-auto">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: panic
            ? ['0 0 0 0px rgba(255,0,85,0.4)', '0 0 0 16px rgba(255,0,85,0)']
            : active
            ? ['0 0 0 0px rgba(0,255,136,0.35)', '0 0 0 16px rgba(0,255,136,0)']
            : ['0 0 0 0px rgba(100,120,150,0.15)', '0 0 0 8px rgba(100,120,150,0)'],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        style={{
          border: `2px solid ${panic ? 'rgba(255,0,85,0.5)' : active ? 'rgba(0,255,136,0.4)' : 'rgba(100,150,200,0.2)'}`,
        }}
      />
      {/* Inner glow */}
      <div
        className="absolute inset-3 rounded-full flex items-center justify-center"
        style={{
          background: panic
            ? 'radial-gradient(circle, rgba(255,0,85,0.2) 0%, rgba(255,0,85,0.05) 100%)'
            : active
            ? 'radial-gradient(circle, rgba(0,255,136,0.18) 0%, rgba(0,229,255,0.06) 100%)'
            : 'radial-gradient(circle, rgba(50,80,120,0.3) 0%, rgba(10,25,50,0.2) 100%)',
          border: `1px solid ${panic ? 'rgba(255,0,85,0.3)' : active ? 'rgba(0,255,136,0.25)' : 'rgba(100,150,200,0.15)'}`,
        }}
      >
        <Shield
          size={32}
          style={{ color: panic ? '#ff0055' : active ? 'var(--neon-green)' : 'var(--muted)' }}
        />
      </div>
    </div>
  )
}

export default function SecurityShield() {
  const { address, isConnected } = useAccount()
  const [shieldActive, setShieldActive] = useState(true)
  const [panicMode, setPanicMode] = useState(false)
  const [threats, setThreats] = useState<ThreatLog[]>(SAMPLE_THREATS)
  const [metrics, setMetrics] = useState<RiskMetric[]>([
    { label: 'Wallet Exposure', score: 12, status: 'safe' },
    { label: 'Contract Risk', score: 38, status: 'warning' },
    { label: 'Approval Surface', score: 21, status: 'safe' },
    { label: 'MEV Vulnerability', score: 8, status: 'safe' },
  ])

  // Simulate live metric jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) =>
        prev.map((m) => {
          const jitter = (Math.random() - 0.5) * 6
          const next = Math.max(0, Math.min(100, m.score + jitter))
          const status: RiskMetric['status'] =
            next > 65 ? 'danger' : next > 35 ? 'warning' : 'safe'
          return { ...m, score: Math.round(next), status }
        }),
      )
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  // Simulate new threat occasionally
  useEffect(() => {
    const timeout = setTimeout(() => {
      const ts = new Date().getTime()
      const newSeverity: ThreatLog['severity'] = Math.random() > 0.7 ? 'medium' : 'low'
      setThreats((prev) => [
        {
          id: `live-${ts}`,
          severity: newSeverity,
          message: Math.random() > 0.5
            ? 'New allowance detected — contract not in whitelist'
            : 'Suspicious RPC response timing on Arc Mainnet',
          timestamp: ts,
          resolved: false,
        },
        ...prev,
      ].slice(0, 8))
    }, 12000)
    return () => clearTimeout(timeout)
  }, [threats])

  const handlePanic = () => {
    if (!panicMode) {
      const ts = new Date().getTime()
      setPanicMode(true)
      setShieldActive(true)
      setThreats((prev) => [
        {
          id: `panic-${ts}`,
          severity: 'critical' as const,
          message: 'KILLSWITCH ACTIVATED — all pending transactions halted',
          timestamp: ts,
          resolved: false,
        },
        ...prev,
      ])
      setTimeout(() => setPanicMode(false), 5000)
    }
  }

  const resolveAlert = (id: string) => {
    setThreats((prev) => prev.map((t) => (t.id === id ? { ...t, resolved: true } : t)))
  }

  const overallScore = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length)
  const overallStatus: RiskMetric['status'] =
    overallScore > 60 ? 'danger' : overallScore > 35 ? 'warning' : 'safe'

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)' }}
        >
          <Shield size={18} style={{ color: 'var(--neon-green)' }} />
        </div>
        <div>
          <h2 className="display font-semibold text-[var(--ink)] text-lg">Security Shield</h2>
          <p className="text-xs text-[var(--muted)]">Autonomous wallet risk monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Shield status */}
        <div className="glass-strong rounded-2xl p-5">
          <ShieldOrb active={shieldActive} panic={panicMode} />

          <div className="mt-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={panicMode ? 'panic' : shieldActive ? 'active' : 'inactive'}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <p
                  className="display font-bold text-lg"
                  style={{ color: panicMode ? '#ff0055' : shieldActive ? 'var(--neon-green)' : 'var(--muted)' }}
                >
                  {panicMode ? 'KILLSWITCH ACTIVE' : shieldActive ? 'Shield Active' : 'Shield Inactive'}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {panicMode
                    ? 'Emergency halt — all tx paused'
                    : shieldActive
                    ? `Risk score: ${overallScore}/100 — ${overallStatus === 'safe' ? 'All clear' : 'Monitoring elevated'}`
                    : 'Monitoring paused'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => setShieldActive(!shieldActive)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: shieldActive ? 'rgba(0,255,136,0.1)' : 'var(--surface)',
                border: `1px solid ${shieldActive ? 'rgba(0,255,136,0.3)' : 'var(--border)'}`,
                color: shieldActive ? 'var(--neon-green)' : 'var(--muted)',
              }}
            >
              {shieldActive ? <Lock size={14} /> : <Unlock size={14} />}
              {shieldActive ? 'Active' : 'Inactive'}
            </button>
            <button
              onClick={handlePanic}
              disabled={panicMode}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-60"
              style={{
                background: panicMode ? 'rgba(255,0,85,0.18)' : 'rgba(255,77,109,0.08)',
                border: `1px solid ${panicMode ? 'rgba(255,0,85,0.5)' : 'rgba(255,77,109,0.3)'}`,
                color: panicMode ? '#ff0055' : 'var(--danger)',
              }}
            >
              <Zap size={14} />
              Killswitch
            </button>
          </div>

          {/* Wallet context */}
          {isConnected && address && (
            <div className="mt-4 px-3 py-2 rounded-lg text-xs mono text-[var(--muted)]" style={{ background: 'var(--surface-muted)' }}>
              <span className="text-[var(--subtle)]">Monitoring: </span>
              {address.slice(0, 10)}...{address.slice(-6)}
            </div>
          )}
          {!isConnected && (
            <div className="mt-4 px-3 py-2 rounded-lg text-xs text-[var(--subtle)] text-center" style={{ background: 'var(--surface-muted)' }}>
              Connect wallet to enable live monitoring
            </div>
          )}
        </div>

        {/* Right: metrics + threat log */}
        <div className="flex flex-col gap-4">
          {/* Risk metrics */}
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-[var(--muted)]" />
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Risk Metrics</p>
            </div>
            <div className="flex flex-col gap-3">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--ink-2)]">{m.label}</span>
                    <span
                      className="text-xs mono font-medium"
                      style={{
                        color:
                          m.status === 'safe'
                            ? 'var(--neon-green)'
                            : m.status === 'warning'
                            ? 'var(--warning)'
                            : 'var(--danger)',
                      }}
                    >
                      {m.score}
                    </span>
                  </div>
                  <ScoreBar score={m.score} status={m.status} />
                </div>
              ))}
            </div>
          </div>

          {/* Threat log */}
          <div className="glass rounded-2xl p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Eye size={14} className="text-[var(--muted)]" />
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Threat Log</p>
              <span className="ml-auto text-xs mono text-[var(--subtle)]">
                {threats.filter((t) => !t.resolved).length} active
              </span>
            </div>
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
              <AnimatePresence>
                {threats.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: t.resolved ? 0.4 : 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg"
                    style={{ background: SEVERITY_BG[t.severity] }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {t.resolved ? (
                        <CheckCircle2 size={12} style={{ color: 'var(--neon-green)' }} />
                      ) : t.severity === 'critical' || t.severity === 'high' ? (
                        <XCircle size={12} style={{ color: SEVERITY_COLOR[t.severity] }} />
                      ) : (
                        <AlertTriangle size={12} style={{ color: SEVERITY_COLOR[t.severity] }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: SEVERITY_COLOR[t.severity] }}>
                        [{t.severity.toUpperCase()}]
                      </p>
                      <p className="text-xs text-[var(--ink-2)] leading-relaxed">{t.message}</p>
                      <p className="text-xs text-[var(--subtle)] mt-0.5 mono">
                        {new Date(t.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {!t.resolved && (
                      <button
                        onClick={() => resolveAlert(t.id)}
                        className="flex-shrink-0 text-xs px-2 py-0.5 rounded transition-colors"
                        style={{ background: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)' }}
                      >
                        Resolve
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
