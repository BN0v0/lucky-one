import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;

      // Get the user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Check if user has completed profile
        const { data: profile } = await supabase
          .from('users')
          .select('address, nif, birth_date')
          .eq('id', session.user.id)
          .single();

        // If profile is incomplete, redirect to complete-profile
        if (!profile?.address || !profile?.nif || !profile?.birth_date) {
          return NextResponse.redirect(new URL('/register/complete-profile', request.url));
        }
      }

      // If profile is complete or there's an error, use the next parameter or default to dashboard
      return NextResponse.redirect(new URL(next, request.url));
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url)
      );
    }
  }

  // No code, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
} 