import Link from "next/link"

import {
  Badge,
} from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { DirectoryFilters } from "@/components/directory-filters"
import { PageFrame, Pill, StatCard } from "@/components/page-frame"
import { SeoJsonLd } from "@/components/seo-json-ld"
import { getCommonCopy } from "@/lib/i18n/common-copy"
import { DEFAULT_LOCALE, getLocaleLanguageTag } from "@/lib/i18n/config"
import { localizePath } from "@/lib/i18n/pathnames"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"
import { getDirectoryPageData } from "@/lib/site-data"

const readParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value

const buildQueryString = (
  basePath: string,
  current: Record<string, string>,
  updates: Record<string, string | number | undefined>,
) => {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries({ ...current, ...updates })) {
    if (value === undefined || value === "") {
      continue
    }
    params.set(key, String(value))
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function generateMetadata() {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.directory, "/")
}

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const locale = await getRequestLocale()
  const commonCopy = await getCommonCopy(locale)

  const params = (await searchParams) ?? {}
  const q = readParam(params.q) ?? ""
  const chain = readParam(params.chain) ?? ""
  const category = readParam(params.category) ?? ""
  const page = Number.parseInt(readParam(params.page) ?? "1", 10) || 1

  const englishQuery =
    locale === DEFAULT_LOCALE || !q
      ? q
      : await translateText({
          text: q,
          sourceLocale: locale,
          targetLocale: DEFAULT_LOCALE,
        })

  const data = await getDirectoryPageData({
    q: englishQuery,
    chain,
    category,
    page,
    pageSize: 24,
  })

  const basePath = localizePath("/", locale)
  const currentParams = { q, chain, category }

  const formattedGeneratedAt = new Intl.DateTimeFormat(getLocaleLanguageTag(locale), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(data.meta.generatedAt))

  const pageStrings = [
    "dApp Directory",
    `Search ${data.meta.dapps.toLocaleString()} Web3 applications in a dApp directory built for AI agents.`,
    `Browse a machine-readable Web3 dApp directory generated from ${data.meta.sources.join(", ")}. Filter decentralized applications by chain and category, then use the HTTP API or MCP server to feed AI agents, internal tools, and research workflows.`,
    "Catalog",
    `Generated ${formattedGeneratedAt} from ${data.meta.sources.join(", ")}.`,
    "Coverage",
    `${data.meta.chains.toLocaleString()} chains`,
    `${data.meta.categories.toLocaleString()} categories and ${data.meta.duplicateReviewItems} duplicate-review items.`,
    "Search",
    "Search the Web3 dApp directory",
    `Showing ${data.items.length} of ${data.filteredCount.toLocaleString()} matching Web3 applications and decentralized apps.`,
    `Page ${data.page} of ${data.totalPages}`,
    "Top Web3 chains",
    "Top dApp categories",
    "Data access",
    "Use the directory data in apps and AI agents",
    "dApp directory API",
    "Query machine-readable dApp directory data with filters for Web3 application discovery, chain browsing, category browsing, and OpenAPI-backed client generation.",
    "View API Usage",
    "AI agent MCP server",
    "Give AI agents structured access to the Web3 applications directory with search, lookup, chains, categories, and resource URIs for reliable dApp discovery.",
    "View MCP Usage",
    "Documentation hub",
    "Test the API and MCP from the browser, then copy setup guides for IDEs, assistants, and agent runtimes.",
    "Open Documentation",
    `Page ${data.page} of ${data.totalPages} in the Web3 dApp directory. Filter by chain, category, or search term before calling the API or MCP server.`,
  ]

  const translatedPageStrings =
    locale === DEFAULT_LOCALE
      ? pageStrings
      : await translateTextBatch({ texts: pageStrings, targetLocale: locale })

  const [
    eyebrow = "",
    frameTitle = "",
    frameDescription = "",
    catalogLabel = "",
    catalogDetail = "",
    coverageLabel = "",
    coverageValue = "",
    coverageDetail = "",
    searchBadge = "",
    searchTitle = "",
    searchDescription = "",
    pageBadge = "",
    topChainsTitle = "",
    topCategoriesTitle = "",
    dataAccessBadge = "",
    dataAccessTitle = "",
    apiCardTitle = "",
    apiCardDescription = "",
    apiCardButton = "",
    mcpCardTitle = "",
    mcpCardDescription = "",
    mcpCardButton = "",
    docsCardTitle = "",
    docsCardDescription = "",
    docsCardButton = "",
    paginationDescription = "",
  ] = translatedPageStrings

  const visibleDescriptions = data.items.map(
    (item) => item.shortDescription || item.longDescription || commonCopy.noDescriptionAvailable,
  )
  const translatedDescriptions =
    locale === DEFAULT_LOCALE
      ? visibleDescriptions
      : await translateTextBatch({ texts: visibleDescriptions, targetLocale: locale })

  const categoryNames = [...new Set(data.categories.slice(0, 50).map((item) => item.name))]
  const translatedCategoryNames =
    locale === DEFAULT_LOCALE
      ? categoryNames
      : await translateTextBatch({ texts: categoryNames, targetLocale: locale })

  const categoryLabelMap = new Map(
    categoryNames.map((name, index) => [name, translatedCategoryNames[index] ?? name]),
  )

  const jsonLd = await getLocalizedWebPageJsonLd(locale, pageSeo.directory, "/")

  return (
    <>
      <SeoJsonLd data={jsonLd} />

      <PageFrame
        activePath="/"
        locale={locale}
        copy={commonCopy}
        eyebrow={eyebrow}
        title={frameTitle}
        description={frameDescription}
        aside={
          <>
            <StatCard label={catalogLabel} value={data.meta.dapps.toLocaleString()} detail={catalogDetail} />
            <StatCard label={coverageLabel} value={coverageValue} detail={coverageDetail} />
          </>
        }
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader className="gap-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="space-y-1">
                  <Badge variant="outline" className="w-fit">
                    {searchBadge}
                  </Badge>
                  <CardTitle>{searchTitle}</CardTitle>
                  <CardDescription>{searchDescription}</CardDescription>
                </div>

                <Badge variant="secondary">{pageBadge}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <DirectoryFilters
                initialQuery={q}
                initialChain={chain}
                initialCategory={category}
                chains={data.chains.slice(0, 50).map((item) => ({ value: item.name, label: item.name }))}
                categories={data.categories
                  .slice(0, 50)
                  .map((item) => ({ value: item.name, label: categoryLabelMap.get(item.name) ?? item.name }))}
                copy={commonCopy}
              />

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    {topChainsTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.chains.slice(0, 10).map((item) => (
                      <Pill
                        key={item.name}
                        href={buildQueryString(basePath, currentParams, {
                          chain: item.name,
                          page: 1,
                        })}
                      >
                        {item.name} · {item.count}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                    {topCategoriesTitle}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.categories.slice(0, 10).map((item) => (
                      <Pill
                        key={item.name}
                        href={buildQueryString(basePath, currentParams, {
                          category: item.name,
                          page: 1,
                        })}
                      >
                        {categoryLabelMap.get(item.name) ?? item.name} · {item.count}
                      </Pill>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                {dataAccessBadge}
              </Badge>
              <CardTitle>{dataAccessTitle}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Card size="sm">
                <CardHeader>
                  <CardTitle>{apiCardTitle}</CardTitle>
                  <CardDescription>{apiCardDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={localizePath("/documentation/api/endpoints", locale)}>
                      {apiCardButton}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{mcpCardTitle}</CardTitle>
                  <CardDescription>{mcpCardDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={localizePath("/documentation/mcp", locale)}>
                      {mcpCardButton}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card size="sm">
                <CardHeader>
                  <CardTitle>{docsCardTitle}</CardTitle>
                  <CardDescription>{docsCardDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={localizePath("/documentation", locale)}>{docsCardButton}</Link>
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.items.map((item, index) => (
            <Card key={item.id} className="justify-between">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit">
                      {item.id}
                    </Badge>
                    <CardTitle className="text-xl">{item.name}</CardTitle>
                  </div>
                  {item.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.logoUrl}
                      alt={item.name}
                      className="size-12 rounded-lg border object-cover"
                    />
                  ) : null}
                </div>
                <CardDescription>{translatedDescriptions[index]}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {item.categories.slice(0, 3).map((value) => (
                    <Pill key={value}>{categoryLabelMap.get(value) ?? value}</Pill>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.chains.slice(0, 4).map((value) => (
                    <Pill key={value} variant="secondary">
                      {value}
                    </Pill>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="justify-between gap-3">
                <Badge variant="outline">
                  {item.sourceUrls?.length ?? 0} {commonCopy.sourceEntries}
                </Badge>
                {item.webUrl ? (
                  <Button asChild>
                    <a href={item.webUrl} target="_blank" rel="noreferrer">
                      {commonCopy.openSite}
                    </a>
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          ))}
        </section>

        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
            <CardDescription>{paginationDescription}</CardDescription>
            <div className="flex gap-3">
              {data.page > 1 ? (
                <Button variant="outline" asChild>
                  <Link href={buildQueryString(basePath, currentParams, { page: data.page - 1 })}>
                    {commonCopy.previous}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled className="opacity-40">
                  {commonCopy.previous}
                </Button>
              )}

              {data.page < data.totalPages ? (
                <Button variant="outline" asChild>
                  <Link href={buildQueryString(basePath, currentParams, { page: data.page + 1 })}>
                    {commonCopy.next}
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled className="opacity-40">
                  {commonCopy.next}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </PageFrame>
    </>
  )
}
