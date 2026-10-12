/**
 * wagmi configuration — Arc Mainnet (Chain ID 5042)
 * Built with Arc Studio — https://studio.arc.io
 *
 * Arc Mainnet: USDC is the native gas token.
 *   Native view  — 18 decimals (used for gas / msg.value)
 *   ERC-20 view  — 6 decimals  (0x3600000000000000000000000000000000000000)
 */

import { http, createConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { defineChain } from 'viem'
import { injected } from 'wagmi/connectors'
import { registerChain } from './tracing'

export const arcMainnet = defineChain({
  id: 5042,
  name: 'Arc',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.mainnet.arc.io'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' },
  },
})

// Pre-register chain RPC URLs so trace events show correct chain names immediately
registerChain(arcMainnet.id, arcMainnet.rpcUrls.default.http[0])

export const ARC_MAINNET_ID = 5042
export const ARC_MAINNET_RPC = 'https://rpc.mainnet.arc.io'
export const ARC_MAINNET_EXPLORER = 'https://explorer.arc.io'
/** USDC ERC-20 on Arc Mainnet — 6 decimals */
export const ARC_USDC_ADDRESS = '0x3600000000000000000000000000000000000000' as const

export const config = createConfig({
  chains: [arcMainnet, mainnet], // mainnet kept for ENS resolution only
  connectors: [injected()],
  transports: {
    [arcMainnet.id]: http(ARC_MAINNET_RPC),
    [mainnet.id]: http(),
  },
})
