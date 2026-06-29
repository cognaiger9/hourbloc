import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(
        new URL(`/login?error=auth_failed`, requestUrl.origin)
      );
    }

    // Success - check if there's a redirect parameter from the original login attempt
    // This would be set by middleware if user tried to access a protected route
    const redirectTo = requestUrl.searchParams.get('redirect') || '/app';

    return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  }

  // No code or error - redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}

