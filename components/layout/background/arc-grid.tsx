'use client'

import { useEffect, useRef } from 'react'
import { eventBus }           from '@/packages/event-bus'

export function ArcGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef  = useRef({ pulse: 0, ripples: [] as { x: number; y: number; r: number; alpha: number }[] })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId:   number
    let resizeId: ReturnType<typeof setTimeout>

    // ── Resize ──────────────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    const onResize = () => { clearTimeout(resizeId); resizeId = setTimeout(resize, 100) }
    window.addEventListener('resize', onResize)

    // ── Event Bus listeners ──────────────────────────────────
    const unsubPending = eventBus.on('tx.pending', () => {
      stateRef.current.pulse = 1 // slow pulse
    })
    const unsubFinal = eventBus.on('tx.final', ({ hash }) => {
      // Ripple from center on tx confirmed
      stateRef.current.ripples.push({
        x:     canvas.width  / 2,
        y:     canvas.height / 2,
        r:     0,
        alpha: 0.6,
      })
      stateRef.current.pulse = 0
      void hash
    })
    const unsubConnected = eventBus.on('wallet.connected', () => {
      stateRef.current.pulse = 0.3
    })

    // ── Draw loop ────────────────────────────────────────────
    let frame = 0
    const CELL = 36
    const BASE_ALPHA = 0.035

    const draw = () => {
      rafId = requestAnimationFrame(draw)
      frame++

      if (!canvas.width || !canvas.height) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const { pulse, ripples } = stateRef.current

      // Animated base opacity — slow breathe
      const breathe = BASE_ALPHA + Math.sin(frame * 0.004) * 0.008 * (1 + pulse)

      // ── Grid lines ──────────────────────────────────────
      ctx.strokeStyle = `hsla(243, 75%, 65%, ${breathe})`
      ctx.lineWidth   = 0.5

      // Vertical
      for (let x = CELL; x < canvas.width; x += CELL) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      // Horizontal
      for (let y = CELL; y < canvas.height; y += CELL) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // ── Intersection dots ───────────────────────────────
      ctx.fillStyle = `hsla(243, 75%, 70%, ${breathe * 1.8})`
      for (let x = CELL; x < canvas.width; x += CELL) {
        for (let y = CELL; y < canvas.height; y += CELL) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // ── Ripples (tx confirmed) ───────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i]
        rp.r     += 4
        rp.alpha -= 0.008
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue }

        ctx.strokeStyle = `hsla(243, 75%, 65%, ${rp.alpha})`
        ctx.lineWidth   = 1
        ctx.beginPath()
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2)
        ctx.stroke()
      }

      stateRef.current.ripples = ripples
    }

    draw()

    return () => {
      cancelAnimationFrame(rafId)
      clearTimeout(resizeId)
      window.removeEventListener('resize', onResize)
      unsubPending()
      unsubFinal()
      unsubConnected()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 will-change-transform"
      style={{ opacity: 1 }}
    />
  )
}
