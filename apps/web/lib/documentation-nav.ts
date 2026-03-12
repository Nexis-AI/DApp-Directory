import { CLIENT_GUIDES } from "./documentation-content"

export interface DocumentationNavItem {
  href: string
  label: string
  description?: string
}

export interface DocumentationNavGroup {
  id: "start" | "api" | "mcp" | "guides"
  title: string
  items: DocumentationNavItem[]
}

export const LEGACY_DOC_REDIRECTS = {
  "/api-usage": "/documentation/api/endpoints",
  "/mcp-usage": "/documentation/mcp",
} as const

export const DOCS_HEADER_LINKS: DocumentationNavItem[] = [
  {
    href: "/documentation",
    label: "Overview",
    description: "Documentation hub and route map.",
  },
  {
    href: "/documentation/getting-started",
    label: "Getting Started",
    description: "Run the API and MCP server locally.",
  },
  {
    href: "/documentation/api",
    label: "API",
    description: "HTTP API overview and integration patterns.",
  },
  {
    href: "/documentation/mcp",
    label: "MCP",
    description: "Agent-facing MCP capabilities and resources.",
  },
  {
    href: "/documentation/use-cases",
    label: "Use Cases",
    description: "Choose the right surface for your workflow.",
  },
  {
    href: "/documentation/examples",
    label: "Examples",
    description: "Copy-ready snippets and requests.",
  },
] as const

export const DOCS_NAV_GROUPS: DocumentationNavGroup[] = [
  {
    id: "start",
    title: "Start",
    items: [
      {
        href: "/documentation",
        label: "Overview",
        description: "Documentation hub, route map, and quick links.",
      },
      {
        href: "/documentation/getting-started",
        label: "Getting Started",
        description: "Local runtime commands, validation, and first checks.",
      },
    ],
  },
  {
    id: "api",
    title: "API",
    items: [
      {
        href: "/documentation/api",
        label: "API Overview",
        description: "HTTP surface, filters, response model, and integration advice.",
      },
      {
        href: "/documentation/api/endpoints",
        label: "Endpoint Reference",
        description: "All GET routes, parameters, and request examples.",
      },
    ],
  },
  {
    id: "mcp",
    title: "MCP",
    items: [
      {
        href: "/documentation/mcp",
        label: "MCP Overview",
        description: "Capabilities, tools, resources, and transport guidance.",
      },
      {
        href: "/documentation/mcp/clients",
        label: "Client Setup",
        description: "Client index plus tutorials for IDEs, assistants, and CLIs.",
      },
      ...CLIENT_GUIDES.map((guide) => ({
        href: `/documentation/mcp/clients/${guide.slug}`,
        label: guide.name,
        description: `${guide.transport} setup and verification tutorial.`,
      })),
    ],
  },
  {
    id: "guides",
    title: "Guides",
    items: [
      {
        href: "/documentation/use-cases",
        label: "Use Cases",
        description: "Agent workflows, indexing, discovery, analytics, and internal tools.",
      },
      {
        href: "/documentation/implementation-guides",
        label: "Implementation Guides",
        description: "Task-oriented app and agent integration instructions.",
      },
      {
        href: "/documentation/examples",
        label: "Examples",
        description: "Copy-ready code and end-to-end request samples.",
      },
    ],
  },
] as const
