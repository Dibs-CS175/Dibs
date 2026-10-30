import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/server';

const STUDENT_PREFIXES = [
  '/browse',
  '/listings',
  '/messages',
  '/orders',
  '/profile',
  '/sell',
  '/summer-hold',
];

function isStudentProtectedPath(pathname: string): boolean {
  return STUDENT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isStudentProtectedPath(pathname) && !isAdminPath(pathname)) {
    return NextResponse.next();
  }

  // If Supabase environment variables aren't set, allow navigation
  let supabaseUrl: string;
  let supabaseAnonKey: string;
  try {
    supabaseUrl = getSupabaseUrl();
    supabaseAnonKey = getSupabaseAnonKey();
  } catch {
    return NextResponse.next();
  }

  // If running locally in development without any Supabase auth cookies,
  // allow local Demo mode to manage sessions via client-side storage.
  const hasSupabaseCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token'));

  if (process.env.NODE_ENV === 'development' && !hasSupabaseCookie) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // 1. Read user from Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Redirect signed-out users to /verify?next=<pathname>
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next();
    }
    const verifyUrl = new URL('/verify', request.url);
    verifyUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(verifyUrl);
  }

  // 3. Redirect non-admins away from /admin routes
  if (isAdminPath(pathname)) {
    const metadataRole = user.app_metadata?.role ?? user.user_metadata?.role;
    let isAdmin = metadataRole === 'admin';

    if (!isAdmin) {
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle();

      isAdmin = profile?.role === 'admin';
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/browse', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
