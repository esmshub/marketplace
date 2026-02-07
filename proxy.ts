import { auth } from '@/auth'
import { NextURL } from 'next/dist/server/web/next-url';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // return NextResponse.next()
  // allow unauthenticated requests to auth flow API routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) return NextResponse.next();
  // TODO: just a temp thing as this will go to Netlify
  if (request.nextUrl.pathname.startsWith('/api/games')) return NextResponse.next();

  const session = await auth();
  const isAuthenticated = session && new Date(session.expires).getTime() > Date.now();
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // console.log('Session:', session);

  if (!isAuthenticated && isApiRoute) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isAuthenticated) return NextResponse.redirect(new URL('/login?redirect=' + request.nextUrl.pathname, request.url));

  return NextResponse.next()
}

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico).*)"],
}