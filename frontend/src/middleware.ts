import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_APP!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_APP!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - Supabase will automatically refresh
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check if route is protected (starts with /app)
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/app');

  if (isProtectedRoute && !session) {
    // Redirect to login, preserve the intended destination
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated user tries to access /login, redirect to /app
  if (request.nextUrl.pathname === '/login' && session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/app';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/app/:path*', '/login'],
};
