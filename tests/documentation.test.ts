import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { describe, expect, test } from "vitest"

import {
  buildDocumentationGatewayUrl,
  runMcpGatewayRequest,
} from "../apps/web/lib/documentation-gateway.js"
import {
  DOCS_HEADER_LINKS,
  DOCS_NAV_GROUPS,
  LEGACY_DOC_REDIRECTS,
} from "../apps/web/lib/documentation-nav.js"
import { pageSeo } from "../apps/web/lib/seo.js"

const readText = (relativePath: string) =>
  readFile(resolve(process.cwd(), relativePath), "utf8")

const catalog = [
  {
    id: "dapp_000001",
    slug: "uniswap",
    name: "Uniswap",
    categories: ["DeFi"],
    chains: ["Base", "Ethereum"],
    shortDescription: "Swap tokens.",
    longDescription: "Cross-chain token swaps and liquidity.",
    webUrl: "https://app.uniswap.org",
    logoUrl: "https://example.com/uniswap.png",
    sourceUrls: ["https://example.com/uniswap"],
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "dapp_000002",
    slug: "lens",
    name: "Lens",
    categories: ["Social"],
    chains: ["Polygon"],
    shortDescription: "Social graph.",
    longDescription: "Decentralized social platform.",
    webUrl: "https://lens.xyz",
    logoUrl: "https://example.com/lens.png",
    sourceUrls: ["https://example.com/lens"],
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
]

const chains = [
  { name: "Base", count: 1 },
  { name: "Ethereum", count: 1 },
  { name: "Polygon", count: 1 },
]

const categories = [
  { name: "DeFi", count: 1 },
  { name: "Social", count: 1 },
]

describe("documentation navigation", () => {
  test("exposes grouped documentation routes for the sidebar and header", () => {
    expect(DOCS_HEADER_LINKS.map((item) => item.href)).toEqual([
      "/documentation",
      "/documentation/getting-started",
      "/documentation/api",
      "/documentation/mcp",
      "/documentation/use-cases",
      "/documentation/examples",
    ])

    expect(DOCS_NAV_GROUPS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Start",
          items: expect.arrayContaining([
            expect.objectContaining({ href: "/documentation" }),
            expect.objectContaining({ href: "/documentation/getting-started" }),
          ]),
        }),
        expect.objectContaining({
          title: "API",
          items: expect.arrayContaining([
            expect.objectContaining({ href: "/documentation/api" }),
            expect.objectContaining({ href: "/documentation/api/endpoints" }),
          ]),
        }),
        expect.objectContaining({
          title: "MCP",
          items: expect.arrayContaining([
            expect.objectContaining({ href: "/documentation/mcp" }),
            expect.objectContaining({ href: "/documentation/mcp/clients" }),
            expect.objectContaining({ href: "/documentation/mcp/clients/cursor" }),
            expect.objectContaining({ href: "/documentation/mcp/clients/claude" }),
            expect.objectContaining({ href: "/documentation/mcp/clients/chatgpt" }),
          ]),
        }),
        expect.objectContaining({
          title: "Guides",
          items: expect.arrayContaining([
            expect.objectContaining({ href: "/documentation/use-cases" }),
            expect.objectContaining({ href: "/documentation/implementation-guides" }),
            expect.objectContaining({ href: "/documentation/examples" }),
          ]),
        }),
      ]),
    )
  })

  test("keeps the shared header focused on directory and documentation", async () => {
    const source = await readText("apps/web/components/site-header.tsx")

    expect(source).toContain('href: "/documentation"')
    expect(source).toContain('label: "Documentation"')
    expect(source).not.toContain('label: "API Usage"')
    expect(source).not.toContain('label: "MCP Usage"')
  })

  test("redirects legacy reference URLs to canonical documentation routes", async () => {
    const [apiRoute, mcpRoute] = await Promise.all([
      readText("apps/web/app/api-usage/page.tsx"),
      readText("apps/web/app/mcp-usage/page.tsx"),
    ])

    expect(LEGACY_DOC_REDIRECTS).toEqual({
      "/api-usage": "/documentation/api/endpoints",
      "/mcp-usage": "/documentation/mcp",
    })
    expect(apiRoute).toContain('redirect("/documentation/api/endpoints")')
    expect(mcpRoute).toContain('redirect("/documentation/mcp")')
  })

  test("renders the documentation shell without the removed marketing copy", async () => {
    const shell = await readText("apps/web/components/documentation-layout-shell.tsx")

    expect(shell).not.toContain(
      "Integration docs for the dApp directory, HTTP API, and MCP server.",
    )
    expect(shell).not.toContain(
      "Navigate setup, endpoint reference, MCP tooling, client configuration, implementation guides, and runnable examples from one documentation shell.",
    )
    expect(shell).not.toContain(
      "Machine-readable dApp directory, Web3 applications API, and AI agent MCP server.",
    )
  })

  test("uses the sidebar app-shell pattern for documentation navigation", async () => {
    const shell = await readText("apps/web/components/documentation-layout-shell.tsx")

    expect(shell).toContain("SidebarProvider")
    expect(shell).toContain("SidebarInset")
    expect(shell).toContain("SidebarTrigger")
  })

  test("uses a hover-driven sidebar overlay without numeric nav badges", async () => {
    const sidebar = await readText("apps/web/components/sidebar-05/documentation-sidebar.tsx")

    expect(sidebar).toContain("onMouseEnter")
    expect(sidebar).toContain('style={{ left: "var(--sidebar-width)" }}')
    expect(sidebar).toContain(
      'fixed inset-y-0 z-30 hidden w-80 border-e bg-sidebar text-sidebar-foreground md:flex',
    )
    expect(sidebar).not.toContain('calc(var(--sidebar-width) + 1rem)')
    expect(sidebar).not.toContain("rounded-xl")
    expect(sidebar).not.toContain("SidebarMenuBadge")
  })
})

describe("documentation SEO", () => {
  test("defines metadata for the documentation hub", () => {
    expect(pageSeo.documentation).toMatchObject({
      title: expect.stringContaining("Documentation"),
      description: expect.stringContaining("MCP"),
    })
  })
})

describe("documentation HTTP gateway", () => {
  test("normalizes relative paths against allowed hosts", () => {
    const url = buildDocumentationGatewayUrl(
      "http://localhost:8787",
      "v1/dapps?limit=5",
      ["localhost"],
    )

    expect(url.toString()).toBe("http://localhost:8787/v1/dapps?limit=5")
  })

  test("rejects upstream hosts outside the allowlist", () => {
    expect(() =>
      buildDocumentationGatewayUrl(
        "https://example.com",
        "/v1/dapps",
        ["localhost", "127.0.0.1"],
      ),
    ).toThrow(/Unsupported host/i)
  })
})

describe("documentation MCP gateway", () => {
  test("executes tool calls against the documented MCP contract", () => {
    const result = runMcpGatewayRequest(
      { catalog, chains, categories },
      {
        type: "tool",
        name: "dapps_search",
        arguments: {
          q: "swap",
          chain: "Base",
          limit: 5,
        },
      },
    )

    expect(result.target).toBe("dapps_search")
    expect(JSON.parse(result.payload)).toEqual([
      expect.objectContaining({
        id: "dapp_000001",
        slug: "uniswap",
      }),
    ])
  })

  test("resolves resource templates with stable ids", () => {
    const result = runMcpGatewayRequest(
      { catalog, chains, categories },
      {
        type: "resource",
        uri: "catalog://dapps/uniswap",
      },
    )

    expect(result.target).toBe("catalog://dapps/uniswap")
    expect(JSON.parse(result.payload)).toMatchObject({
      id: "dapp_000001",
      slug: "uniswap",
    })
  })
})
