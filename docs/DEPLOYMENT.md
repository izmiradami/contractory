# Deployment Guide

## Prerequisites

- Node.js 20+
- Supabase project (free tier works)
- Vercel account (or any Node.js host)
- WalletConnect project ID

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase dashboard → API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard → API
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — from cloud.walletconnect.com

## Database Setup

1. Open Supabase SQL Editor
2. Paste contents of `supabase/migrations/001_initial_schema.sql`
3. Click Run

This creates: `users`, `contracts`, `agents`, `transactions`, `automations` tables with RLS.

## Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
vercel env add NEXT_PUBLIC_APP_URL  # your Vercel URL

# Deploy production
vercel --prod
```

## Local Development

```bash
npm install
npm run dev    # http://localhost:3000
```

## Production Build Check

```bash
npm run type-check   # TypeScript
npm run lint         # ESLint
npm run test         # Vitest
npm run build        # Next.js build
```

All must pass before deployment.

## Arc Testnet Configuration

The app connects to Arc Testnet by default:
- Chain ID: 72
- RPC: `https://rpc.testnet.arc.network`
- Explorer: `https://testnet.arcscan.app`

To use a custom RPC, set `NEXT_PUBLIC_ARC_RPC_URL` in `.env.local`.
