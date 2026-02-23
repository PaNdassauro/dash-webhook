import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const correctPassword = process.env.DASH_PASSWORD

    if (!correctPassword) {
      console.error('DASH_PASSWORD not configured')
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }

    if (password === correctPassword) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('dash_auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
