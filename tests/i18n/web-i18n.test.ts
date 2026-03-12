import { describe, expect, it, vi } from "vitest"

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  getLocaleDirection,
  getLocaleLanguageTag,
  isSupportedLocale,
} from "../../apps/web/lib/i18n/config"
import {
  localizePath,
  stripLocaleFromPathname,
  switchLocaleInPathname,
} from "../../apps/web/lib/i18n/pathnames"
import {
  matchPreferredLocale,
  resolveRequestLocale,
} from "../../apps/web/lib/i18n/request-locale"
import { translateTextBatch } from "../../apps/web/lib/i18n/translate"

describe("web i18n config", () => {
  it("defines the supported launch locales", () => {
    expect(SUPPORTED_LOCALES).toEqual([
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
    ])
    expect(DEFAULT_LOCALE).toBe("en")
    expect(LOCALE_COOKIE_NAME).toBe("locale")
  })

  it("knows which locales are rtl", () => {
    expect(getLocaleDirection("ar")).toBe("rtl")
    expect(getLocaleDirection("en")).toBe("ltr")
  })

  it("maps locales to html language tags", () => {
    expect(getLocaleLanguageTag("en")).toBe("en-US")
    expect(getLocaleLanguageTag("pt")).toBe("pt-PT")
    expect(getLocaleLanguageTag("zh")).toBe("zh-CN")
    expect(isSupportedLocale("ja")).toBe(true)
    expect(isSupportedLocale("it")).toBe(false)
  })
})

describe("request locale matching", () => {
  it("matches the best supported language from accept-language", () => {
    expect(matchPreferredLocale("es-MX,es;q=0.9,en;q=0.8")).toBe("es")
    expect(matchPreferredLocale("pt-BR,pt;q=0.9,en-US;q=0.8")).toBe("pt")
    expect(matchPreferredLocale("zh-TW,zh;q=0.9,en;q=0.7")).toBe("zh")
    expect(matchPreferredLocale("bn-BD,bn;q=0.9,en;q=0.7")).toBe("bn")
    expect(matchPreferredLocale("it-IT,it;q=0.9")).toBe(DEFAULT_LOCALE)
  })

  it("resolves locale with url first, then cookie, then accept-language", () => {
    expect(
      resolveRequestLocale({
        pathname: "/fr/documentation",
        cookieLocale: "es",
        acceptLanguage: "de-DE,de;q=0.9",
      }),
    ).toBe("fr")

    expect(
      resolveRequestLocale({
        pathname: "/documentation",
        cookieLocale: "ja",
        acceptLanguage: "de-DE,de;q=0.9",
      }),
    ).toBe("ja")

    expect(
      resolveRequestLocale({
        pathname: "/documentation",
        cookieLocale: undefined,
        acceptLanguage: "de-DE,de;q=0.9",
      }),
    ).toBe("de")
  })
})

describe("locale path helpers", () => {
  it("adds and removes locale prefixes predictably", () => {
    expect(localizePath("/", "es")).toBe("/es")
    expect(localizePath("/documentation", "fr")).toBe("/fr/documentation")
    expect(stripLocaleFromPathname("/ar/documentation/api")).toBe("/documentation/api")
    expect(stripLocaleFromPathname("/documentation")).toBe("/documentation")
    expect(stripLocaleFromPathname("/zh")).toBe("/")
  })

  it("switches locales without losing the route", () => {
    expect(switchLocaleInPathname("/es/documentation/api", "fr")).toBe(
      "/fr/documentation/api",
    )
    expect(switchLocaleInPathname("/documentation/examples", "ja")).toBe(
      "/ja/documentation/examples",
    )
  })
})

describe("translation batching", () => {
  it("returns english text untouched when the target matches the source", async () => {
    const translated = await translateTextBatch({
      texts: ["Directory", "Documentation"],
      sourceLocale: "en",
      targetLocale: "en",
    })

    expect(translated).toEqual(["Directory", "Documentation"])
  })

  it("parses the translated batch and preserves delimiters", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [
        [
          ["Bonjour tout le monde\n", "Hello world\n"],
          ["@@\n", "@@\n"],
          ["Documentation ouverte", "Open Documentation"],
        ],
      ],
    }))

    const translated = await translateTextBatch({
      texts: ["Hello world", "Open Documentation"],
      sourceLocale: "en",
      targetLocale: "fr",
      fetchImpl: fetchMock as typeof fetch,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(translated).toEqual(["Bonjour tout le monde", "Documentation ouverte"])
  })
})
