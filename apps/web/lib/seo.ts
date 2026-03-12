import type { Metadata } from "next"

import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getLocaleLanguageTag,
} from "./i18n/config"
import { localizePath } from "./i18n/pathnames"
import { translateObjectText, translateText, translateTextBatch } from "./i18n/translate"

interface DirectoryDatasetMeta {
  generatedAt: string
  dapps: number
  chains: number
  categories: number
  duplicateReviewItems: number
  sources: string[]
}

interface PageSeoConfig {
  title: string
  description: string
  keywords: string[]
}

const DEFAULT_SITE_URL = "https://nexis.network"

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || DEFAULT_SITE_URL

export const siteName = "Nexis dApp Directory"

export const siteDescription =
  "A machine-readable Web3 dApp directory for developers, researchers, and AI agents with decentralized application search, API access, and MCP server tooling."

export const siteKeywords = [
  "dApp directory",
  "Web3 dApp directory",
  "AI agent dApp directory",
  "Web3 applications directory",
  "decentralized application directory",
  "machine-readable Web3 directory",
  "dApp directory API",
  "Web3 app search engine",
  "AI agent directory data",
  "MCP server for dApp data",
  "Web3 application catalog",
  "decentralized app search",
]

export const pageSeo = {
  directory: {
    title: "Web3 dApp Directory for AI Agents, Developers, and Researchers",
    description:
      "Browse a machine-readable dApp directory of Web3 applications with chain, category, API, and MCP access for AI agents, app discovery, and automated research.",
    keywords: [
      "AI agent dApp directory",
      "Web3 applications directory",
      "decentralized application search",
      "machine-readable Web3 directory",
    ],
  },
  api: {
    title: "dApp Directory API and OpenAPI for Web3 Application Data",
    description:
      "Use the Nexis dApp directory API to search Web3 applications, retrieve decentralized app records, and power AI agents or custom clients with structured directory data.",
    keywords: [
      "dApp directory API",
      "OpenAPI dApp directory",
      "Web3 application API",
      "machine-readable dApp data",
    ],
  },
  mcp: {
    title: "AI Agent MCP Server for Web3 dApp Directory Access",
    description:
      "Connect AI agents to the Web3 dApp directory through MCP tools, resource URIs, and structured query patterns for search, lookup, chains, and categories.",
    keywords: [
      "AI agent dApp directory",
      "MCP server for dApp data",
      "Web3 AI agent tools",
      "AI agent Web3 applications directory",
    ],
  },
  documentation: {
    title: "Documentation Hub for the dApp Directory API and MCP Server",
    description:
      "Test the dApp directory API and MCP server, copy integration examples, and connect the Web3 application directory to IDEs, AI assistants, and agent workflows.",
    keywords: [
      "dApp directory documentation",
      "MCP client setup",
      "Web3 application API examples",
      "AI agent integration guide",
    ],
  },
  gettingStarted: {
    title: "Getting Started with the Web3 dApp Directory API and MCP Server",
    description:
      "Run the Nexis dApp directory locally, validate the HTTP API and MCP server, and make your first Web3 application search requests.",
    keywords: [
      "dApp directory getting started",
      "MCP server setup",
      "Web3 directory quickstart",
      "dApp API local development",
    ],
  },
  apiReference: {
    title: "HTTP API Guide for the Web3 dApp Directory",
    description:
      "Understand the dApp directory HTTP API, search filters, response model, and implementation patterns for apps, dashboards, and automation.",
    keywords: [
      "Web3 dApp API guide",
      "dApp directory HTTP API",
      "Web3 application search API",
      "decentralized application API guide",
    ],
  },
  apiEndpoints: {
    title: "Endpoint Reference for the dApp Directory API",
    description:
      "Review every dApp directory endpoint, query parameter, and request example from the generated OpenAPI contract.",
    keywords: [
      "dApp API endpoint reference",
      "OpenAPI dApp directory reference",
      "Web3 API endpoints",
      "directory API parameters",
    ],
  },
  mcpOverview: {
    title: "MCP Guide for AI Agent Access to the Web3 dApp Directory",
    description:
      "Learn how the MCP server exposes Web3 dApp directory search, exact lookup, chains, categories, and machine-readable resources for AI agents.",
    keywords: [
      "MCP Web3 guide",
      "AI agent dApp directory MCP",
      "MCP dApp tools",
      "Web3 AI agent MCP server",
    ],
  },
  mcpClients: {
    title: "Client Setup for the dApp Directory MCP Server",
    description:
      "Configure the Nexis MCP server in Cursor, Claude, Codex, Gemini, ChatGPT, and other AI tooling clients with local or remote transports.",
    keywords: [
      "MCP client setup",
      "Cursor MCP setup",
      "Claude MCP config",
      "Codex MCP configuration",
    ],
  },
  useCases: {
    title: "Use Cases for the Web3 dApp Directory API and MCP Server",
    description:
      "See when to use the dApp directory API versus the MCP server for AI agents, discovery products, analytics, automation, and internal tools.",
    keywords: [
      "dApp directory use cases",
      "API vs MCP guide",
      "AI agent Web3 directory workflows",
      "Web3 application discovery use cases",
    ],
  },
  implementationGuides: {
    title: "Implementation Guides for the Web3 dApp Directory",
    description:
      "Follow practical integration guides for Next.js, backend jobs, internal tools, and AI agent runtimes using the dApp directory data surfaces.",
    keywords: [
      "dApp directory implementation guide",
      "Web3 API integration guide",
      "AI agent integration guide",
      "directory data implementation examples",
    ],
  },
  examples: {
    title: "Examples for the Web3 dApp Directory API and MCP Workflows",
    description:
      "Copy-ready code snippets and request patterns for the Web3 dApp directory API, MCP server, and app or agent integrations.",
    keywords: [
      "dApp directory examples",
      "Web3 API code samples",
      "MCP examples",
      "AI agent dApp examples",
    ],
  },
} satisfies Record<string, PageSeoConfig>

const buildKeywordSet = (keywords: string[]) =>
  [...new Set([...siteKeywords, ...keywords])]

const buildAlternates = (pathname: string, locale: SupportedLocale) => ({
  canonical: localizePath(pathname, locale),
  languages: Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [getLocaleLanguageTag(locale), localizePath(pathname, locale)]),
  ),
})

export const buildSiteMetadata = (): Metadata => ({
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: siteName,
  description: siteDescription,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteName,
    description: siteDescription,
    url: "/",
    siteName,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
})

export const getLocalizedSiteMetadata = async (
  locale: SupportedLocale,
): Promise<Metadata> => {
  if (locale === DEFAULT_LOCALE) {
    return {
      ...buildSiteMetadata(),
      alternates: buildAlternates("/", locale),
      openGraph: {
        ...buildSiteMetadata().openGraph,
        locale: getLocaleLanguageTag(locale).replace("-", "_"),
        url: localizePath("/", locale),
      },
    }
  }

  const [title, description, keywords] = await Promise.all([
    translateText({ text: siteName, targetLocale: locale }),
    translateText({ text: siteDescription, targetLocale: locale }),
    translateTextBatch({ texts: siteKeywords, targetLocale: locale }),
  ])

  return {
    metadataBase: new URL(siteUrl),
    applicationName: title,
    title,
    description,
    keywords,
    alternates: buildAlternates("/", locale),
    openGraph: {
      title,
      description,
      url: localizePath("/", locale),
      siteName: title,
      type: "website",
      locale: getLocaleLanguageTag(locale).replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: buildSiteMetadata().robots,
  }
}

export const buildPageMetadata = (
  config: PageSeoConfig,
  pathname: string,
): Metadata => ({
  title: config.title,
  description: config.description,
  keywords: buildKeywordSet(config.keywords),
  alternates: {
    canonical: pathname,
  },
  openGraph: {
    title: config.title,
    description: config.description,
    url: pathname,
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: config.title,
    description: config.description,
  },
})

export const getLocalizedPageMetadata = async (
  locale: SupportedLocale,
  config: PageSeoConfig,
  pathname: string,
): Promise<Metadata> => {
  if (locale === DEFAULT_LOCALE) {
    return {
      ...buildPageMetadata(config, localizePath(pathname, locale)),
      alternates: buildAlternates(pathname, locale),
      openGraph: {
        ...buildPageMetadata(config, localizePath(pathname, locale)).openGraph,
        locale: getLocaleLanguageTag(locale).replace("-", "_"),
      },
    }
  }

  const translatedConfig = await translateObjectText(
    config,
    locale,
    ["title", "description", "keywords"],
  )

  const localizedPath = localizePath(pathname, locale)

  return {
    title: translatedConfig.title,
    description: translatedConfig.description,
    keywords: buildKeywordSet(translatedConfig.keywords),
    alternates: buildAlternates(pathname, locale),
    openGraph: {
      title: translatedConfig.title,
      description: translatedConfig.description,
      url: localizedPath,
      siteName,
      type: "website",
      locale: getLocaleLanguageTag(locale).replace("-", "_"),
    },
    twitter: {
      card: "summary_large_image",
      title: translatedConfig.title,
      description: translatedConfig.description,
    },
  }
}

const absoluteUrl = (pathname: string) =>
  new URL(pathname, `${siteUrl}/`).toString()

export const buildWebSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  description: siteDescription,
  url: siteUrl,
  inLanguage: "en-US",
  keywords: siteKeywords,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
})

export const getLocalizedWebSiteJsonLd = async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return {
      ...buildWebSiteJsonLd(),
      url: `${siteUrl}${localizePath("/", locale)}`,
    }
  }

  const [name, description, keywords] = await Promise.all([
    translateText({ text: siteName, targetLocale: locale }),
    translateText({ text: siteDescription, targetLocale: locale }),
    translateTextBatch({ texts: siteKeywords, targetLocale: locale }),
  ])

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    description,
    url: `${siteUrl}${localizePath("/", locale)}`,
    inLanguage: getLocaleLanguageTag(locale),
    keywords,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}${localizePath("/", locale)}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
}

export const buildDatasetJsonLd = (meta: DirectoryDatasetMeta) => ({
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Nexis Web3 dApp Directory Data",
  description: `Machine-readable Web3 dApp directory data for AI agents, developers, and researchers. Browse ${meta.dapps.toLocaleString()} decentralized applications across ${meta.chains.toLocaleString()} chains and ${meta.categories.toLocaleString()} categories.`,
  url: siteUrl,
  isAccessibleForFree: true,
  dateModified: meta.generatedAt,
  keywords: buildKeywordSet([
    "dApp directory API",
    "machine-readable Web3 directory",
    "AI agent directory data",
  ]),
  creator: {
    "@type": "Organization",
    name: "Nexis",
    url: siteUrl,
  },
  includedInDataCatalog: {
    "@type": "DataCatalog",
    name: siteName,
    url: siteUrl,
  },
  distribution: [
    {
      "@type": "DataDownload",
      name: "OpenAPI dApp directory schema",
      contentUrl: absoluteUrl("/openapi.json"),
      encodingFormat: "application/json",
    },
    {
      "@type": "DataDownload",
      name: "dApp directory API endpoint",
      contentUrl: absoluteUrl("/v1/dapps"),
      encodingFormat: "application/json",
    },
  ],
})

export const getLocalizedDatasetJsonLd = async (
  locale: SupportedLocale,
  meta: DirectoryDatasetMeta,
) => {
  if (locale === DEFAULT_LOCALE) {
    return {
      ...buildDatasetJsonLd(meta),
      url: `${siteUrl}${localizePath("/", locale)}`,
    }
  }

  const [description, name] = await Promise.all([
    translateText({
      text: `Machine-readable Web3 dApp directory data for AI agents, developers, and researchers. Browse ${meta.dapps.toLocaleString()} decentralized applications across ${meta.chains.toLocaleString()} chains and ${meta.categories.toLocaleString()} categories.`,
      targetLocale: locale,
    }),
    translateText({ text: "Nexis Web3 dApp Directory Data", targetLocale: locale }),
  ])

  return {
    ...buildDatasetJsonLd(meta),
    name,
    description,
    url: `${siteUrl}${localizePath("/", locale)}`,
  }
}

export const buildWebPageJsonLd = (
  config: PageSeoConfig,
  pathname: string,
) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: config.title,
  description: config.description,
  url: absoluteUrl(pathname),
  keywords: buildKeywordSet(config.keywords),
  isPartOf: {
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
  },
  about: buildKeywordSet(config.keywords).slice(0, 8),
})

export const getLocalizedWebPageJsonLd = async (
  locale: SupportedLocale,
  config: PageSeoConfig,
  pathname: string,
) => {
  if (locale === DEFAULT_LOCALE) {
    return {
      ...buildWebPageJsonLd(config, localizePath(pathname, locale)),
      url: absoluteUrl(localizePath(pathname, locale)),
    }
  }

  const translatedConfig = await translateObjectText(
    config,
    locale,
    ["title", "description", "keywords"],
  )

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: translatedConfig.title,
    description: translatedConfig.description,
    url: absoluteUrl(localizePath(pathname, locale)),
    keywords: buildKeywordSet(translatedConfig.keywords),
    inLanguage: getLocaleLanguageTag(locale),
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: `${siteUrl}${localizePath("/", locale)}`,
    },
    about: buildKeywordSet(translatedConfig.keywords).slice(0, 8),
  }
}
