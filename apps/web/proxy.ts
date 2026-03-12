import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { LOCALE_COOKIE_NAME } from "@/lib/i18n/config"
import { localizePath, stripLocaleFromPathname } from "@/lib/i18n/pathnames"
import { resolveRequestLocale } from "@/lib/i18n/request-locale"
import { REQUEST_LOCALE_HEADER } from "@/lib/i18n/server"

const shouldBypassProxy = (pathname: string) =>
  pathname.startsWith("/api") ||
  pathname.startsWith("/_next") ||
  pathname.includes(".")

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (shouldBypassProxy(pathname)) {
    return NextResponse.next()
  }

  const resolvedLocale = resolveRequestLocale({
    pathname,
    cookieLocale: request.cookies.get(LOCALE_COOKIE_NAME)?.value,
    acceptLanguage: request.headers.get("accept-language"),
  })

  const strippedPathname = stripLocaleFromPathname(pathname)

  if (pathname === strippedPathname) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = localizePath(pathname, resolvedLocale)
    redirectUrl.search = search

    const response = NextResponse.redirect(redirectUrl)
    response.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })
    return response
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = strippedPathname
  rewriteUrl.search = search

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(REQUEST_LOCALE_HEADER, resolvedLocale)

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  })

  response.cookies.set(LOCALE_COOKIE_NAME, resolvedLocale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}

export const config = {
  matcher: "/:path*",
}
