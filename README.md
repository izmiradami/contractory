# Contractory

**The Developer Operating System for Arc**

Deploy, analyze, verify and manage smart contracts on the Arc blockchain — with AI-powered analysis, USDC gas estimation, and Arc-native standards (ERC-8004, ERC-8183) built in.

---

## What is Contractory?

Contractory is an open-source developer platform that makes Arc the easiest blockchain to build on.

| Module | Description |
|---|---|
| **Contract Studio** | Monaco IDE with real-time Arc compatibility analysis, security scanner, gas estimator (USDC), and one-click deploy + verify |
| **Contract Control Center** | Manage deployed contracts — health scores, AI summaries, function explorer, live events, ownership management |
| **Payments Hub** | Send, bridge, swap and automate USDC payments across chains |
| **AI Agent Studio** | Register, manage and test ERC-8004 AI agents with on-chain identity and reputation |

---

## Quick Start

### Prerequisites

- Node.js 20+
- A wallet (MetaMask, Rabby, or Coinbase Wallet)
- Arc Testnet ETH for gas (get from faucet)
- Supabase account (free tier works)

### Setup

```bash
# 1. Clone
git clone https://github.com/woodstonestudio/contractory
cd contractory

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

# 4. Setup database
# Paste supabase/migrations/001_initial_schema.sql into Supabase SQL editor

# 5. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional (has defaults)
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Arc Testnet

| Property | Value |
|---|---|
| Chain ID | 72 |
| RPC URL | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| USDC | `0x3600000000000000000000000000000000000000` |
| Gas token | USDC (not ETH) |
| Finality | Sub-second |

### Arc-specific considerations

- Gas is paid in USDC. All gas estimates are shown in `$X.XX USDC`.
- `PREVRANDAO` always returns 0 — use a VRF oracle for randomness.
- `SELFDESTRUCT` to address(0) reverts.
- Native USDC uses 18 decimals; ERC-20 USDC interface uses 6. Never mix them.
- Transfers to/from blocklisted addresses revert at runtime.

---

## Architecture

```
contractory/
├── app/                    # Next.js 15 App Router pages
│   ├── api/                # API routes (compile, auth, events)
│   └── platform/           # Protected platform pages
├── components/             # React components
│   ├── contracts/          # Contract Control Center
│   ├── studio/             # Contract Studio panels
│   ├── agents/             # AI Agent components
│   └── layout/             # Shell, sidebar, header
├── hooks/                  # Custom hooks
│   ├── blockchain/         # useArcBalance, useArcNetwork
│   └── features/           # useDeploy, useCompatibilityAnalyzer
├── packages/               # Internal packages
│   ├── blockchain/         # Arc + multi-chain adapters
│   ├── ai/                 # AI provider abstraction
│   ├── event-bus/          # Cross-component events
│   └── plugins/            # Plugin system
├── lib/                    # Utilities and stores
│   ├── store/              # Supabase persistence
│   ├── utils/              # Shared utilities + retry
│   └── wagmi/              # Wagmi + RainbowKit config
└── supabase/               # Database migrations
```

---

## Deploy Pipeline

When you click "Deploy to Arc Testnet" in Contract Studio:

1. **Compile** — Real `solc 0.8.35` compilation via `/api/compile`
2. **Arc Analysis** — Checks PREVRANDAO, SELFDESTRUCT, decimal mismatch, etc.
3. **Gas Estimate** — Live `eth_gasPrice` from Arc RPC → USDC display
4. **Deploy** — `walletClient.deployContract()` → real transaction
5. **Confirm** — `waitForTransactionReceipt()` — sub-second on Arc
6. **Verify** — Blockscout-compatible ArcScan API
7. **Save** — Supabase persistence with RLS

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 15, React 19 |
| Blockchain | wagmi 2, viem, RainbowKit |
| Compiler | solc-js 0.8.35 |
| Auth | SIWE (Sign-In with Ethereum) |
| Database | Supabase (PostgreSQL + RLS) |
| Styling | Tailwind CSS, shadcn/ui |
| Editor | Monaco Editor |
| Testing | Vitest, Playwright |

---

## Development

```bash
npm run dev       # Development server
npm run build     # Production build
npm run test      # Unit + integration tests
npm run test:e2e  # Playwright E2E tests
npm run lint      # ESLint
```

---

## Contributing

Contractory is open source under the MIT license.

See `CONTRIBUTING.md` for guidelines.

---

## License

MIT — Woodstone Studio

---

## Arc Resources

- [Arc Documentation](https://docs.arc.network)
- [ArcScan Explorer](https://testnet.arcscan.app)
- [ERC-8004 Specification](https://docs.arc.network/erc-8004)
- [ERC-8183 Specification](https://docs.arc.network/erc-8183)
