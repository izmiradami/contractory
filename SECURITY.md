# Security Policy

## Reporting Vulnerabilities

Please report security vulnerabilities to: **admin@woodstonestudio.com**

Do not open public GitHub issues for security vulnerabilities.

We will respond within 48 hours and provide a fix within 14 days for critical issues.

## Security Model

### Authentication
- Sign-In with Ethereum (SIWE) — no passwords
- HttpOnly session cookie (7 day expiry)
- One-time nonce prevents replay attacks
- sameSite: strict prevents CSRF

### Secrets
- No private keys in code or repository
- All transactions signed by user's wallet
- API keys in environment variables only
- Supabase service role key server-side only

### Database
- Row-Level Security (RLS) on all tables
- Users can only read/write their own data
- No direct client access to privileged operations

### API Routes
- Input validation on all endpoints
- No stack traces exposed to client
- Rate limiting via Upstash (configurable)

### Content Security Policy
All pages serve CSP headers restricting script sources.

## Known Limitations

- Arc Testnet is not mainnet — do not use real funds
- The compile API runs solc on the server — sanitize inputs before production use at scale
- WalletConnect requires a valid project ID for mobile wallet support

## Dependency Security

Run `npm audit` regularly. The wagmi/RainbowKit dependency chain has known advisories pending upstream fixes (tracked in wagmi v3 migration).
