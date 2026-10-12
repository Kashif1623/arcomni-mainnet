import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Zap, Shield, Activity, ChevronRight, Loader2 } from 'lucide-react'

interface ChatMessage {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: number
  type?: 'alert' | 'optimization' | 'tx' | 'info'
  badge?: string
}

interface QuickAction {
  label: string
  query: string
  icon: React.ElementType
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Check gas', query: 'What are the current gas costs on Arc?', icon: Zap },
  { label: 'Route analysis', query: 'Analyze the optimal routing path for my next USDC transfer', icon: Activity },
  { label: 'Security scan', query: 'Run a full security scan on my wallet', icon: Shield },
  { label: 'Tx history', query: 'Summarize recent transaction activity', icon: ChevronRight },
]

// Detect if input looks like Roman English (Urdu written in English letters)
// Heuristic: contains common Roman Urdu words or patterns
function detectRomanUrdu(text: string): boolean {
  const lower = text.toLowerCase()
  const romanUrduMarkers = [
    'karo', 'karo', 'kya', 'hai', 'hain', 'mera', 'meri', 'mujhe', 'aap', 'yeh',
    'woh', 'kaise', 'batao', 'bata', 'check', 'dekho', 'dekh', 'bhai', 'yaar',
    'nahi', 'nahin', 'theek', 'theek', 'achha', 'acha', 'kr', 'kr do', 'kardo',
    'mujhy', 'apna', 'apni', 'kitna', 'kitni', 'zyada', 'kam', 'abhi', 'ab',
    'pehle', 'baad', 'phir', 'toh', 'tou', 'lekin', 'aur', 'ya', 'se',
    'mein', 'par', 'pe', 'wala', 'wali', 'dalo', 'lagao', 'chalao', 'chal',
  ]
  return romanUrduMarkers.some((marker) => lower.includes(marker))
}

function buildResponse(input: string): { content: string; type: ChatMessage['type']; badge?: string } {
  const lower = input.toLowerCase()
  const isRomanUrdu = detectRomanUrdu(input)

  if (lower.includes('gas') || lower.includes('cost') || lower.includes('fee') || lower.includes('kitna')) {
    return {
      content: isRomanUrdu
        ? 'Arc Mainnet ka base fee abhi ~20 Gwei chal raha hai. Native send path: ~$0.000420 USDC (21k gas). ERC-20 transfer: ~$0.001300 USDC (65k gas). Meri recommendation hai native path use karo — abhi 3.1x sasta hai. Routing preference update kar diya hai.'
        : 'Arc Mainnet base fee is running at ~20 Gwei. Native send path: ~$0.000420 USDC (21k gas). ERC-20 transfer: ~$0.001300 USDC (65k gas). Recommend native path — 3.1x cheaper right now. Routing preference updated in execution queue.',
      type: 'optimization',
      badge: 'GAS_REPORT',
    }
  }
  if (lower.includes('route') || lower.includes('routing') || lower.includes('path') || lower.includes('rasta')) {
    return {
      content: isRomanUrdu
        ? 'Path analysis complete ho gaya. Arc Mainnet native RPC ne 41ms mein respond kiya. Native send: 41ms latency, 1 block finality (~2.8s). ERC-20 path: 58ms latency, same finality. OPTIMAL: Native path 17ms aur ~68% gas bachata hai. Safe routing lock aglay 3 transactions ke liye apply ho gaya.'
        : 'Path analysis complete. Arc Mainnet native RPC responded in 41ms. Native send: 41ms latency, 1 block finality (~2.8s). ERC-20 path: 58ms latency, same finality. OPTIMAL: Native path saves 17ms and ~68% on gas. Safe routing lock applied to next 3 transactions.',
      type: 'optimization',
      badge: 'ROUTE_LOCK',
    }
  }
  if (lower.includes('security') || lower.includes('scan') || lower.includes('threat') || lower.includes('risk') || lower.includes('khatra')) {
    return {
      content: isRomanUrdu
        ? 'Security scan shuru ho gaya. Wallet exposure score: 12/100 (safe hai). 1 medium alert mila: 0x4f2a pe drainer pattern detect hua. Approval scan: 2 active allowances unaudited contracts ko. Recommend karta hoon 0x7e91 ka allowance revoke karo. Shield status: ACTIVE. Koi killswitch ki zaroorat nahi abhi.'
        : 'Security scan initiated. Wallet exposure score: 12/100 (safe). Detected 1 medium alert: drainer pattern on destination 0x4f2a. Approval scan: 2 active allowances to unaudited contracts. Recommend revoking allowance to 0x7e91. Shield status: ACTIVE. No killswitch needed.',
      type: 'alert',
      badge: 'THREAT_SCAN',
    }
  }
  if (lower.includes('transaction') || lower.includes('tx') || lower.includes('history') || lower.includes('recent') || lower.includes('purani')) {
    return {
      content: isRomanUrdu
        ? 'Recent activity: Is session mein 0 confirmed transactions hain (wallet abhi Arc Mainnet pe active nahi). Background monitors chalu hain: USDC Transfer watcher, block-time tracker, gas price oracle. Sab normal hai. Jab tum transfer karo, ready hoon execute karne ke liye.'
        : 'Recent activity: 0 confirmed transactions this session (wallet not yet active on Arc Mainnet). Background monitors running: USDC Transfer watcher, block-time tracker, gas price oracle. All systems nominal. Ready to execute when you initiate a transfer.',
      type: 'tx',
      badge: 'TX_SUMMARY',
    }
  }
  if (lower.includes('usdc') || lower.includes('transfer') || lower.includes('send') || lower.includes('bhejo')) {
    return {
      content: isRomanUrdu
        ? 'Arc Mainnet pe USDC native gas token hai — ek hi asset, do views. ERC-20 view (6 decimals) transfers aur approvals ke liye; native view (18 decimals) gas deduction ke liye. Main recommend karta hoon explicit USDC transfers ke liye hamesha ERC-20 path use karo taake decimal mismatch na ho. Dual-path tracker Gas Tracker panel mein live hai.'
        : 'USDC on Arc Mainnet is the native gas token — one asset, two views. ERC-20 view (6 decimals) for transfers and approvals; native view (18 decimals) for gas. Always use the ERC-20 path for explicit USDC transfers to avoid decimal-scale mismatch. Dual-path tracker is live in the Gas Tracker panel.',
      type: 'info',
      badge: 'USDC_GUIDE',
    }
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('salam') || lower.includes('salaam') || lower.includes('assalam')) {
    return {
      content: isRomanUrdu
        ? 'Salam! Main ArcOmni autonomous agent hoon — continuously gas routing, threat detection, aur transaction safety optimize kar raha hoon Arc Mainnet pe. Batao kya karna hai?'
        : 'Hello. I\'m your ArcOmni autonomous agent — running continuous background optimizations across gas routing, threat detection, and transaction safety on Arc Mainnet. How can I help?',
      type: 'info',
    }
  }
  if (lower.includes('arc') || lower.includes('network') || lower.includes('chain') || lower.includes('network') || lower.includes('blockchain')) {
    return {
      content: isRomanUrdu
        ? 'Arc ek EVM-compatible mainnet hai jahan USDC native gas token hai. ETH ki zaroorat nahi — har transaction seedha USDC mein cost hoti hai. Block time: ~2.8s. Chain ID: 5042. Explorer: explorer.arc.io. Arc ka unique dual-path (native vs ERC-20) ko optimize karne ke liye ArcOmni banaya gaya hai.'
        : 'Arc is an EVM-compatible mainnet where USDC is the native gas token. No ETH needed — every transaction costs USDC directly. Block time: ~2.8s. Chain ID: 5042. Explorer: explorer.arc.io. ArcOmni is built to optimize Arc\'s unique dual-path architecture.',
      type: 'info',
      badge: 'ARC_INFO',
    }
  }
  if (lower.includes('kya') || lower.includes('batao') || lower.includes('bata') || lower.includes('help') || lower.includes('madad')) {
    return {
      content: isRomanUrdu
        ? 'Zaroor! Main in cheezon mein help kar sakta hoon: gas costs check karna, optimal routing path find karna, security scan karna, USDC transfers ke baare mein guide karna, aur Arc Mainnet ke baare mein koi bhi sawaal. Kya chahiye aapko?'
        : 'Sure! I can help with: checking gas costs, finding the optimal routing path, running security scans, guiding USDC transfers, and answering any questions about Arc Mainnet. What do you need?',
      type: 'info',
    }
  }

  return {
    content: isRomanUrdu
      ? 'Aapka intent process ho gaya. Arc Mainnet pe background analysis chal raha hai — gas prices, block times, aur security patterns monitor ho rahe hain. Agar koi action recommend hoga toh bataunga. Koi specific cheez hai jis pe focus karun?'
      : 'Intent processed. Running background analysis on Arc Mainnet — monitoring gas prices, block times, and security patterns. I\'ll notify you if any action is recommended. Anything specific you\'d like me to focus on?',
    type: 'info',
  }
}

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  GAS_REPORT:  { bg: 'rgba(79,195,247,0.1)',  color: 'var(--accent)' },
  ROUTE_LOCK:  { bg: 'rgba(0,255,136,0.1)',   color: 'var(--neon-green)' },
  THREAT_SCAN: { bg: 'rgba(255,77,109,0.1)',  color: 'var(--danger)' },
  TX_SUMMARY:  { bg: 'rgba(168,85,247,0.1)',  color: 'var(--neon-purple)' },
  USDC_GUIDE:  { bg: 'rgba(79,195,247,0.1)',  color: 'var(--accent)' },
  ARC_INFO:    { bg: 'rgba(0,229,255,0.1)',   color: 'var(--neon-cyan)' },
}

function AgentBubble({ msg }: { msg: ChatMessage }) {
  const typeIcon =
    msg.type === 'alert'        ? <Shield size={12} style={{ color: 'var(--danger)' }} />
    : msg.type === 'optimization' ? <Zap size={12} style={{ color: 'var(--neon-cyan)' }} />
    : msg.type === 'tx'           ? <Activity size={12} style={{ color: 'var(--neon-purple)' }} />
    : null

  const badgeStyle = msg.badge && BADGE_STYLE[msg.badge]
    ? BADGE_STYLE[msg.badge]
    : { bg: 'rgba(79,195,247,0.08)', color: 'var(--muted)' }

  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
        <Bot size={14} className="text-[var(--neon-cyan)]" />
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          {typeIcon}
          <span className="text-xs font-medium" style={{ color: 'var(--neon-cyan)' }}>ArcOmni Agent</span>
          {msg.badge && (
            <span className="px-1.5 py-0.5 rounded text-xs mono" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>
              {msg.badge}
            </span>
          )}
          <span className="ml-auto text-xs text-[var(--subtle)] mono">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div
          className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
          style={{
            background: msg.type === 'alert' ? 'rgba(255,77,109,0.06)' : 'rgba(0,229,255,0.05)',
            border: `1px solid ${msg.type === 'alert' ? 'rgba(255,77,109,0.15)' : 'rgba(0,229,255,0.12)'}`,
            color: 'var(--ink-2)',
          }}
        >
          {msg.content}
        </div>
      </div>
    </div>
  )
}

function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex items-start gap-3 justify-end">
      <div className="flex-1 max-w-[80%]">
        <div className="flex items-center justify-end mb-1">
          <span className="text-xs text-[var(--subtle)] mono">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed ml-auto"
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.18)', color: 'var(--ink)' }}
        >
          {msg.content}
        </div>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
        <User size={14} style={{ color: 'var(--neon-purple)' }} />
      </div>
    </div>
  )
}

const NOW = new Date().getTime()

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'init-1',
    role: 'agent',
    content: 'ArcOmni agent online. Monitoring Arc Mainnet (Chain ID 5042) — gas prices nominal, shield active, dual-path tracker running. How can I assist you?',
    timestamp: NOW - 5000,
    type: 'info',
  },
  {
    id: 'init-2',
    role: 'agent',
    content: 'Background optimization: Native send path is currently 3.1x cheaper than ERC-20 on Arc Mainnet. Routing preference updated. You can also ask me in Roman English (Urdu) — main samajh sakta hoon.',
    timestamp: NOW - 2000,
    type: 'optimization',
    badge: 'ROUTE_LOCK',
  },
]

let _msgCounter = 100
function nextId(prefix: string): string { _msgCounter += 1; return `${prefix}-${_msgCounter}` }
function nowMs(): number { return new Date().getTime() }

export default function AIAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, thinking])

  // Proactive agent message every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      const ts = nowMs()
      const proactiveType: ChatMessage['type'] = Math.random() > 0.5 ? 'optimization' : 'alert'
      const proactiveBadge = Math.random() > 0.5 ? 'GAS_REPORT' : 'THREAT_SCAN'
      const proactive: ChatMessage = {
        id: nextId('pro'),
        role: 'agent',
        content: Math.random() > 0.5
          ? 'Background scan: Gas price stable at ~20 Gwei on Arc Mainnet. Native path remains optimal. No action required.'
          : 'Security monitor: No new threats detected. Wallet exposure score unchanged at 12/100. Shield holding on Arc Mainnet.',
        timestamp: ts,
        type: proactiveType,
        badge: proactiveBadge,
      }
      setMessages((prev) => [...prev, proactive].slice(-40))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const sendMessage = async (text: string) => {
    if (!text.trim() || thinking) return
    const userMsg: ChatMessage = { id: nextId('u'), role: 'user', content: text.trim(), timestamp: nowMs() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setThinking(true)
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 800))
    const response = buildResponse(text)
    const agentMsg: ChatMessage = { id: nextId('a'), role: 'agent', content: response.content, timestamp: nowMs(), type: response.type, badge: response.badge }
    setMessages((prev) => [...prev, agentMsg])
    setThinking(false)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Bot size={18} style={{ color: 'var(--neon-purple)' }} />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 pulse-dot" style={{ background: 'var(--neon-green)', borderColor: 'var(--bg)' }} />
        </div>
        <div>
          <h2 className="display font-semibold text-[var(--ink)] text-lg">AI Agent</h2>
          <p className="text-xs text-[var(--muted)]">Autonomous Arc Mainnet optimizer — always running</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)', color: 'var(--neon-green)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-green)] pulse-dot" />
          Online
        </div>
      </div>

      {/* Chat area */}
      <div className="glass-strong rounded-2xl overflow-hidden flex flex-col" style={{ height: '460px' }}>
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {msg.role === 'agent' ? <AgentBubble msg={msg} /> : <UserBubble msg={msg} />}
              </motion.div>
            ))}
          </AnimatePresence>
          {thinking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)' }}>
                <Bot size={14} className="text-[var(--neon-cyan)]" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}>
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin text-[var(--neon-cyan)]" />
                  <span className="text-xs text-[var(--muted)]">Processing intent...</span>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick actions */}
        <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-[var(--border)]">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon
            return (
              <button key={a.label} onClick={() => { void sendMessage(a.query) }} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                <Icon size={11} />
                {a.label}
              </button>
            )
          })}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-[var(--border)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void sendMessage(input) } }}
            placeholder="Ask in English or Roman English (Urdu)..."
            className="flex-1 bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--subtle)] outline-none"
          />
          <button
            onClick={() => { void sendMessage(input) }}
            disabled={!input.trim() || thinking}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            {thinking
              ? <Loader2 size={14} style={{ color: 'var(--neon-purple)' }} className="animate-spin" />
              : <Send size={14} style={{ color: 'var(--neon-purple)' }} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
