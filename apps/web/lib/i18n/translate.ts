import { cache } from "react"

import { DEFAULT_LOCALE, type SupportedLocale } from "./config"

const BATCH_SEPARATOR = "\n@@\n"

const TRANSLATION_CACHE = new Map<string, string>()

const decodeTranslatedBody = (payload: unknown): string => {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
    throw new Error("Unexpected translation response shape.")
  }

  return payload[0]
    .map((segment) => (Array.isArray(segment) ? String(segment[0] ?? "") : ""))
    .join("")
}

const buildCacheKey = (sourceLocale: string, targetLocale: string, text: string) =>
  `${sourceLocale}:${targetLocale}:${text}`

const shouldBypassTranslation = (
  text: string,
  sourceLocale: string,
  targetLocale: string,
) => !text.trim() || sourceLocale === targetLocale

export const translateTextBatch = async ({
  texts,
  sourceLocale = DEFAULT_LOCALE,
  targetLocale,
  fetchImpl = fetch,
}: {
  texts: string[]
  sourceLocale?: string
  targetLocale: SupportedLocale
  fetchImpl?: typeof fetch
}) => {
  if (texts.length === 0) {
    return []
  }

  const results = [...texts]
  const uncachedIndexes: number[] = []
  const uncachedTexts: string[] = []

  texts.forEach((text, index) => {
    if (shouldBypassTranslation(text, sourceLocale, targetLocale)) {
      results[index] = text
      return
    }

    const cacheKey = buildCacheKey(sourceLocale, targetLocale, text)
    const cached = TRANSLATION_CACHE.get(cacheKey)
    if (cached) {
      results[index] = cached
      return
    }

    uncachedIndexes.push(index)
    uncachedTexts.push(text)
  })

  if (uncachedTexts.length === 0) {
    return results
  }

  const joined = uncachedTexts.join(BATCH_SEPARATOR)
  const url = new URL("https://translate.googleapis.com/translate_a/single")
  url.searchParams.set("client", "gtx")
  url.searchParams.set("dt", "t")
  url.searchParams.set("sl", sourceLocale)
  url.searchParams.set("tl", targetLocale)
  url.searchParams.set("q", joined)

  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 60 * 60 * 24 * 30 },
  })

  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}.`)
  }

  const body = decodeTranslatedBody(await response.json())
  const translatedTexts = body.split(BATCH_SEPARATOR)

  if (translatedTexts.length !== uncachedTexts.length) {
    throw new Error("Translated batch could not be split back into individual strings.")
  }

  translatedTexts.forEach((text, index) => {
    const original = uncachedTexts[index] ?? ""
    const cleaned = text.trim()
    const cacheKey = buildCacheKey(sourceLocale, targetLocale, original)
    TRANSLATION_CACHE.set(cacheKey, cleaned)
    results[uncachedIndexes[index] ?? index] = cleaned
  })

  return results
}

export const translateText = cache(
  async ({
    text,
    sourceLocale = DEFAULT_LOCALE,
    targetLocale,
  }: {
    text: string
    sourceLocale?: string
    targetLocale: SupportedLocale
  }) => {
    const [translated] = await translateTextBatch({
      texts: [text],
      sourceLocale,
      targetLocale,
    })

    return translated ?? text
  },
)

export const translateObjectText = async <
  T extends object,
  K extends {
    [P in keyof T]: T[P] extends string | string[] | undefined ? P : never
  }[keyof T],
>(
  value: T,
  targetLocale: SupportedLocale,
  fields: K[],
  sourceLocale = DEFAULT_LOCALE,
) => {
  const texts = fields.flatMap((field) => {
    const current = value[field]
    if (typeof current === "string") {
      return [current]
    }
    if (Array.isArray(current)) {
      return current
    }
    return []
  })

  const translated = await translateTextBatch({
    texts,
    sourceLocale,
    targetLocale,
  })

  let cursor = 0
  const nextValue = { ...value } as T

  for (const field of fields) {
    const current = value[field]

    if (typeof current === "string") {
      nextValue[field] = translated[cursor] as T[K]
      cursor += 1
      continue
    }

    if (Array.isArray(current)) {
      nextValue[field] = current.map(() => translated[cursor++]) as T[K]
    }
  }

  return nextValue
}
