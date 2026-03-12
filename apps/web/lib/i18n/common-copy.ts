import { cache } from "react"

import { DEFAULT_LOCALE, type SupportedLocale } from "./config"
import { translateObjectText } from "./translate"

const ENGLISH_COMMON_COPY = {
  directory: "Directory",
  documentation: "Documentation",
  nexisDirectory: "Nexis Directory",
  headerTagline:
    "Machine-readable dApp directory, Web3 applications API, and AI agent MCP server.",
  language: "Language",
  browseDirectory: "Browse Directory",
  readDocumentation: "Read Documentation",
  inspectHttpApi: "Inspect HTTP API",
  inspectMcpServer: "Inspect MCP Server",
  open: "Open",
  faqBadge: "FAQ",
  faqTitle: "Frequently asked questions",
  faqDescription:
    "Short answers to the questions that usually come up while integrating the directory API, MCP server, or client configuration.",
  noParameters: "No parameters.",
  required: "required",
  optional: "optional",
  params: "params",
  pages: "Pages",
  sections: "Sections",
  hoverSectionHint: "Hover a section to open its submenu over the content area.",
  backToDirectory: "Back to directory",
  searchLiveCatalog: "Search the live dApp catalog.",
  searchPlaceholder: "Search names, chains, categories, descriptions",
  allChains: "All chains",
  allCategories: "All categories",
  apply: "Apply",
  reset: "Reset",
  previous: "Previous",
  next: "Next",
  noDescriptionAvailable: "No description available.",
  openSite: "Open site",
  sourceEntries: "source entries",
} as const

export type CommonCopy = typeof ENGLISH_COMMON_COPY

export const getCommonCopy = cache(async (locale: SupportedLocale): Promise<CommonCopy> => {
  if (locale === DEFAULT_LOCALE) {
    return ENGLISH_COMMON_COPY
  }

  return translateObjectText(
    ENGLISH_COMMON_COPY,
    locale,
    Object.keys(ENGLISH_COMMON_COPY) as Array<keyof CommonCopy>,
  )
})
