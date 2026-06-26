// Contractory Logger
// Structured logging for development + production.
// In production: only warn/error are shown. Debug suppressed.
// Audit logs are always written (blockchain operations, security events).

// ─── Types ────────────────────────────────────────────────────────────────

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'audit'

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: unknown
  timestamp: string
  sessionId?: string
}

type LogTransport = (entry: LogEntry) => void

// ─── Transports ───────────────────────────────────────────────────────────

const consoleTransport: LogTransport = (entry) => {
  const prefix = `[${entry.timestamp}] [${entry.context ?? 'contractory'}]`
  const msg = `${prefix} ${entry.message}`

  switch (entry.level) {
    case 'debug': console.debug(msg, entry.data ?? '')
      break
    case 'info':  console.info(msg, entry.data ?? '')
      break
    case 'warn':  console.warn(msg, entry.data ?? '')
      break
    case 'error': console.error(msg, entry.data ?? '')
      break
    case 'audit': console.info(`🔐 ${msg}`, entry.data ?? '')
      break
  }
}

// In production, send to Supabase activity_logs table
// This is a no-op stub — populated in Phase 6
const remoteTransport: LogTransport = (_entry) => {
  
}

// ─── Logger Class ─────────────────────────────────────────────────────────

class Logger {
  private context: string
  private isDev = process.env.NODE_ENV === 'development'
  private transports: LogTransport[] = [consoleTransport]

  constructor(context: string) {
    this.context = context
  }

  private write(level: LogLevel, message: string, data?: unknown): void {
    // Suppress debug in production
    if (level === 'debug' && !this.isDev) return

    const entry: LogEntry = {
      level,
      message,
      context: this.context,
      data,
      timestamp: new Date().toISOString(),
    }

    this.transports.forEach((t) => {
      try { t(entry) } catch { /* transport errors must not crash the app */ }
    })
  }

  debug(message: string, data?: unknown): void {
    this.write('debug', message, data)
  }

  info(message: string, data?: unknown): void {
    this.write('info', message, data)
  }

  warn(message: string, data?: unknown): void {
    this.write('warn', message, data)
  }

  error(message: string, data?: unknown): void {
    this.write('error', message, data)
    // In production, also send to remote
    if (!this.isDev) remoteTransport({ level: 'error', message, context: this.context, data, timestamp: new Date().toISOString() })
  }

  /**
   * Audit log — always written, never suppressed.
   * Use for: wallet connections, deployments, bridge operations,
   * permission changes, any security-relevant event.
   */
  audit(message: string, data?: unknown): void {
    this.write('audit', message, data)
    // Always send to remote for audit trail
    remoteTransport({ level: 'audit', message, context: this.context, data, timestamp: new Date().toISOString() })
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport)
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────

/**
 * Create a logger with a given context.
 * @example
 * const logger = createLogger('arc-provider')
 * logger.info('Connected to Arc Testnet')
 * logger.audit('Contract deployed', { address: '0x...' })
 */
export function createLogger(context: string): Logger {
  return new Logger(context)
}

// Default logger for quick usage
export const logger = createLogger('contractory')
