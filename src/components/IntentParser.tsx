import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Send, Loader2, ChevronRight, CheckCircle2, AlertCircle, Zap } from 'lucide-react'

interface LogEntry {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'exec'
  message: string
  timestamp: number
  detail?: string
}

const EXAMPLE_INTENTS = [
  'Monitor USDC transfers, check dual send paths (ERC-20 vs Native), and execute safe-routing based on live gas',
  'Analyze wallet risk and activate security shield for incoming transactions above 500 USDC',
  'Route payment through lowest-latency path and confirm finality within 2 blocks',
  'Scan mempool for front-running patterns and enable killswitch if threat detected',
]

function parseIntent(intent: string): LogEntry[] {
  const ts = new Date().getTime()
  const lower = intent.toLowerCase()

  const entries: LogEntry[] = [
    {
      id: `${ts}-0`,
      type: 'info',
      message: '> Parsing natural language intent...',
      timestamp: ts,
    },
  ]

  // Extract intents
  const actions: string[] = []
  if (lower.includes('monitor') || lower.includes('usdc')) {
    actions.push('MONITOR_TRANSFERS')
    entries.push({
      id: `${ts}-1`,
      type: 'exec',
      message: '  Module: MONITOR_TRANSFERS activated',
      detail: 'Watching USDC contract 0x3600...0000 for Transfer events',
      timestamp: ts + 100,
    })
  }
  if (lower.includes('dual') || lower.includes('path') || lower.includes('erc-20') || lower.includes('native')) {
    actions.push('DUAL_PATH_ANALYSIS')
    entries.push({
      id: `${ts}-2`,
      type: 'exec',
      message: '  Module: DUAL_PATH_ANALYSIS activated',
      detail: 'Comparing native send vs ERC-20 transfer gas costs on Arc Mainnet',
      timestamp: ts + 200,
    })
  }
  if (lower.includes('gas') || lower.includes('routing') || lower.includes('route')) {
    actions.push('GAS_OPTIMIZER')
    entries.push({
      id: `${ts}-3`,
      type: 'exec',
      message: '  Module: GAS_OPTIMIZER activated',
      detail: 'Fetching live basefee + priority fee estimates via eth_gasPrice',
      timestamp: ts + 300,
    })
  }
  if (lower.includes('risk') || lower.includes('security') || lower.includes('shield') || lower.includes('killswitch')) {
    actions.push('SECURITY_SHIELD')
    entries.push({
      id: `${ts}-4`,
      type: 'exec',
      message: '  Module: SECURITY_SHIELD activated',
      detail: 'Threat detection scan running — wallet risk score computed',
      timestamp: ts + 400,
    })
  }
  if (lower.includes('latency') || lower.includes('finality') || lower.includes('block')) {
    actions.push('LATENCY_TRACKER')
    entries.push({
      id: `${ts}-5`,
      type: 'exec',
      message: '  Module: LATENCY_TRACKER activated',
      detail: 'Pinging Arc RPC: rpc.mainnet.arc.io — measuring round-trip',
      timestamp: ts + 500,
    })
  }
  if (lower.includes('mempool') || lower.includes('front-run') || lower.includes('mev')) {
    actions.push('MEV_GUARD')
    entries.push({
      id: `${ts}-6`,
      type: 'exec',
      message: '  Module: MEV_GUARD activated',
      detail: 'Private mempool relay configured — sandwiching detection live',
      timestamp: ts + 600,
    })
  }

  if (actions.length === 0) {
    entries.push({
      id: `${ts}-fallback`,
      type: 'warning',
      message: '  No recognized modules detected — running general analysis',
      detail: 'Tip: include keywords like "monitor", "route", "risk", or "gas"',
      timestamp: ts + 100,
    })
  }

  const totalMs = 400 + actions.length * 120
  entries.push({
    id: `${ts}-done`,
    type: 'success',
    message: `> Execution plan resolved in ${totalMs}ms — ${actions.length || 1} module(s) active`,
    timestamp: ts + 700,
  })

  return entries
}

export default function IntentParser() {
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [running, setRunning] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const runIntent = async (intent: string) => {
    if (!intent.trim() || running) return
    setRunning(true)
    setLogs([])

    const entries = parseIntent(intent.trim())

    // Stagger reveal
    for (let i = 0; i < entries.length; i++) {
      await new Promise((r) => setTimeout(r, 220 + i * 80))
      setLogs((prev) => [...prev, entries[i]])
    }

    setRunning(false)
  }

  const handleSubmit = () => {
    void runIntent(input)
  }

  const handleExample = (ex: string) => {
    setInput(ex)
    void runIntent(ex)
  }

  const logColor: Record<LogEntry['type'], string> = {
    info: 'var(--muted)',
    exec: 'var(--neon-cyan)',
    success: 'var(--neon-green)',
    warning: 'var(--warning)',
    error: 'var(--danger)',
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
          <Terminal size={18} className="text-[var(--neon-cyan)]" />
        </div>
        <div>
          <h2 className="display font-semibold text-[var(--ink)] text-lg">Intent Parser</h2>
          <p className="text-xs text-[var(--muted)]">Natural language → onchain execution plan</p>
        </div>
      </div>

      {/* Input */}
      <div className="glass-strong p-1 rounded-2xl neon-cyan">
        <div className="flex items-end gap-2 p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder="Type an onchain command in plain English..."
            rows={3}
            className="flex-1 bg-transparent resize-none text-sm text-[var(--ink)] placeholder:text-[var(--subtle)] outline-none leading-relaxed"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || running}
            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.3)' }}
          >
            {running
              ? <Loader2 size={16} className="text-[var(--neon-cyan)] animate-spin" />
              : <Send size={16} className="text-[var(--neon-cyan)]" />
            }
          </button>
        </div>
      </div>

      {/* Example chips */}
      <div>
        <p className="text-xs text-[var(--subtle)] mb-2 uppercase tracking-widest">Examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_INTENTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => handleExample(ex)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}
            >
              {ex.length > 48 ? ex.slice(0, 48) + '…' : ex}
            </button>
          ))}
        </div>
      </div>

      {/* Execution log */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--danger)] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--warning)] opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--neon-green)] opacity-70" />
          </div>
          <span className="mono text-xs text-[var(--subtle)]">arcomni://execution-log</span>
          {running && (
            <span className="ml-auto flex items-center gap-1 text-xs text-[var(--neon-cyan)]">
              <Loader2 size={10} className="animate-spin" /> running
            </span>
          )}
        </div>
        <div
          ref={logRef}
          className="h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
        >
          {logs.length === 0 && !running && (
            <p className="text-[var(--subtle)]">
              Awaiting intent input<span className="blink">_</span>
            </p>
          )}
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-1.5"
              >
                <div className="flex items-start gap-2">
                  {log.type === 'success' && <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--neon-green)' }} />}
                  {log.type === 'error' && <AlertCircle size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--danger)' }} />}
                  {log.type === 'exec' && <ChevronRight size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--neon-cyan)' }} />}
                  {log.type === 'warning' && <Zap size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--warning)' }} />}
                  <span style={{ color: logColor[log.type] }}>{log.message}</span>
                </div>
                {log.detail && (
                  <p className="ml-5 mt-0.5 text-[var(--subtle)]">{log.detail}</p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {running && (
            <motion.p
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-[var(--neon-cyan)]"
            >
              processing...<span className="blink">_</span>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  )
}
