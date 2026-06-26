# Troubleshooting

## Wallet not connecting

**Symptom**: RainbowKit modal opens but wallet doesn't connect.

**Fix**:
1. Ensure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in `.env.local`
2. Add `http://localhost:3000` to allowed domains in WalletConnect dashboard
3. Try a different browser or disable extensions

## SIWE sign-in failing

**Symptom**: "SIWE verification failed" error.

**Fix**:
1. Check `NEXT_PUBLIC_APP_URL` matches your actual URL exactly (no trailing slash)
2. Clear cookies and try again
3. Ensure the nonce hasn't expired (5 minute window)

## Compilation errors

**Symptom**: "Contract not found" or compiler errors.

**Fix**:
1. Ensure the `contractName` in the deploy wizard matches the contract name in your Solidity code exactly (case-sensitive)
2. Check for syntax errors in the Problems panel
3. OpenZeppelin imports (`@openzeppelin/...`) require those packages installed in your project — the IDE compiles standalone contracts only

## Deploy failing

**Symptom**: Transaction submitted but no receipt / timeout.

**Fix**:
1. Ensure your wallet is on Arc Testnet (Chain ID 72)
2. Ensure you have USDC in your wallet for gas (~$0.01)
3. Check Arc Testnet status at `https://testnet.arcscan.app`
4. Increase gas limit in wallet settings

## Supabase connection failing

**Symptom**: Contracts not saving after deploy.

**Fix**:
1. Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
2. Ensure you've run the migration SQL in Supabase
3. Check Supabase RLS policies allow insert from your wallet address

## Build failing

**Symptom**: `npm run build` fails.

**Common causes**:
1. Missing environment variables — check all required vars in `.env.local`
2. TypeScript errors — run `npm run type-check` for details
3. solc not installed — run `npm install` again

## Monaco Editor not loading

**Symptom**: White/blank editor area.

**Fix**: Monaco requires client-side rendering. Ensure you're not in a server component. The editor uses `dynamic(() => import(...), { ssr: false })`.
