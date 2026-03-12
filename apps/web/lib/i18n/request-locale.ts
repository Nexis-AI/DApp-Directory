import {
  DEFAULT_LOCALE,
  type SupportedLocale,
  isSupportedLocale,
} from "./config"
import { getLocaleFromPathname } from "./pathnames"

const normalizeLanguage = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0]

export const matchPreferredLocale = (
  acceptLanguage: string | null | undefined,
): SupportedLocale => {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE
  }

  const candidates = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, qualityToken] = part.trim().split(";")
      const quality = qualityToken?.startsWith("q=")
        ? Number.parseFloat(qualityToken.slice(2))
        : 1

      return {
        locale: normalizeLanguage(tag ?? ""),
        quality: Number.isFinite(quality) ? quality : 0,
      }
    })
    .sort((left, right) => right.quality - left.quality)

  for (const candidate of candidates) {
    if (isSupportedLocale(candidate.locale)) {
      return candidate.locale
    }
  }

  return DEFAULT_LOCALE
}

export const resolveRequestLocale = ({
  pathname,
  cookieLocale,
  acceptLanguage,
}: {
  pathname: string
  cookieLocale?: string
  acceptLanguage?: string | null
}): SupportedLocale => {
  const pathLocale = getLocaleFromPathname(pathname)
  if (pathLocale) {
    return pathLocale
  }

  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  return matchPreferredLocale(acceptLanguage)
}
