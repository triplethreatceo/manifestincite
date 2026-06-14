import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/privacy', '/terms'];

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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // Logged in + on a public auth route (not marketing pages) → redirect to dashboard
  const isAuthRoute = ['/login', '/signup', '/forgot-password', '/reset-password'].some((r) => pathname.startsWith(r));
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();

    // Fetch user role to determine redirect target
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role === 'client') {
      url.pathname = '/portal/dashboard';
    } else {
      url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
  }

  // Client role trying to access admin/staff routes
  if (user && pathname.startsWith('/dashboard') || user && pathname.startsWith('/clients') || user && pathname.startsWith('/drivers') || user && pathname.startsWith('/vehicles') || user && pathname.startsWith('/documents') || user && pathname.startsWith('/alerts') || user && pathname.startsWith('/tasks') || user && pathname.startsWith('/calendar') || user && pathname.startsWith('/invoices') || user && pathname.startsWith('/settings')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user!.id)
      .single();

    if (profile?.role === 'client') {
      const url = request.nextUrl.clone();
      url.pathname = '/portal/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Admin/staff trying to access portal routes
  if (user && pathname.startsWith('/portal')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'client') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}