import { DEFAULT_LOCALE, type SupportedLocale, isSupportedLocale } from "./config"

const splitPathname = (pathname: string) => pathname.split("/").filter(Boolean)

export const getLocaleFromPathname = (pathname: string): SupportedLocale | null => {
  const [segment] = splitPathname(pathname)
  return isSupportedLocale(segment) ? segment : null
}

export const stripLocaleFromPathname = (pathname: string): string => {
  const segments = splitPathname(pathname)
  if (segments.length === 0) {
    return "/"
  }

  if (isSupportedLocale(segments[0])) {
    const remainder = segments.slice(1)
    return remainder.length === 0 ? "/" : `/${remainder.join("/")}`
  }

  return pathname || "/"
}

export const localizePath = (pathname: string, locale: SupportedLocale = DEFAULT_LOCALE) => {
  const normalizedPathname = stripLocaleFromPathname(pathname)
  if (normalizedPathname === "/") {
    return `/${locale}`
  }

  return `/${locale}${normalizedPathname}`
}

export const switchLocaleInPathname = (pathname: string, locale: SupportedLocale) =>
  localizePath(pathname, locale)
