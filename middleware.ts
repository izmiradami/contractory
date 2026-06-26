import { NextRequest, NextResponse } from 'next/server'

// Routes accessible without authentication
const PUBLIC_PATHS = [
  '/auth/connect',
  '/api/auth/',
  '/docs',
  '/privacy',
  '/terms',
  '/_next/',
  '/favicon.ico',
]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public paths
  if (isPublic(pathname)) return NextResponse.next()

  // Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/platform', req.url))
  }

  // Check session cookie
  const session = req.cookies.get('contractory_session')?.value

  if (!session && pathname.startsWith('/platform')) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/connect'
    return NextResponse.redirect(url)
  }

  // Validate session shape (basic)
  if (session) {
    try {
      const parsed = JSON.parse(session) as unknown
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('address' in parsed) ||
        !('chainId' in parsed)
      ) {
        throw new Error('Invalid session')
      }
    } catch {
      const response = NextResponse.redirect(new URL('/auth/connect', req.url))
      response.cookies.delete('contractory_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
}
