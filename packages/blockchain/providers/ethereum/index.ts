// Contractory — Ethereum Adapter (Stub)
import type { BlockchainAdapter } from '../../core/interface'
export const ethereumAdapter: Partial<BlockchainAdapter> = {
  id: 'ethereum', name: 'Ethereum', chainId: 1, testnet: false,
}
