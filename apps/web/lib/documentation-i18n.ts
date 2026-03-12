import { cache } from "react"

import {
  CLIENT_GUIDE_INDEX_FAQS,
  CLIENT_GUIDES,
  DOCUMENTATION_REFERENCE_CARDS,
  DOCUMENTATION_USE_CASES,
  HTTP_GATEWAY_PRESETS,
  IMPLEMENTATION_GUIDE_CARDS,
  LOCAL_RUNTIME_COMMANDS,
  MCP_RESOURCE_PRESETS,
  MCP_TOOL_PRESETS,
  USAGE_EXAMPLES,
  type ClientGuide,
  type DocumentationFaqItem,
  type DocumentationUseCase,
  type ImplementationGuideCard,
  type IntegrationGuide,
  type UsageExample,
} from "./documentation-content"
import {
  DOCS_HEADER_LINKS,
  DOCS_NAV_GROUPS,
  type DocumentationNavGroup,
  type DocumentationNavItem,
} from "./documentation-nav"
import {
  MCP_CAPABILITIES,
  MCP_RESOURCES,
  MCP_SERVER,
  MCP_TOOLS,
  type MpcResourceDoc,
  type MpcToolDoc,
} from "./mcp"
import { DEFAULT_LOCALE, type SupportedLocale } from "./i18n/config"
import { translateObjectText, translateTextBatch } from "./i18n/translate"

const ENGLISH_DOCUMENTATION_SHELL_COPY = {
  headerTitle: "Documentation",
  hoverHint: "Hover a section to open its submenu over the content area.",
  sectionsLabel: "Sections",
  pagesLabel: "Pages",
  backToDirectoryTitle: "Back to directory",
  backToDirectoryDescription: "Search the live dApp catalog.",
  currentPageFallback: "Documentation",
  groupSummaryStart:
    "Local setup, validation, and the fastest path into the catalog surfaces.",
  groupSummaryApi:
    "HTTP API overview, filters, response model, and endpoint-level reference.",
  groupSummaryMcp: "Agent-facing tools, resources, and client configuration tutorials.",
  groupSummaryGuides:
    "Use cases, implementation instructions, examples, and integration help.",
} as const

const translateNavItems = async (items: DocumentationNavItem[], locale: SupportedLocale) =>
  Promise.all(items.map((item) => translateObjectText(item, locale, ["label", "description"])))

const translateFaqs = async (items: DocumentationFaqItem[], locale: SupportedLocale) =>
  Promise.all(items.map((item) => translateObjectText(item, locale, ["question", "answer"])))

const translateUsageExamples = async (items: UsageExample[], locale: SupportedLocale) =>
  Promise.all(
    items.map((item) => translateObjectText(item, locale, ["badge", "title", "description"])),
  )

const translateMcpTools = async (items: MpcToolDoc[], locale: SupportedLocale) =>
  Promise.all(items.map((item) => translateObjectText(item, locale, ["description"])))

const translateMcpResources = async (items: MpcResourceDoc[], locale: SupportedLocale) =>
  Promise.all(items.map((item) => translateObjectText(item, locale, ["description"])))

const translateGuideCards = async (
  items: readonly ImplementationGuideCard[],
  locale: SupportedLocale,
) =>
  Promise.all(
    items.map((item) => translateObjectText(item, locale, ["badge", "title", "description", "steps"])),
  )

const translateUseCases = async (
  items: readonly DocumentationUseCase[],
  locale: SupportedLocale,
) =>
  Promise.all(
    items.map((item) =>
      translateObjectText(item, locale, [
        "badge",
        "title",
        "summary",
        "recommendation",
        "implementation",
      ]),
    ),
  )

const translateReferenceCards = async (
  items: readonly { href: string; title: string; description: string }[],
  locale: SupportedLocale,
) =>
  Promise.all(items.map((item) => translateObjectText(item, locale, ["title", "description"])))

const translateClientGuides = async (items: readonly ClientGuide[], locale: SupportedLocale) =>
  Promise.all(
    items.map(async (item) => ({
      ...(await translateObjectText(item, locale, [
        "badge",
        "transport",
        "location",
        "steps",
        "note",
        "summary",
        "tags",
        "prerequisites",
        "verification",
      ])),
      examples: await translateUsageExamples(item.examples, locale),
      faqs: await translateFaqs(item.faqs, locale),
    })),
  )

const translateRuntimeCards = async (
  items: readonly { label: string; command: string; description: string }[],
  locale: SupportedLocale,
) =>
  Promise.all(items.map((item) => translateObjectText(item, locale, ["label", "description"])))

const translateGatewayPresets = async (
  items: readonly { label: string; path: string }[],
  locale: SupportedLocale,
) => Promise.all(items.map((item) => translateObjectText(item, locale, ["label"])))

const translateToolPresets = async (
  items: readonly { name: string; sampleQuery: string }[],
  locale: SupportedLocale,
) => items

export const getDocumentationHeaderLinks = cache(
  async (locale: SupportedLocale): Promise<DocumentationNavItem[]> => {
    if (locale === DEFAULT_LOCALE) {
      return [...DOCS_HEADER_LINKS]
    }

    return translateNavItems(DOCS_HEADER_LINKS, locale)
  },
)

export const getDocumentationNavGroups = cache(
  async (locale: SupportedLocale): Promise<DocumentationNavGroup[]> => {
    if (locale === DEFAULT_LOCALE) {
      return [...DOCS_NAV_GROUPS]
    }

    return Promise.all(
      DOCS_NAV_GROUPS.map(async (group) => ({
        ...group,
        ...(await translateObjectText(group, locale, ["title"])),
        items: await translateNavItems(group.items, locale),
      })),
    )
  },
)

export const getLocalizedUsageExamples = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...USAGE_EXAMPLES]
  }

  return translateUsageExamples(USAGE_EXAMPLES, locale)
})

export const getLocalizedClientGuides = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...CLIENT_GUIDES]
  }

  return translateClientGuides(CLIENT_GUIDES, locale)
})

export const getLocalizedClientGuideBySlug = cache(
  async (locale: SupportedLocale, slug: string) => {
    const guides = await getLocalizedClientGuides(locale)
    return guides.find((guide) => guide.slug === slug)
  },
)

export const getLocalizedClientGuideIndexFaqs = cache(
  async (locale: SupportedLocale): Promise<DocumentationFaqItem[]> => {
    if (locale === DEFAULT_LOCALE) {
      return [...CLIENT_GUIDE_INDEX_FAQS]
    }

    return translateFaqs(CLIENT_GUIDE_INDEX_FAQS, locale)
  },
)

export const getLocalizedDocumentationReferenceCards = cache(
  async (locale: SupportedLocale) => {
    if (locale === DEFAULT_LOCALE) {
      return [...DOCUMENTATION_REFERENCE_CARDS]
    }

    return translateReferenceCards(DOCUMENTATION_REFERENCE_CARDS, locale)
  },
)

export const getLocalizedDocumentationUseCases = cache(
  async (locale: SupportedLocale): Promise<DocumentationUseCase[]> => {
    if (locale === DEFAULT_LOCALE) {
      return [...DOCUMENTATION_USE_CASES]
    }

    return translateUseCases(DOCUMENTATION_USE_CASES, locale)
  },
)

export const getLocalizedImplementationGuideCards = cache(
  async (locale: SupportedLocale): Promise<ImplementationGuideCard[]> => {
    if (locale === DEFAULT_LOCALE) {
      return [...IMPLEMENTATION_GUIDE_CARDS]
    }

    return translateGuideCards(IMPLEMENTATION_GUIDE_CARDS, locale)
  },
)

export const getLocalizedRuntimeCommands = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...LOCAL_RUNTIME_COMMANDS]
  }

  return translateRuntimeCards(LOCAL_RUNTIME_COMMANDS, locale)
})

export const getLocalizedHttpGatewayPresets = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...HTTP_GATEWAY_PRESETS]
  }

  return translateGatewayPresets(HTTP_GATEWAY_PRESETS, locale)
})

export const getLocalizedMcpToolPresets = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...MCP_TOOL_PRESETS]
  }

  return translateToolPresets(MCP_TOOL_PRESETS, locale)
})

export const getLocalizedMcpResourcePresets = cache(
  async (locale: SupportedLocale): Promise<string[]> => [...MCP_RESOURCE_PRESETS],
)

export const getLocalizedMcpServer = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return MCP_SERVER
  }

  return translateObjectText(MCP_SERVER, locale, ["instructions"])
})

export const getLocalizedMcpCapabilities = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...MCP_CAPABILITIES]
  }

  return translateTextBatch({
    texts: [...MCP_CAPABILITIES],
    targetLocale: locale,
  })
})

export const getLocalizedMcpTools = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...MCP_TOOLS]
  }

  return translateMcpTools(MCP_TOOLS, locale)
})

export const getLocalizedMcpResources = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return [...MCP_RESOURCES]
  }

  return translateMcpResources(MCP_RESOURCES, locale)
})

export const getDocumentationShellCopy = cache(async (locale: SupportedLocale) => {
  if (locale === DEFAULT_LOCALE) {
    return ENGLISH_DOCUMENTATION_SHELL_COPY
  }

  return translateObjectText(
    ENGLISH_DOCUMENTATION_SHELL_COPY,
    locale,
    Object.keys(ENGLISH_DOCUMENTATION_SHELL_COPY) as Array<
      keyof typeof ENGLISH_DOCUMENTATION_SHELL_COPY
    >,
  )
})
