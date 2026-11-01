import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Identify requests arriving via the dedicated admin domain:
  // e.g. admin.roveandamber.com or local testing like admin.localhost:3000
  const isAdminSubdomain = (
    host.startsWith('admin.') || 
    host.includes('admin.roveandamber.com')
  );

  if (isAdminSubdomain) {
    const { pathname } = url;

    // Preserve internal Next.js assets, static assets, APIs, and media files
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/images') ||
      pathname.startsWith('/favicon') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Root path (admin.roveandamber.com/) -> rewrite to Admin Dashboard (/admin)
    if (pathname === '/') {
      url.pathname = '/admin';
      return NextResponse.rewrite(url);
    }

    // Direct login path (admin.roveandamber.com/login) -> rewrite to /admin/login
    if (pathname === '/login') {
      url.pathname = '/admin/login';
      return NextResponse.rewrite(url);
    }

    // Any path without the /admin prefix -> seamlessly route to /admin/*
    // (e.g. admin.roveandamber.com/categories -> /admin/categories)
    if (!pathname.startsWith('/admin')) {
      url.pathname = `/admin${pathname}`;
      return NextResponse.rewrite(url);
    }

    // Paths that already begin with /admin pass through directly
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /_next/static (static files)
     * 2. /_next/image (image optimization files)
     * 3. /favicon.ico, sitemap.xml, robots.txt
     * 4. Media files (svg, png, jpg, jpeg, gif, webp, mp4)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4)$).*)',
  ],
};

