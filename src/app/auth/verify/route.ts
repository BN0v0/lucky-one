import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');

  if (token && type === 'email') {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email',
    });

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    // Redirect to complete profile after verification
    return NextResponse.redirect(new URL('/register/complete-profile', request.url));
  }

  // Invalid verification attempt
  return NextResponse.redirect(
    new URL('/login?error=Invalid verification link', request.url)
  );
} 