import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['sv', 'ar', 'en', 'fr'] as const;
const defaultLocale = 'sv';

const nonLocalizedRoutes = ['/admin', '/api', '/_next', '/favicon.ico', '/images', '/member'];

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip non-localized routes
  if (nonLocalizedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 2. Skip static files
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf|otf|map)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // 3. Check for locale prefix
  const pathnameLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  // 4. If URL already has a locale (sv, ar, en, fr) → serve it directly
  if (pathnameLocale) {
    return NextResponse.next();
  }

  // 5. No locale → redirect to default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: '/((?!_next|api|admin|member|images|favicon.ico).*)',
};