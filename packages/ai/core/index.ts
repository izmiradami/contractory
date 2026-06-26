// Contractory AI Provider System
// Provider-agnostic interface. Claude is default, OpenAI/Gemini are swappable.

import { ARC_SYSTEM_CONTEXT } from './system-context'
import { aiMemory } from './memory'

// ─── Types ────────────────────────────────────────────────────────────────

export type AIProviderId = 'claude' | 'openai' | 'gemini'

export type AITask =
  | 'error-explain'
  | 'contract-review'
  | 'contract-generate'
  | 'code-generate-viem'
  | 'code-generate-wagmi'
  | 'code-generate-hardhat'
  | 'job-spec-generate'
  | 'deployment-report'
  | 'doc-search'
  | 'tx-debug'
  | 'general'

export interface Message {
  role:    'user' | 'assistant' | 'system'
  content: string
}

export interface CompletionParams {
  messages:      Message[]
  systemPrompt?: string
  task?:         AITask
  maxTokens?:    number
  temperature?:  number
  stream?:       boolean
  injectContext?: boolean   // inject aiMemory context automatically (default: true)
}

export interface CompletionResult {
  content:  string
  usage:    { input: number; output: number }
  provider: AIProviderId
}

// ─── Provider Interface ───────────────────────────────────────────────────

export interface AIProvider {
  id:        AIProviderId
  name:      string
  available: boolean

  complete: (params: CompletionParams) => Promise<CompletionResult>
  stream:   (params: CompletionParams) => ReadableStream<string>
}

// ─── System Context Builder ────────────────────────────────────────────────

export function buildSystemPrompt(task?: AITask, extraContext?: string): string {
  const platformContext = aiMemory.toSystemContext()

  const taskInstructions: Partial<Record<AITask, string>> = {
    'error-explain':
      'The user needs help understanding an error. Be specific about what went wrong and how to fix it. Always check if the issue relates to Arc-specific behavior (USDC decimals, blocklist, value transfer rules).',
    'contract-review':
      'Analyze the provided Solidity contract for Arc compatibility issues. Check for PREVRANDAO, decimal mismatches, SELFDESTRUCT patterns, and ETH assumptions. Be precise about line numbers.',
    'contract-generate':
      'Generate Arc-compatible Solidity code. Always use USDC-aware patterns. Include comprehensive NatSpec comments. Never use PREVRANDAO for randomness.',
    'code-generate-viem':
      'Generate viem TypeScript code for Arc. Use the arcTestnet chain definition. Always handle USDC with 6-decimal ERC-20 interface for display.',
    'code-generate-wagmi':
      'Generate wagmi React hooks for Arc. Include proper TypeScript types. Handle the USDC-native gas model.',
    'tx-debug':
      'Debug the transaction. Check if failure is related to Arc-specific rules: blocklist, value-to-zero, SELFDESTRUCT to destructed account, decimal mismatch.',
    'deployment-report':
      'Generate a professional deployment report in Markdown. Include: contract address, tx hash, gas cost in USDC, deployment timestamp, chain, constructor args.',
  }

  return [
    ARC_SYSTEM_CONTEXT,
    platformContext,
    task && taskInstructions[task] ? `\n## Task Instructions\n${taskInstructions[task]}` : '',
    extraContext ? `\n## Additional Context\n${extraContext}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}

// ─── AI Provider Registry ─────────────────────────────────────────────────

class AIProviderRegistry {
  private providers = new Map<AIProviderId, AIProvider>()
  private defaultId: AIProviderId = 'claude'

  register(provider: AIProvider): void {
    this.providers.set(provider.id, provider)
  }

  get(id: AIProviderId): AIProvider | undefined {
    return this.providers.get(id)
  }

  getDefault(): AIProvider {
    const p = this.providers.get(this.defaultId)
    if (!p) throw new Error(`Default AI provider "${this.defaultId}" not registered`)
    return p
  }

  setDefault(id: AIProviderId): void {
    this.defaultId = id
  }

  getAvailable(): AIProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.available)
  }
}

export const aiRegistry = new AIProviderRegistry()
