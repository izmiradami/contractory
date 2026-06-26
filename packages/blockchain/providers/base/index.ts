// Contractory — Base Adapter (Stub)
import type { BlockchainAdapter } from '../../core/interface'
export const baseAdapter: Partial<BlockchainAdapter> = {
  id: 'base', name: 'Base', chainId: 8453, testnet: false,
}
