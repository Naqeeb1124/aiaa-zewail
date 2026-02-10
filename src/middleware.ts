import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { KICKOFF_MODE } from './lib/config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!KICKOFF_MODE) {
    return NextResponse.next()
  }

  // ALLOWED ROUTES:
  // 1. Admin dashboard and related subpages
  // 2. API routes
  // 3. Kickoff page itself (to avoid infinite loops)
  // 4. Join page (for registration)
  // 5. Static files (images, fonts, etc.) and Next.js internals
  const isAllowed = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/kickoff') ||
    pathname.startsWith('/join') ||
    pathname.startsWith('/events') ||
    pathname.includes('.') || // Static files like .png, .jpg, .svg
    pathname.startsWith('/_next') // Next.js internal files

  if (!isAllowed && pathname !== '/kickoff') {
    return NextResponse.rewrite(new URL('/kickoff', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
