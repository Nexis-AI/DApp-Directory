import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { describe, expect, test } from "vitest"

import {
  buildDatasetJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
  pageSeo,
  siteKeywords,
} from "../apps/web/lib/seo.js"
import { THEME_OPTIONS } from "../apps/web/components/theme-switcher.js"

const readText = (relativePath: string) =>
  readFile(resolve(process.cwd(), relativePath), "utf8")

describe("theme switcher", () => {
  test("offers system, light, and dark modes", () => {
    expect(THEME_OPTIONS).toEqual([
      expect.objectContaining({ value: "system", label: "System" }),
      expect.objectContaining({ value: "light", label: "Light" }),
      expect.objectContaining({ value: "dark", label: "Dark" }),
    ])
  })

  test("is mounted in the top header frame", async () => {
    const source = await readText("apps/web/components/site-header.tsx")

    expect(source).toContain("ThemeSwitcher")
  })
})

describe("SEO metadata", () => {
  test("targets dApp directory and AI agent discovery phrases", () => {
    expect(siteKeywords).toEqual(
      expect.arrayContaining([
        "dApp directory",
        "Web3 dApp directory",
        "AI agent dApp directory",
        "Web3 applications directory",
        "MCP server for dApp data",
      ]),
    )
  })

  test("builds canonical page metadata with search-friendly titles", () => {
    const metadata = buildPageMetadata(pageSeo.directory, "/")

    expect(metadata.title).toBe(pageSeo.directory.title)
    expect(metadata.description).toBe(pageSeo.directory.description)
    expect(metadata.alternates?.canonical).toBe("/")
    expect(metadata.openGraph).toMatchObject({
      title: pageSeo.directory.title,
      description: pageSeo.directory.description,
      url: "/",
      type: "website",
    })
    expect(metadata.twitter).toMatchObject({
      title: pageSeo.directory.title,
      description: pageSeo.directory.description,
    })
    expect(metadata.keywords).toEqual(
      expect.arrayContaining([
        "dApp directory",
        "AI agent dApp directory",
      ]),
    )
  })

  test("builds website and dataset structured data for the directory", () => {
    const websiteJsonLd = buildWebSiteJsonLd()
    const datasetJsonLd = buildDatasetJsonLd({
      generatedAt: "2026-03-10T20:07:00.000Z",
      dapps: 4232,
      chains: 430,
      categories: 92,
      duplicateReviewItems: 0,
      sources: ["defillama"],
    })
    const pageJsonLd = buildWebPageJsonLd(pageSeo.mcp, "/mcp-usage")

    expect(websiteJsonLd["@type"]).toBe("WebSite")
    expect(websiteJsonLd.name).toContain("dApp Directory")
    expect(websiteJsonLd.keywords).toEqual(
      expect.arrayContaining(["Web3 dApp directory", "AI agent dApp directory"]),
    )

    expect(datasetJsonLd["@type"]).toBe("Dataset")
    expect(datasetJsonLd.name).toContain("Web3 dApp Directory Data")
    expect(datasetJsonLd.description).toContain("AI agents")
    expect(datasetJsonLd.keywords).toEqual(
      expect.arrayContaining(["dApp directory API", "machine-readable Web3 directory"]),
    )

    expect(pageJsonLd["@type"]).toBe("WebPage")
    expect(pageJsonLd.name).toBe(pageSeo.mcp.title)
    expect(pageJsonLd.description).toBe(pageSeo.mcp.description)
  })
})
