export const SUPPORTED_LOCALES = [
  "en",
  "es",
  "zh",
  "hi",
  "pt",
  "nl",
  "de",
  "ar",
  "ja",
  "id",
  "fr",
  "bn",
] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = "en"
export const LOCALE_COOKIE_NAME = "locale"

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES)

const LOCALE_LANGUAGE_TAGS: Record<SupportedLocale, string> = {
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
  hi: "hi-IN",
  pt: "pt-PT",
  nl: "nl-NL",
  de: "de-DE",
  ar: "ar",
  ja: "ja-JP",
  id: "id-ID",
  fr: "fr-FR",
  bn: "bn-BD",
}

export const isSupportedLocale = (value: string | undefined | null): value is SupportedLocale =>
  Boolean(value && SUPPORTED_LOCALE_SET.has(value))

export const getLocaleDirection = (locale: SupportedLocale) =>
  locale === "ar" ? "rtl" : "ltr"

export const getLocaleLanguageTag = (locale: SupportedLocale) => LOCALE_LANGUAGE_TAGS[locale]
