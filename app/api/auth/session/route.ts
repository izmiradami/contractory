import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('contractory_session')?.value

  if (!sessionCookie) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }

  try {
    const session = JSON.parse(sessionCookie) as { address: string; chainId: number }
    return NextResponse.json({ authenticated: true, ...session })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}
