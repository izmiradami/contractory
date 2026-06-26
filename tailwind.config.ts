import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './packages/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary:   'hsl(var(--bg-primary))',
          secondary: 'hsl(var(--bg-secondary))',
          tertiary:  'hsl(var(--bg-tertiary))',
          elevated:  'hsl(var(--bg-elevated))',
        },
        border: {
          subtle:  'hsl(var(--border-subtle))',
          default: 'hsl(var(--border-default))',
          strong:  'hsl(var(--border-strong))',
        },
        text: {
          primary:   'hsl(var(--text-primary))',
          secondary: 'hsl(var(--text-secondary))',
          tertiary:  'hsl(var(--text-tertiary))',
          disabled:  'hsl(var(--text-disabled))',
        },

        // ── INDIGO — Brand / primary actions ──
        accent: {
          DEFAULT:  'hsl(var(--accent-primary))',
          hover:    'hsl(var(--accent-hover))',
          subtle:   'hsl(var(--accent-subtle))',
          border:   'hsl(var(--accent-border))',
        },

        // ── BLUE — Interactive elements / links ──
        interactive: {
          DEFAULT:  'hsl(var(--interactive))',
          hover:    'hsl(var(--interactive-hover))',
          subtle:   'hsl(var(--interactive-subtle))',
        },

        // ── GREEN — USDC / money / payments / success ONLY ──
        usdc: {
          DEFAULT:  'hsl(var(--usdc))',
          hover:    'hsl(var(--usdc-hover))',
          subtle:   'hsl(var(--usdc-subtle))',
          border:   'hsl(var(--usdc-border))',
        },

        // Semantic status
        status: {
          success: 'hsl(var(--status-success))',
          warning: 'hsl(var(--status-warning))',
          error:   'hsl(var(--status-error))',
          info:    'hsl(var(--status-info))',
        },

        // Raw indigo palette (for special use cases)
        indigo: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },

      fontFamily: {
        sans:    ['var(--font-geist-sans)', 'Inter', ...fontFamily.sans],
        mono:    ['var(--font-geist-mono)', 'JetBrains Mono', ...fontFamily.mono],
        display: ['var(--font-geist-sans)', ...fontFamily.sans],
      },

      fontSize: {
        '2xs': ['0.625rem',  { lineHeight: '1rem' }],
        xs:    ['0.75rem',   { lineHeight: '1rem',    letterSpacing: '0.01em' }],
        sm:    ['0.8125rem', { lineHeight: '1.25rem' }],
        base:  ['0.875rem',  { lineHeight: '1.5rem' }],
        md:    ['1rem',      { lineHeight: '1.5rem',  letterSpacing: '-0.01em' }],
        lg:    ['1.125rem',  { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        xl:    ['1.25rem',   { lineHeight: '1.75rem', letterSpacing: '-0.02em' }],
        '2xl': ['1.5rem',    { lineHeight: '2rem',    letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem',  { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem',   { lineHeight: '2.5rem',  letterSpacing: '-0.03em' }],
      },

      spacing: {
        '4.5':             '1.125rem',
        '13':              '3.25rem',
        '15':              '3.75rem',
        '18':              '4.5rem',
        sidebar:           '240px',
        'sidebar-sm':      '64px',
        header:            '56px',
      },

      borderRadius: {
        sm:   '4px',
        DEFAULT: '6px',
        md:   '8px',
        lg:   '10px',
        xl:   '12px',
        '2xl': '16px',
        card: '10px',
      },

      boxShadow: {
        // Subtle depth — dark mode optimized
        card:       '0 1px 2px 0 rgb(0 0 0 / 0.5), 0 0 0 1px hsl(var(--border-subtle))',
        'card-hover':'0 4px 16px 0 rgb(0 0 0 / 0.4), 0 0 0 1px hsl(var(--border-default))',
        // Indigo glow for focused / active states
        'glow-accent': '0 0 0 3px hsl(var(--accent-primary) / 0.25)',
        // USDC green glow for successful money operations
        'glow-usdc':   '0 0 0 3px hsl(var(--usdc) / 0.25)',
        inner:  'inset 0 1px 2px 0 rgb(0 0 0 / 0.4)',
      },

      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        // Used only for confirmed USDC / money operations
        'tx-confirmed': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.015)' },
        },
        // Indigo grid background pulse
        'grid-pulse': {
          '0%, 100%': { opacity: 'var(--grid-opacity)' },
          '50%':      { opacity: 'calc(var(--grid-opacity) * 2)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      animation: {
        'fade-in':       'fade-in 0.18s ease-out',
        'fade-in-up':    'fade-in-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in':      'scale-in 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right':'slide-in-right 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'tx-confirmed':  'tx-confirmed 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'grid-pulse':    'grid-pulse 5s ease-in-out infinite',
        shimmer:         'shimmer 2s linear infinite',
      },

      transitionTimingFunction: {
        spring:     'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}

export default config
