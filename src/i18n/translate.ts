import { DEFAULT_LOCALE, type SupportedLocale } from "./config.js";

const BATCH_SEPARATOR = "\n@@\n";

const TRANSLATION_CACHE = new Map<string, string>();

const buildCacheKey = (sourceLocale: string, targetLocale: string, text: string) =>
  `${sourceLocale}:${targetLocale}:${text}`;

const decodeTranslatedBody = (payload: unknown): string => {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error("Unexpected translation response shape.");
  }

  return payload[0]
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : ""))
    .join("");
};

export const translateTextBatch = async ({
  texts,
  sourceLocale = DEFAULT_LOCALE,
  targetLocale,
  fetchImpl = fetch,
}: {
  texts: string[];
  sourceLocale?: string;
  targetLocale: SupportedLocale;
  fetchImpl?: typeof fetch;
}) => {
  if (texts.length === 0 || sourceLocale === targetLocale) {
    return texts;
  }

  const results = [...texts];
  const uncachedIndexes: number[] = [];
  const uncachedTexts: string[] = [];

  texts.forEach((text, index) => {
    if (!text.trim()) {
      return;
    }

    const cacheKey = buildCacheKey(sourceLocale, targetLocale, text);
    const cached = TRANSLATION_CACHE.get(cacheKey);
    if (cached) {
      results[index] = cached;
      return;
    }

    uncachedIndexes.push(index);
    uncachedTexts.push(text);
  });

  if (uncachedTexts.length === 0) {
    return results;
  }

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("dt", "t");
  url.searchParams.set("sl", sourceLocale);
  url.searchParams.set("tl", targetLocale);
  url.searchParams.set("q", uncachedTexts.join(BATCH_SEPARATOR));

  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}.`);
  }

  const translatedTexts = decodeTranslatedBody(await response.json()).split(BATCH_SEPARATOR);

  if (translatedTexts.length !== uncachedTexts.length) {
    throw new Error("Translated batch could not be split back into individual strings.");
  }

  translatedTexts.forEach((translatedText, index) => {
    const original = uncachedTexts[index] ?? "";
    const cleaned = translatedText.trim();
    TRANSLATION_CACHE.set(buildCacheKey(sourceLocale, targetLocale, original), cleaned);
    results[uncachedIndexes[index] ?? index] = cleaned;
  });

  return results;
};
