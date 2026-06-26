// Contractory Design System — Typed Tokens
// Use in JS/TS contexts where Tailwind classes aren't available
// (Framer Motion, canvas, SVG, inline styles)

// ─── Color Strategy ────────────────────────────────────────────
// Indigo  → Brand, primary buttons, navigation active states
// Blue    → Links, interactive elements, info states, focus rings
// Green   → USDC ONLY: balances, payments, successful transactions
// Gray    → All neutral UI chrome (Linear/Vercel style)

export const colors = {
  // Indigo — brand
  accent: {
    primary:  'hsl(243, 75%, 65%)',
    hover:    'hsl(243, 75%, 58%)',
    subtle:   'hsl(243, 50%, 14%)',
    border:   'hsl(243, 60%, 30%)',
  },

  // Blue — interactive
  interactive: {
    default:  'hsl(211, 90%, 62%)',
    hover:    'hsl(211, 90%, 55%)',
    subtle:   'hsl(211, 70%, 13%)',
  },

  // Green — USDC / money ONLY
  usdc: {
    default:  'hsl(152, 68%, 48%)',
    hover:    'hsl(152, 68%, 40%)',
    subtle:   'hsl(152, 45%, 10%)',
    border:   'hsl(152, 50%, 22%)',
  },

  // Semantic
  status: {
    success: 'hsl(152, 68%, 48%)',  // = usdc green
    warning: 'hsl(38,  90%, 56%)',
    error:   'hsl(0,   80%, 58%)',
    info:    'hsl(211, 90%, 62%)',   // = interactive blue
  },
} as const

export const motion = {
  duration: {
    instant:  0,
    fast:     100,
    default:  180,
    smooth:   280,
    slow:     450,
  },
  ease: {
    default:  [0.16, 1, 0.3, 1] as const,
    in:       [0.4, 0, 1, 1]    as const,
    out:      [0, 0, 0.2, 1]    as const,
    spring:   [0.34, 1.56, 0.64, 1] as const,
  },
  // Framer Motion presets
  variants: {
    pageIn: {
      initial:    { opacity: 0, y: 6 },
      animate:    { opacity: 1, y: 0 },
      exit:       { opacity: 0, y: -6 },
      transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    },
    cardIn: {
      initial:    { opacity: 0, scale: 0.98 },
      animate:    { opacity: 1, scale: 1 },
      transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
    },
    paletteIn: {
      initial:    { opacity: 0, scale: 0.97, y: -4 },
      animate:    { opacity: 1, scale: 1,    y: 0 },
      exit:       { opacity: 0, scale: 0.97, y: -4 },
      transition: { duration: 0.14, ease: [0.16, 1, 0.3, 1] },
    },
    // Only for confirmed USDC transactions
    txConfirmed: {
      animate:    { scale: [1, 1.015, 1] },
      transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
    },
    staggerChildren: {
      animate: { transition: { staggerChildren: 0.04 } },
    },
    staggerItem: {
      initial:    { opacity: 0, y: 4 },
      animate:    { opacity: 1, y: 0 },
      transition: { duration: 0.18 },
    },
  },
} as const

export const typography = {
  fonts: {
    sans:    'var(--font-geist-sans, Inter, sans-serif)',
    mono:    'var(--font-geist-mono, JetBrains Mono, monospace)',
    display: 'var(--font-geist-sans, Inter, sans-serif)',
  },
} as const

export const layout = {
  sidebar:          240,
  sidebarCollapsed: 64,
  header:           56,
  contentMaxWidth:  1280,
} as const

// ─── Usage Guide (enforced via lint rules ideally) ─────────────
//
// ✅  accent.*     → Deploy button, active nav item, primary CTA,
//                    brand logo, keyboard shortcut highlights
//
// ✅  interactive.* → External links, secondary actions, hover
//                    states on neutral elements, info badges
//
// ✅  usdc.*       → USDC balance display, payment confirmations,
//                    successful tx notifications, gas cost display,
//                    bridge/swap amount inputs
//
// ❌  Never use usdc.* for generic "success" states unrelated
//    to money (e.g. "contract verified" should use status.success
//    sparingly or just a checkmark icon, not full green styling)
