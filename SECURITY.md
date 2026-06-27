# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in Contractory, please report it responsibly:

- Open a private security advisory on GitHub, or
- Contact the maintainer directly rather than opening a public issue.

Please include a description of the issue, steps to reproduce, and the potential impact. We will respond as quickly as possible.

## Handling secrets

Contractory is a client-side application. All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser by design and must contain only public values (public RPC URLs, public Supabase anon keys, WalletConnect project IDs).

**Never** commit or expose:

- Wallet private keys or seed phrases
- Supabase service-role keys
- Any server-side secret

All credentials belong in environment variables (e.g. Vercel project settings), never in source code or the repository. A leaked private key can result in irreversible loss of funds.

## Smart contracts

Contracts deployed through Contractory run on Arc Testnet. Always review compatibility and security findings before deploying, and verify deployed contracts on ArcScan.