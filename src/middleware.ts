import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Get the current session
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  // If there's an error getting the session, redirect to login
  if (error) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('message', 'Session error, please login again');
    return NextResponse.redirect(loginUrl);
  }

  // Protect all dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('message', 'Please login to access the dashboard');
      return NextResponse.redirect(loginUrl);
    }

    // Verify session is still valid
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Invalid session');
      }
    } catch {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('message', 'Session expired, please login again');
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      if (session) {
        const role = session.user.user_metadata?.role || 'client';

        // Admin-only routes
        if (req.nextUrl.pathname.startsWith('/dashboard/admin') && role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // Trainer-only routes
        if (req.nextUrl.pathname.startsWith('/dashboard/trainer') && role !== 'trainer') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
    }
  }

  // Redirect from auth pages if already logged in
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
}; 