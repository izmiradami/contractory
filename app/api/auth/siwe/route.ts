import { NextRequest, NextResponse } from 'next/server'
import { SiweMessage }              from 'siwe'
import { createClient }             from '@/lib/supabase/server'
import { createLogger }             from '@/packages/logger'

const logger = createLogger('siwe-auth')

// ─── GET /api/auth/siwe — Generate nonce ──────────────────────
export async function GET() {
  const nonce = crypto.randomUUID().replace(/-/g, '')

  const response = NextResponse.json({ nonce })

  // Store nonce in HttpOnly cookie (5 min TTL)
  response.cookies.set('siwe_nonce', nonce, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   300,
    path:     '/',
  })

  return response
}

// ─── POST /api/auth/siwe — Verify signature ───────────────────
export async function POST(req: NextRequest) {
  try {
    const body: { message: string; signature: string } = await req.json()

    if (!body.message || !body.signature) {
      return NextResponse.json({ error: 'Missing message or signature' }, { status: 400 })
    }

    // Retrieve nonce from cookie (replay protection)
    const storedNonce = req.cookies.get('siwe_nonce')?.value
    if (!storedNonce) {
      return NextResponse.json({ error: 'Nonce expired or missing' }, { status: 400 })
    }

    // Parse and verify SIWE message
    const siwe = new SiweMessage(body.message)

    await siwe.verify({
      signature: body.signature,
      nonce:     storedNonce,
      domain:    req.headers.get('host') ?? '',
      time:      new Date().toISOString(),
    })

    // SIWE verified — upsert user in Supabase
    const supabase  = await createClient()
    const address   = siwe.address.toLowerCase()
    const chainId   = siwe.chainId

    // Check existing user
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('address', address)
      .single()

    if (existing) {
      // Update last_login
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      // Create new user
      const { error: insertError } = await supabase.from('users').insert({
        address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      if (insertError) {
        logger.error('Failed to create user', insertError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
    }

    logger.audit('SIWE login', { address, chainId })

    // Set session cookie
    const response = NextResponse.json({ ok: true, address, chainId })

    response.cookies.set('contractory_session', JSON.stringify({ address, chainId }), {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:   60 * 60 * 24 * 7,  // 7 days
      path:     '/',
    })

    // Clear nonce (one-time use)
    response.cookies.delete('siwe_nonce')

    return response

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Verification failed'
    logger.warn('SIWE verification failed', { error: message })
    return NextResponse.json({ error: message }, { status: 401 })
  }
}

// ─── DELETE /api/auth/siwe — Sign out ────────────────────────
export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('contractory_session')
  response.cookies.delete('siwe_nonce')
  return response
}
