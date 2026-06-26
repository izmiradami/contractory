# Contributing to Contractory

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/woodstonestudio/contractory
cd contractory
npm install
cp .env.example .env.local
# Fill in .env.local
npm run dev
```

## Code Style

- TypeScript strict mode — no `any` without justification
- Tailwind CSS for styling — no inline styles
- Named exports for components
- `cn()` for conditional classes (never template literals)
- Error boundaries on all async UI

## Commit Convention

```
feat: add contract health breakdown
fix: correct USDC decimal conversion
docs: update deployment guide
test: add Arc compatibility analyzer tests
refactor: extract function studio component
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Ensure `npm run type-check && npm run lint && npm run test` all pass
4. Open a PR with a clear description

## Arc-Specific Rules

When contributing blockchain features:
- Always display gas in USDC, never ETH
- Never use `PREVRANDAO` for randomness
- Always handle `SELFDESTRUCT` Arc revert cases
- Distinguish 18-dec native USDC from 6-dec ERC-20 USDC

## License

By contributing, you agree your contributions are licensed under MIT.
