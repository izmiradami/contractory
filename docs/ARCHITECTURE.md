# Contractory — Architecture

## Overview

Contractory is a Next.js 15 application with a plugin-based architecture. Every major feature is implemented as a self-contained module that communicates via a shared EventBus.

## Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15, React 19 | App Router, Server Components |
| Blockchain | wagmi 2, viem, RainbowKit | Wallet connection, tx |
| Compiler | solc-js 0.8.35 | Solidity compilation on server |
| Auth | SIWE | Wallet-based session auth |
| Database | Supabase PostgreSQL + RLS | Contract persistence |
| Styling | Tailwind CSS, shadcn/ui | Design system |
| Editor | Monaco Editor | Contract IDE |
| Testing | Vitest, Playwright | Unit, integration, E2E |

## Directory Structure

```
contractory/
├── app/                     # Next.js App Router
│   ├── api/                 # Server API routes
│   │   ├── compile/         # POST: solc compilation
│   │   └── auth/siwe/       # SIWE auth (GET nonce, POST verify, DELETE)
│   └── platform/            # Protected platform pages
│       ├── page.tsx          # Developer Workspace
│       ├── studio/           # Contract Studio (Monaco IDE)
│       ├── contracts/        # Contract Control Center
│       ├── money/            # Payments Hub
│       └── agents/           # AI Agent Studio
│
├── components/              # React components
│   ├── contracts/            # Control Center components
│   │   ├── health-ring       # Score visualization
│   │   ├── health-breakdown  # 6-axis health card
│   │   ├── function-studio   # ABI explorer + code gen
│   │   └── ai-summary        # Executive summary + one-click fix
│   ├── studio/               # Contract Studio panels
│   │   ├── compatibility-panel  # Arc compatibility score
│   │   ├── gas-panel            # USDC gas estimate
│   │   └── security-panel       # Static security analysis
│   ├── agents/               # AI Agent components
│   ├── layout/               # Shell, sidebar, header, command palette
│   └── shared/               # Error boundary, skeleton, empty state
│
├── hooks/                   # Custom React hooks
│   ├── blockchain/
│   │   ├── use-arc-balance  # Real ERC-20 USDC balance
│   │   ├── use-arc-network  # Network health polling
│   │   └── use-siwe-auth    # SIWE sign-in flow
│   └── features/
│       ├── use-deploy              # Full deploy pipeline (8 steps)
│       ├── use-compatibility-analyzer  # Debounced Arc analysis
│       ├── use-gas-estimator       # Live USDC gas estimate
│       └── use-contract-events     # viem getLogs polling
│
├── packages/                # Internal packages
│   ├── blockchain/          # Chain adapters (Arc, ETH, Base, Polygon)
│   ├── ai/                  # Claude/OpenAI/Gemini abstraction
│   ├── event-bus/           # Typed cross-component events
│   ├── plugins/             # Plugin registry + 45 built-in commands
│   ├── logger/              # Structured logging
│   └── telemetry/           # Anonymous usage telemetry (opt-in)
│
├── lib/                     # Utilities
│   ├── store/contract-store  # Supabase persistence
│   ├── utils/               # truncateAddress, formatTimeAgo, retry
│   └── wagmi/config.ts      # Arc Testnet chain definition
│
├── supabase/
│   └── migrations/001_initial_schema.sql  # Full DB schema with RLS
│
└── tests/
    ├── unit/                # Vitest unit tests
    ├── integration/         # Vitest integration tests
    └── e2e/                 # Playwright E2E tests
```

## Deploy Pipeline

```
User clicks "Deploy to Arc Testnet"
        │
        ▼
1. POST /api/compile
   solc 0.8.35 → ABI + bytecode
        │
        ▼
2. analyzeArcCompatibility()
   Error if PREVRANDAO/SELFDESTRUCT/decimal mismatch
        │
        ▼
3. publicClient.estimateGas() + getGasPrice()
   → USDC display ($0.01)
        │
        ▼
4. walletClient.deployContract()
   → Arc Testnet TX
        │
        ▼
5. waitForTransactionReceipt()
   Sub-second confirmation
        │
        ▼
6. ArcScan Blockscout verify API
        │
        ▼
7. contractStore.save() → Supabase
        │
        ▼
8. EventBus.emit('contract.deployed')
   → Toast + ArcScan link
```

## Arc-Specific Design Decisions

### USDC as native gas
All gas estimates are displayed in USDC (`$X.XX USDC`). The conversion:
- Native gas cost = gasLimit × gasPrice (18 decimals)
- ERC-20 equivalent = native ÷ 10^12 (6 decimals)
- Display = `$${(erc20 / 1_000_000).toFixed(2)} USDC`

### Why we never mix decimals
Arc USDC has a dual representation:
- `addr.balance` → native, 18 decimals (like ETH on other chains)
- `USDC.balanceOf(addr)` → ERC-20, 6 decimals (standard USDC interface)

Contractory always uses `arcUsdc.toErc20()` when converting for display.

### PREVRANDAO = 0
Arc always returns 0 for `block.prevrandao`. The compatibility analyzer detects any usage and blocks deployment until fixed.

## Security

- SIWE auth: HttpOnly session cookie (7 days), nonce cookie (5 min, one-time)
- Supabase RLS: every table has row-level security
- API routes: validate input, never expose stack traces to client
- No private keys in code — wallet signs all transactions
- CSP headers on all routes
