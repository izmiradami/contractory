'use client'

import { useEffect } from 'react'
import { toast }     from 'sonner'
import { eventBus }  from '@/packages/event-bus'

/**
 * Hook that listens to platform events and shows toast notifications.
 * Mount once inside the platform layout.
 */
export function useNotifications() {
  useEffect(() => {
    const unsubs = [
      eventBus.on('tx.pending', ({ hash }) => {
        toast.loading('Transaction pending…', {
          id:          hash,
          description: `${hash.slice(0, 10)}...`,
        })
      }),

      eventBus.on('tx.final', ({ hash, success }) => {
        if (success) {
          toast.success('Transaction confirmed', {
            id:          hash,
            description: `${hash.slice(0, 10)}... finalized on Arc`,
          })
        } else {
          toast.error('Transaction failed', {
            id:          hash,
            description: `${hash.slice(0, 10)}...`,
          })
        }
      }),

      eventBus.on('tx.failed', ({ hash, reason }) => {
        toast.error('Transaction failed', {
          id:          hash,
          description: reason,
        })
      }),

      eventBus.on('contract.deployed', ({ name, address }) => {
        toast.success(`${name} deployed`, {
          description: `${address.slice(0, 10)}... on Arc`,
        })
      }),

      eventBus.on('bridge.completed', ({ amount }) => {
        toast.success('Bridge complete', {
          description: `${amount} USDC transferred`,
        })
      }),

      eventBus.on('bridge.failed', ({ reason }) => {
        toast.error('Bridge failed', { description: reason })
      }),

      eventBus.on('agent.registered', ({ name }) => {
        toast.success(`Agent "${name}" registered`, {
          description: 'ERC-8004 identity created on Arc',
        })
      }),

      eventBus.on('job.completed', ({ jobId }) => {
        toast.success('Job completed', {
          description: `Job ${jobId.slice(0, 8)}... settled`,
        })
      }),

      eventBus.on('wallet.connected', ({ address }) => {
        toast.success('Wallet connected', {
          description: `${address.slice(0, 6)}...${address.slice(-4)}`,
        })
      }),
    ]

    return () => unsubs.forEach((fn) => fn())
  }, [])
}
