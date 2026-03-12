import { cookies, headers } from "next/headers"

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  type SupportedLocale,
  isSupportedLocale,
} from "./config"

export const REQUEST_LOCALE_HEADER = "x-nexis-locale"

export const getRequestLocale = async (): Promise<SupportedLocale> => {
  const requestHeaders = await headers()
  const headerLocale = requestHeaders.get(REQUEST_LOCALE_HEADER)
  if (isSupportedLocale(headerLocale)) {
    return headerLocale
  }

  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value

  return isSupportedLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE
}
