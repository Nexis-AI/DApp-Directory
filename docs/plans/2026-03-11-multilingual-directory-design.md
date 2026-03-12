# Multilingual Directory, Catalog, And Documentation Design

## Goals

- Add end-to-end multilingual support for the directory, catalog UI, and documentation.
- Support these locales from launch: English, Spanish, Chinese, Hindi, Portuguese, Dutch, German, Arabic, Japanese, Indonesian, French, and Bengali.
- Detect a visitor's preferred browser language on first visit and route them to the best supported locale.
- Let users switch languages manually from shared navigation without losing the current route or query string.
- Ensure all user-facing content changes language on switch, including directory copy, documentation prose, navigation, metadata, and generated catalog descriptions.

## Route Model

- Move all public pages under a locale-prefixed App Router segment: `app/[locale]/...`.
- Redirect bare routes such as `/` and `/documentation` to locale-prefixed equivalents.
- Keep API routes unlocalized under `app/api/...`.
- Preserve route and search params when switching locales.

## Locale Detection

- Supported locale codes:
  - `en`
  - `es`
  - `zh`
  - `hi`
  - `pt`
  - `nl`
  - `de`
  - `ar`
  - `ja`
  - `id`
  - `fr`
  - `bn`
- Locale selection order:
  - explicit locale in the URL
  - saved `locale` cookie from a previous manual switch
  - `Accept-Language` browser header
  - default locale `en`
- Normalize browser variants to supported language codes, for example:
  - `es-MX` -> `es`
  - `pt-BR` -> `pt`
  - `zh-CN` -> `zh`

## Content Model

- Keep English as the source of truth.
- Move UI strings and documentation copy into locale dictionaries.
- Keep dApp names, brand names, and chain names in their canonical source form unless a separate display-alias layer is introduced later.
- Translate descriptions, labels, buttons, empty states, pagination, navigation, and SEO content.
- Translate generated catalog descriptions at build time instead of per request.

## Catalog And Search

- Extend generated data to support locale-specific catalog artifacts.
- Store localized directory descriptions in generated per-locale files.
- Search should continue to match canonical English text while also matching localized descriptions where available.
- Keep filters and counts locale-aware in the UI while preserving stable query parameter values.

## UI And Layout

- Add a language switcher to shared navigation for both the directory and documentation layouts.
- Use a language picker rather than a country picker, while allowing a country-style visual treatment if desired.
- Set `<html lang>` dynamically per locale.
- Set `dir="rtl"` for Arabic.
- Use locale-aware date and number formatting via `Intl`.
- Replace the current Latin-only font setup with locale-aware font families that cover Arabic, Bengali, Japanese, and Chinese.

## SEO

- Give each localized page a stable locale-specific URL.
- Emit locale-aware titles, descriptions, canonical URLs, `hreflang` alternates, and JSON-LD metadata.
- Keep English as the source language but allow all supported locale pages to be indexable.
- Only redirect from unprefixed routes; never redirect users away from an explicit locale route.

## Testing

- Add tests for locale matching from `Accept-Language`.
- Add tests for cookie override behavior.
- Add tests for locale-aware route switching that preserves path and query params.
- Add tests for dictionary loading and English fallback behavior.
- Add tests for locale-aware catalog filtering and search.
- Verify with:
  - `pnpm test`
  - `pnpm --filter web typecheck`
  - `pnpm --filter web build`

## Rollout Order

1. Add locale configuration, dictionaries, utilities, and tests.
2. Add middleware and locale-prefixed routing.
3. Migrate shared navigation and layouts.
4. Migrate directory pages and documentation pages to dictionaries.
5. Add locale-aware generated catalog artifacts and data loading.
6. Run verification and sweep for mixed-language regressions.
