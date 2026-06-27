# Contributing to Contractory

Thanks for your interest in improving Contractory! Contributions of all kinds are welcome — bug reports, fixes, documentation and features that fit the project''s scope.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local` and fill in your values.
4. Run `npm run dev` and make your changes.
5. Run `npm run build` to confirm the project builds cleanly.

## Pull requests

- Keep pull requests focused on a single change.
- Write clear commit messages (e.g. `fix: handle empty contract list`).
- Make sure `npm run build` passes before opening a PR.
- Describe what your change does and why.

## Code style

- TypeScript and React function components.
- Follow the existing folder structure and naming conventions.
- Prefer small, composable components.
- No mock data or fake on-chain interactions — features are either real or shown as a "Coming Soon" preview.

## Reporting bugs

Open an issue with steps to reproduce, what you expected, and what actually happened. Screenshots help.

## Security

Never include private keys, seed phrases or secrets in code, issues or pull requests. See [SECURITY.md](SECURITY.md).