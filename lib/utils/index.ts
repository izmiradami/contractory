import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind class merger — use everywhere instead of raw template literals */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Truncate Ethereum address: 0x1234...5678 */
export function truncateAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

/** Truncate TX hash: 0x1234...5678 */
export function truncateTx(hash: string, chars = 6): string {
  if (!hash || hash.length < 14) return hash
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`
}

/** Format a number with commas */
export function formatNumber(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Format a timestamp as relative time */
export function formatTimeAgo(timestamp: Date | string | number): string {
  const date = new Date(timestamp)
  const now  = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours   = Math.floor(minutes / 60)
  const days    = Math.floor(hours   / 24)

  if (seconds < 60)  return `${seconds}s ago`
  if (minutes < 60)  return `${minutes}m ago`
  if (hours   < 24)  return `${hours}h ago`
  if (days    < 30)  return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** Copy text to clipboard */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/** Open Arc explorer for an address */
export function explorerUrl(path: string, explorerBase = 'https://testnet.arcscan.app'): string {
  return `${explorerBase}/${path}`
}

export function explorerAddressUrl(address: string): string {
  return explorerUrl(`address/${address}`)
}

export function explorerTxUrl(hash: string): string {
  return explorerUrl(`tx/${hash}`)
}

export function explorerBlockUrl(block: number | bigint): string {
  return explorerUrl(`block/${block}`)
}

/** Validate Ethereum address */
export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value)
}

/** Validate TX hash */
export function isTxHash(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value)
}

/** Sleep utility */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
