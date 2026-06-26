'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAccount, useSignMessage }        from 'wagmi'
import { SiweMessage }                       from 'siwe'
import { eventBus }                          from '@/packages/event-bus'
import { createLogger }                      from '@/packages/logger'

const logger = createLogger('use-siwe')

type AuthState = 'unauthenticated' | 'signing' | 'verifying' | 'authenticated' | 'error'

interface SiweAuthState {
  state:        AuthState
  address:      string | null
  chainId:      number | null
  error:        string | null
  signIn:       () => Promise<void>
  signOut:      () => Promise<void>
}

export function useSiweAuth(): SiweAuthState {
  const { address, chainId } = useAccount()
  const { signMessageAsync }  = useSignMessage()

  const [state,   setState]   = useState<AuthState>('unauthenticated')
  const [authAddr, setAuthAddr] = useState<string | null>(null)
  const [authChain, setAuthChain] = useState<number | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  // Restore session from cookie on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          if (data.address) {
            setAuthAddr(data.address)
            setAuthChain(data.chainId)
            setState('authenticated')
          }
        }
      } catch { /* no session */ }
    }
    restore()
  }, [])

  const signIn = useCallback(async () => {
    if (!address || !chainId) return
    setError(null)

    try {
      setState('signing')

      // 1. Get nonce
      const nonceRes = await fetch('/api/auth/siwe')
      const { nonce } = await nonceRes.json() as { nonce: string }

      // 2. Build SIWE message
      const message = new SiweMessage({
        domain:    window.location.host,
        address,
        statement: 'Sign in to Contractory — The Developer OS for Arc.',
        uri:       window.location.origin,
        version:   '1',
        chainId,
        nonce,
        issuedAt:  new Date().toISOString(),
        expirationTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min
      })

      // 3. Sign
      const signature = await signMessageAsync({ message: message.prepareMessage() })

      setState('verifying')

      // 4. Verify on server
      const verifyRes = await fetch('/api/auth/siwe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: message.prepareMessage(), signature }),
      })

      if (!verifyRes.ok) {
        const { error: errMsg } = await verifyRes.json() as { error: string }
        throw new Error(errMsg)
      }

      setAuthAddr(address)
      setAuthChain(chainId)
      setState('authenticated')

      eventBus.emit('wallet.connected', { address, chainId })
      logger.audit('Signed in', { address, chainId })

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      // User rejected = not an error
      if (message.includes('rejected') || message.includes('denied')) {
        setState('unauthenticated')
      } else {
        setError(message)
        setState('error')
      }
      logger.warn('Sign-in failed', { error: message })
    }
  }, [address, chainId, signMessageAsync])

  const signOut = useCallback(async () => {
    await fetch('/api/auth/siwe', { method: 'DELETE' })
    setAuthAddr(null)
    setAuthChain(null)
    setState('unauthenticated')
    eventBus.emit('wallet.disconnected', {})
  }, [])

  return { state, address: authAddr, chainId: authChain, error, signIn, signOut }
}
