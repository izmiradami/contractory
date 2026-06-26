# Changelog

All notable changes to Contractory are documented here.

## [1.0.0] — 2025-06-25

### Added
- **Contract Studio** — Monaco IDE with Arc-specific Solidity tooling
  - Real `solc 0.8.35` compilation via server API
  - Arc Compatibility Analyzer (PREVRANDAO, SELFDESTRUCT, decimal mismatch)
  - Security Scanner (reentrancy, tx.origin, floating pragma)
  - USDC gas estimation with live Arc RPC
  - Deploy Wizard (8-step: compile → analyze → estimate → deploy → confirm → verify → save → done)
  - 5 built-in templates: ERC20, ERC721, ERC1155, ERC-8004, ERC-8183
- **Contract Control Center** — Etherscan + Tenderly + Defender for Arc
  - Health Score with 6 sub-scores
  - AI Executive Summary (Claude-powered)
  - One-Click Fix (generate → preview → deploy)
  - Function Studio with viem/ethers/curl code generation
  - Live event monitoring via viem `getLogs`
  - Contract Timeline
- **Payments Hub** — Programmable money on Arc
  - Send Center (Single, Batch, CSV)
  - Bridge Center with route comparison (Circle CCTP, LayerZero, Wormhole)
  - Swap Center
  - Unified Balance across 6 chains
  - Payment Automations + Recipes
- **AI Agent Studio** — ERC-8004 onchain identity
  - Agent Builder wizard
  - Reputation Dashboard
  - AI Playground (explainable, auditable, replayable)
  - Version History with rollback
- **Infrastructure**
  - SIWE authentication
  - Supabase persistence with RLS
  - EventBus for cross-component communication
  - Plugin system with 45 built-in commands
  - Command palette (⌘K)
  - Retry utilities with exponential backoff
  - Full TypeScript coverage
  - Vitest unit + integration tests
  - Playwright E2E tests
