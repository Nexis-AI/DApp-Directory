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
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = "en";

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

export const isSupportedLocale = (
  value: string | undefined | null,
): value is SupportedLocale => Boolean(value && SUPPORTED_LOCALE_SET.has(value));
