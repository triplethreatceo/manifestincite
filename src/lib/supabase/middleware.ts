import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getDisabledRoutePrefixes } from '@/config/modules';

const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password', '/auth/set-password', '/privacy', '/terms'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicRoute = pathname === '/' || PUBLIC_ROUTES.some((route) => route !== '/' && pathname.startsWith(route));

  // Not logged in + trying to access protected route → redirect to login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Logged-in user: fetch profile for role + is_active checks
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    // Inactive user → sign out and redirect to login
    if (profile && !profile.is_active) {
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'account_deactivated');
      return NextResponse.redirect(url);
    }

    const role = profile?.role;

    // Logged in + on a public auth route → redirect to dashboard
    const isAuthRoute = ['/login', '/forgot-password', '/reset-password'].some((r) => pathname.startsWith(r));
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'client' ? '/portal/dashboard' : '/dashboard';
      return NextResponse.redirect(url);
    }

    // Client role trying to access admin/staff routes
    if (role === 'client' && !pathname.startsWith('/portal') && !pathname.startsWith('/api') && !isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/portal/dashboard';
      return NextResponse.redirect(url);
    }

    // Admin/staff trying to access portal routes
    if (role !== 'client' && pathname.startsWith('/portal')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Disabled module guard — redirect to /dashboard
    if (role !== 'client' && !isPublicRoute && !pathname.startsWith('/api')) {
      const disabledPrefixes = getDisabledRoutePrefixes();
      const isDisabled = disabledPrefixes.some((prefix) =>
        pathname === prefix || pathname.startsWith(prefix + '/')
      );
      if (isDisabled) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }

      // Admin-only route guard: /admin/* requires admin role
      if (pathname.startsWith('/admin') && role !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}