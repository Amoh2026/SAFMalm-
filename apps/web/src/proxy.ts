import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['sv', 'ar', 'en', 'fr'] as const;
const defaultLocale = 'sv';

const nonLocalizedRoutes = ['/admin', '/api', '/_next', '/favicon.ico', '/images', '/member'];

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip non-localized routes
  if (nonLocalizedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Skip static files
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // Check for locale prefix
  const pathnameLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // Has default locale prefix → strip it
  if (pathnameLocale === defaultLocale) {
    const stripped = pathname.replace(`/${defaultLocale}`, '') || '/';
    const url = request.nextUrl.clone();
    url.pathname = stripped;
    return NextResponse.redirect(url);
  }

  // Has non-default locale → pass through
  if (pathnameLocale) {
    return NextResponse.next();
  }

  // No locale → rewrite to default
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/((?!_next|api|admin|member|images|favicon.ico).*)',
};