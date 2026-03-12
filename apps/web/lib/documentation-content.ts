import { MCP_RESOURCES, MCP_TOOLS } from "./mcp"

export const LOCAL_API_BASE_URL = "http://localhost:8787"
export const LOCAL_MCP_HTTP_URL = "http://localhost:8788/mcp"

export const LOCAL_RUNTIME_COMMANDS = [
  {
    label: "HTTP API",
    command: "pnpm dev:http",
    description: "Starts the Fastify API at http://localhost:8787.",
  },
  {
    label: "MCP stdio",
    command: "pnpm dev:mcp",
    description: "Starts the FastMCP server with stdio transport for local clients.",
  },
  {
    label: "MCP HTTP",
    command: "MCP_TRANSPORT=http pnpm dev:mcp",
    description: "Exposes the MCP endpoint at http://localhost:8788/mcp for remote-capable clients.",
  },
] as const

export const HTTP_GATEWAY_PRESETS = [
  {
    label: "Health check",
    path: "/health",
  },
  {
    label: "Search DeFi on Base",
    path: "/v1/dapps?chain=Base&category=DeFi&limit=5",
  },
  {
    label: "OpenAPI document",
    path: "/openapi.json",
  },
] as const

export const MCP_TOOL_PRESETS = MCP_TOOLS.map((tool) => ({
  name: tool.name,
  sampleQuery: tool.sampleQuery,
}))

export const MCP_RESOURCE_PRESETS = [
  "catalog://dapps/chains",
  "catalog://dapps/categories",
  "catalog://dapps/uniswap",
] as const

export interface UsageExample {
  badge: string
  title: string
  description: string
  code: string
}

export const USAGE_EXAMPLES: UsageExample[] = [
  {
    badge: "Next.js",
    title: "Call the API in a server component or route handler",
    description:
      "Use the generated HTTP surface directly from your app server and let Next cache the response.",
    code: `const response = await fetch(
  "http://localhost:8787/v1/dapps?chain=Base&category=DeFi&limit=12",
  { next: { revalidate: 300 } },
)

if (!response.ok) {
  throw new Error("Failed to load dApps")
}

const payload = await response.json()
const items = payload.data.items`,
  },
  {
    badge: "TypeScript",
    title: "Wrap the API in a typed helper",
    description:
      "Keep the envelope in one place and return plain directory items to the rest of your app.",
    code: `type Dapp = {
  id: string
  slug: string
  name: string
  categories: string[]
  chains: string[]
}

export async function searchDapps(query: string) {
  const response = await fetch(
    \`http://localhost:8787/v1/dapps?q=\${encodeURIComponent(query)}&limit=10\`,
  )

  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`)
  }

  const payload = (await response.json()) as {
    data: { items: Dapp[] }
  }

  return payload.data.items
}`,
  },
  {
    badge: "JavaScript",
    title: "Use the read-only API from Node or the browser",
    description:
      "The list endpoints are plain JSON, so a bare fetch is enough for scripts and dashboards.",
    code: `const response = await fetch(
  "http://localhost:8787/v1/dapps?q=prediction%20market&limit=5",
)

const payload = await response.json()
console.log(payload.meta.total)
console.log(payload.data.items.map((item) => item.name))`,
  },
  {
    badge: "AI agents",
    title: "Expose the API as a tool inside an agent runtime",
    description:
      "If you do not need full MCP transport yet, wrap the HTTP API as a deterministic tool function for your agent.",
    code: `export async function dappsSearchTool({ q, chain, category, limit = 5 }) {
  const params = new URLSearchParams()
  if (q) params.set("q", q)
  if (chain) params.set("chain", chain)
  if (category) params.set("category", category)
  params.set("limit", String(limit))

  const response = await fetch(\`http://localhost:8787/v1/dapps?\${params}\`)
  const payload = await response.json()

  return payload.data.items.map((item) => ({
    id: item.id,
    name: item.name,
    chains: item.chains,
    categories: item.categories,
  }))
}`,
  },
]

export interface IntegrationGuide {
  name: string
  badge: string
  transport: string
  location: string
  steps: string[]
  code: string
  note: string
}

export const INTEGRATION_GUIDES: IntegrationGuide[] = [
  {
    name: "Cursor",
    badge: "IDE",
    transport: "stdio or HTTP",
    location: ".cursor/mcp.json or global Cursor MCP settings",
    steps: [
      "Start with stdio for local work, then switch to HTTP when you want a shared remote endpoint.",
      "Add the server to project-level MCP config so the whole repo can share the same tool name.",
    ],
    code: `{
  "mcpServers": {
    "nexis-dapps-directory": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/dApps-directory", "dev:mcp"]
    }
  }
}`,
    note:
      "Cursor documents both project and global MCP configuration. Use the HTTP endpoint only after starting the server with MCP_TRANSPORT=http.",
  },
  {
    name: "Claude",
    badge: "Assistant",
    transport: "stdio for local, HTTP for remote",
    location: "claude_desktop_config.json",
    steps: [
      "For local development, add a stdio server to Claude Desktop.",
      "For Claude.ai or shared environments, expose the MCP endpoint over HTTPS and register the remote server instead of localhost.",
    ],
    code: `{
  "mcpServers": {
    "nexis-dapps-directory": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/dApps-directory", "dev:mcp"]
    }
  }
}`,
    note:
      "Anthropic recommends HTTP servers for remote connections and treats SSE as deprecated where HTTP is available.",
  },
  {
    name: "Antigravity",
    badge: "Google",
    transport: "stdio",
    location: "~/.antigravity/mcp_config.json",
    steps: [
      "Open Antigravity settings, choose Extensions, then edit the MCP config file.",
      "Paste a standard stdio server entry that points at pnpm dev:mcp.",
    ],
    code: `{
  "mcpServers": {
    "nexis-dapps-directory": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/dApps-directory", "dev:mcp"]
    }
  }
}`,
    note:
      "Google's Antigravity docs currently describe editing mcp_config.json with the standard stdio server format.",
  },
  {
    name: "Codex",
    badge: "OpenAI",
    transport: "shared MCP config",
    location: "~/.codex/config.toml (managed by the CLI)",
    steps: [
      "Use the Codex CLI to add the server once instead of editing TOML by hand.",
      "The same config is consumed by Codex clients that share the local CLI setup.",
    ],
    code: `codex mcp add nexis-dapps-directory --scope user -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
    note:
      "OpenAI documents CLI-based MCP setup and shared configuration between Codex local surfaces.",
  },
  {
    name: "Gemini",
    badge: "CLI",
    transport: "stdio, HTTP, or SSE",
    location: "~/.gemini/settings.json",
    steps: [
      "Use the built-in Gemini CLI MCP commands so the entry lands in the right settings file automatically.",
      "Prefer HTTP only when you actually need a remote endpoint; stdio is the simplest local path.",
    ],
    code: `gemini mcp add nexis-dapps-directory \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
    note:
      "The Gemini CLI also supports HTTP and SSE with gemini mcp add --transport http|sse.",
  },
  {
    name: "ChatGPT",
    badge: "Remote",
    transport: "public HTTPS MCP endpoint",
    location: "ChatGPT settings or developer mode connector UI",
    steps: [
      "Run the MCP server in HTTP mode and put it behind a public HTTPS URL.",
      "Register the remote endpoint in ChatGPT developer mode or the connector flow, then verify tool discovery.",
    ],
    code: `MCP_TRANSPORT=http MCP_HOST=0.0.0.0 MCP_PORT=8788 pnpm dev:mcp`,
    note:
      "ChatGPT developer mode supports full MCP clients, but API and deep-research connector flows still expect search/fetch compatibility. This server currently exposes domain-specific tools such as dapps_search and dapps_get.",
  },
  {
    name: "Claude Code",
    badge: "CLI",
    transport: "stdio or HTTP",
    location: ".mcp.json or claude mcp commands",
    steps: [
      "Add the local stdio server with the Claude Code CLI so the entry is scoped correctly.",
      "Switch to --transport http only if you are connecting to a separately hosted endpoint.",
    ],
    code: `claude mcp add --transport stdio nexis-dapps-directory -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
    note:
      "Claude Code supports stdio, HTTP, and SSE. Anthropic now recommends HTTP instead of SSE when a remote server is needed.",
  },
  {
    name: "Codex CLI",
    badge: "CLI",
    transport: "stdio or HTTP",
    location: "~/.codex/config.toml",
    steps: [
      "Add the stdio server with codex mcp add for local development.",
      "Use codex mcp add-json if you want to register the HTTP endpoint instead of a local command.",
    ],
    code: `codex mcp add nexis-dapps-directory --scope user -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
    note:
      "Codex CLI is the source of truth for the shared Codex MCP configuration on disk.",
  },
  {
    name: "Codex VSCode extension",
    badge: "IDE",
    transport: "shared Codex CLI config",
    location: "Reuses the Codex CLI MCP configuration",
    steps: [
      "Add the server with the Codex CLI first.",
      "Reload the extension so it picks up the shared MCP server entry.",
    ],
    code: `codex mcp add nexis-dapps-directory --scope user -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
    note:
      "OpenAI documents that the Codex CLI and IDE extension share the same MCP configuration.",
  },
] as const

export interface DocumentationFaqItem {
  question: string
  answer: string
}

export interface ClientGuideDetail {
  slug: string
  summary: string
  tags: string[]
  prerequisites: string[]
  verification: string[]
  examples: UsageExample[]
  faqs: DocumentationFaqItem[]
}

export interface ClientGuide extends IntegrationGuide, ClientGuideDetail {}

const CLIENT_GUIDE_DETAILS: Record<string, ClientGuideDetail> = {
  Cursor: {
    slug: "cursor",
    summary:
      "Project-level MCP setup for an IDE workflow where developers need the dApp directory available during implementation and debugging.",
    tags: ["IDE", "Project config", "Local-first"],
    prerequisites: [
      "pnpm installed locally",
      "The dApps directory repo available on disk",
      "Cursor MCP support enabled",
    ],
    verification: [
      "Open Cursor MCP settings and confirm `nexis-dapps-directory` is listed.",
      "Run `dapps_search` with a simple query such as `Base` or `lending`.",
      "Confirm tool output contains structured JSON instead of markdown-only text.",
    ],
    examples: [
      {
        badge: "Project config",
        title: "Cursor project MCP entry",
        description: "Keep the server scoped to the repo so teammates share the same setup.",
        code: `{
  "mcpServers": {
    "nexis-dapps-directory": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/dApps-directory", "dev:mcp"]
    }
  }
}`,
      },
    ],
    faqs: [
      {
        question: "Should Cursor use stdio or HTTP first?",
        answer:
          "Start with stdio. Move to HTTP only when multiple users or remote environments need the same shared endpoint.",
      },
      {
        question: "Where should the config live?",
        answer:
          "Use a project-level `.cursor` MCP config when you want the whole repo to share a stable server name and command.",
      },
    ],
  },
  Claude: {
    slug: "claude",
    summary:
      "Desktop assistant setup for local MCP development, with a clean migration path to remote HTTP deployment when localhost is no longer sufficient.",
    tags: ["Assistant", "Desktop", "Local and remote"],
    prerequisites: [
      "Claude Desktop installed",
      "Local shell access to run `pnpm dev:mcp`",
      "Path to the dApps directory repo",
    ],
    verification: [
      "Restart Claude Desktop after editing the MCP config.",
      "Ask Claude to search for a known dApp like Uniswap.",
      "Check that Claude reaches for MCP tools instead of hallucinating directory data.",
    ],
    examples: [
      {
        badge: "Desktop config",
        title: "Claude Desktop stdio server",
        description: "Use this for local workstation development before exposing HTTP.",
        code: `{
  "mcpServers": {
    "nexis-dapps-directory": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/dApps-directory", "dev:mcp"]
    }
  }
}`,
      },
    ],
    faqs: [
      {
        question: "Does Claude Desktop need HTTP transport?",
        answer:
          "No. Stdio is usually the simplest and most reliable path for local Desktop usage.",
      },
      {
        question: "When should I switch Claude to HTTP?",
        answer:
          "Only when the client can reach a hosted HTTPS endpoint and you need remote or shared access instead of a local shell command.",
      },
    ],
  },
  Antigravity: {
    slug: "antigravity",
    summary:
      "Google Antigravity setup for users who want a local stdio MCP server exposed inside Google's desktop tooling.",
    tags: ["Google", "Desktop", "stdio"],
    prerequisites: [
      "Antigravity installed locally",
      "Access to `~/.antigravity/mcp_config.json`",
      "A working local `pnpm dev:mcp` command",
    ],
    verification: [
      "Save the JSON config and restart Antigravity.",
      "Open the extensions or MCP panel and confirm the server is listed.",
      "Run a simple search query through the tool catalog.",
    ],
    examples: [
      {
        badge: "Config file",
        title: "Antigravity MCP server entry",
        description: "Use the standard stdio contract in the Antigravity config file.",
        code: `{
  "mcpServers": {
    "nexis-dapps-directory": {
      "command": "pnpm",
      "args": ["--dir", "/absolute/path/to/dApps-directory", "dev:mcp"]
    }
  }
}`,
      },
    ],
    faqs: [
      {
        question: "Why not use HTTP here?",
        answer:
          "Antigravity can work well with local stdio. Use HTTP only if your deployment model requires a shared endpoint.",
      },
      {
        question: "What should I test first?",
        answer:
          "Run a simple `dapps_list_chains` call. It is small, deterministic, and confirms the server handshake is working.",
      },
    ],
  },
  Codex: {
    slug: "codex",
    summary:
      "General Codex setup for shared OpenAI MCP workflows where the local Codex tooling acts as the source of truth for the dApp directory server entry.",
    tags: ["OpenAI", "Shared config", "Codex"],
    prerequisites: [
      "Codex installed and authenticated",
      "A local checkout of the dApps directory repo",
      "Permission to update the shared Codex MCP config",
    ],
    verification: [
      "Run `codex mcp list` and confirm the server appears.",
      "Restart any Codex surfaces that read the shared config.",
      "Test a `dapps_get` lookup against a known slug like `uniswap`.",
    ],
    examples: [
      {
        badge: "CLI",
        title: "Register the shared Codex MCP server",
        description: "Add the server once and let Codex-based clients reuse the same definition.",
        code: `codex mcp add nexis-dapps-directory --scope user -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
      },
    ],
    faqs: [
      {
        question: "How is this different from the Codex CLI page?",
        answer:
          "This page covers the shared Codex configuration model. The CLI page focuses on direct CLI usage and verification commands.",
      },
      {
        question: "Do I need to edit TOML directly?",
        answer:
          "No. Prefer `codex mcp add` so the configuration stays valid and consistent with Codex tooling.",
      },
    ],
  },
  Gemini: {
    slug: "gemini",
    summary:
      "Gemini CLI setup for teams that want flexible transport choices but still want to start with the simplest local path.",
    tags: ["CLI", "Google", "stdio or HTTP"],
    prerequisites: [
      "Gemini CLI installed",
      "A working local MCP server command",
      "Access to the repo path used by the CLI",
    ],
    verification: [
      "Run `gemini mcp list` after adding the server.",
      "Ask Gemini to search for a DeFi dApp on Base.",
      "Confirm the response is grounded in MCP tool output.",
    ],
    examples: [
      {
        badge: "CLI",
        title: "Gemini local stdio setup",
        description: "Use the built-in CLI workflow instead of editing the settings JSON manually.",
        code: `gemini mcp add nexis-dapps-directory \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
      },
    ],
    faqs: [
      {
        question: "Which transport should I choose?",
        answer:
          "Use stdio for local workflows. Switch to HTTP only when Gemini needs to reach a remote server outside your machine.",
      },
      {
        question: "Does Gemini support SSE too?",
        answer:
          "Yes, but the local setup here is intentionally optimized for stdio first because it is simpler to validate.",
      },
    ],
  },
  ChatGPT: {
    slug: "chatgpt",
    summary:
      "Remote MCP deployment guidance for ChatGPT and similar cloud surfaces that need a publicly reachable HTTPS endpoint instead of localhost.",
    tags: ["Remote", "HTTPS", "Cloud client"],
    prerequisites: [
      "Ability to host the MCP server publicly over HTTPS",
      "Access to ChatGPT developer mode or connector configuration",
      "A deployment path for the dApps directory MCP server",
    ],
    verification: [
      "Expose the MCP server through a public HTTPS URL.",
      "Register the remote endpoint and confirm ChatGPT discovers the tool list.",
      "Run a safe read-only request like `dapps_search` before broader prompting.",
    ],
    examples: [
      {
        badge: "Server command",
        title: "Start the MCP server in HTTP mode",
        description: "Use this as the basis for a hosted deployment behind a public proxy or app platform.",
        code: `MCP_TRANSPORT=http MCP_HOST=0.0.0.0 MCP_PORT=8788 pnpm dev:mcp`,
      },
    ],
    faqs: [
      {
        question: "Why can't ChatGPT use stdio?",
        answer:
          "Cloud-hosted ChatGPT surfaces cannot spawn a process on your machine, so they need a remotely reachable HTTPS MCP endpoint.",
      },
      {
        question: "Is localhost enough for testing?",
        answer:
          "Only for local browser experiments. Production ChatGPT connections need a public endpoint that the service can reach.",
      },
    ],
  },
  "Claude Code": {
    slug: "claude-code",
    summary:
      "Claude Code integration for terminal-centric development flows where the dApp directory should be available as a local MCP server during coding sessions.",
    tags: ["CLI", "Anthropic", "Developer workflow"],
    prerequisites: [
      "Claude Code installed",
      "Local access to run `pnpm dev:mcp`",
      "A repo path for the dApps directory",
    ],
    verification: [
      "Run `claude mcp list` or the equivalent server inspection command.",
      "Open a coding session and request a directory lookup through MCP.",
      "Confirm Claude Code uses the configured server entry.",
    ],
    examples: [
      {
        badge: "CLI",
        title: "Register the local stdio server",
        description: "Use the Claude CLI instead of editing JSON by hand when possible.",
        code: `claude mcp add --transport stdio nexis-dapps-directory -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
      },
    ],
    faqs: [
      {
        question: "Should Claude Code use HTTP or stdio?",
        answer:
          "Use stdio for local development. HTTP only makes sense when Claude Code is connecting to a separately hosted endpoint.",
      },
      {
        question: "Can I share this config with Claude Desktop?",
        answer:
          "They can point to the same underlying server command, but each client manages its own registration and settings surface.",
      },
    ],
  },
  "Codex CLI": {
    slug: "codex-cli",
    summary:
      "Direct Codex CLI integration for terminal workflows where you want to add, inspect, and validate the dApp directory MCP server from the command line.",
    tags: ["CLI", "OpenAI", "Local tooling"],
    prerequisites: [
      "Codex CLI installed",
      "Authenticated OpenAI tooling",
      "Access to the local repo path",
    ],
    verification: [
      "Run `codex mcp add` with the local command.",
      "Confirm the server appears in `codex mcp list`.",
      "Use a deterministic lookup like `dapps_get` to confirm the config is live.",
    ],
    examples: [
      {
        badge: "CLI",
        title: "Codex CLI add command",
        description: "Register the server in the user-scoped Codex config for local reuse.",
        code: `codex mcp add nexis-dapps-directory --scope user -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
      },
    ],
    faqs: [
      {
        question: "Why is there both a Codex page and a Codex CLI page?",
        answer:
          "The general Codex page explains the shared configuration model. This page focuses on direct CLI commands and validation steps.",
      },
      {
        question: "When should I use `add-json`?",
        answer:
          "Use it when you are registering a hosted HTTP server rather than a local stdio command.",
      },
    ],
  },
  "Codex VSCode extension": {
    slug: "codex-vscode",
    summary:
      "VS Code extension setup for developers who want the dApp directory MCP server available inside the editor through the shared Codex configuration.",
    tags: ["IDE", "VS Code", "Shared config"],
    prerequisites: [
      "Codex VS Code extension installed",
      "Codex CLI available locally",
      "A previously added shared MCP server entry",
    ],
    verification: [
      "Add the server with the Codex CLI first.",
      "Reload the VS Code extension host.",
      "Confirm the extension surfaces the server in its MCP or tools UI.",
    ],
    examples: [
      {
        badge: "Shared config",
        title: "Prepare the shared server entry first",
        description: "The extension reads the CLI-managed configuration rather than maintaining a separate copy.",
        code: `codex mcp add nexis-dapps-directory --scope user -- \\
  pnpm --dir /absolute/path/to/dApps-directory dev:mcp`,
      },
    ],
    faqs: [
      {
        question: "Do I configure the extension separately?",
        answer:
          "No. Add the server through the Codex CLI and let the extension consume that shared configuration.",
      },
      {
        question: "What if the extension does not pick it up?",
        answer:
          "Reload VS Code after the CLI command and confirm the CLI config itself contains the server entry first.",
      },
    ],
  },
}

export const CLIENT_GUIDES: ClientGuide[] = INTEGRATION_GUIDES.map((guide) => {
  const details = CLIENT_GUIDE_DETAILS[guide.name]

  if (!details) {
    throw new Error(`Missing client guide details for ${guide.name}`)
  }

  return {
    ...guide,
    ...details,
  }
})

export const CLIENT_GUIDE_INDEX_FAQS: DocumentationFaqItem[] = [
  {
    question: "Should teams start with the client hub or the individual tutorials?",
    answer:
      "Use the hub to pick the right client and transport model. Move into the individual pages once you know which tool your team is standardizing on.",
  },
  {
    question: "Why are there multiple Codex pages?",
    answer:
      "The shared Codex configuration, direct CLI workflow, and VS Code extension behavior are related but not identical. Splitting them avoids mixing distinct setup paths.",
  },
]

export function getClientGuideBySlug(slug: string) {
  return CLIENT_GUIDES.find((guide) => guide.slug === slug)
}

export const DOCUMENTATION_REFERENCE_CARDS = [
  {
    href: "/documentation/getting-started",
    title: "Getting started",
    description:
      "Run the HTTP API and MCP server locally, then validate both surfaces quickly.",
  },
  {
    href: "/documentation/api/endpoints",
    title: "HTTP API reference",
    description:
      "Full endpoint inventory derived from the generated OpenAPI document.",
  },
  {
    href: "/documentation/mcp",
    title: "MCP reference",
    description:
      "Tool and resource reference that mirrors the FastMCP registration.",
  },
  {
    href: "/documentation/implementation-guides",
    title: "Implementation guides",
    description:
      "Task-oriented setup guides for apps, services, automations, and agent runtimes.",
  },
] as const

export const DOCUMENTED_MCP_RESOURCES = MCP_RESOURCES

export interface DocumentationUseCase {
  badge: string
  title: string
  summary: string
  recommendation: string
  implementation: string[]
}

export const DOCUMENTATION_USE_CASES: DocumentationUseCase[] = [
  {
    badge: "Discovery",
    title: "Power a searchable Web3 application directory",
    summary:
      "Use the HTTP API when you need deterministic filters, pagination, and a conventional JSON contract for a frontend, dashboard, or search indexer.",
    recommendation:
      "Choose the HTTP API when your runtime already speaks REST and you want predictable cache and retry behavior.",
    implementation: [
      "Filter by chain, category, and text query through /v1/dapps.",
      "Store normalized records in your app cache or search layer.",
      "Use the OpenAPI document for generated clients or typed wrappers.",
    ],
  },
  {
    badge: "Agents",
    title: "Give AI agents a safe, read-only dApp discovery tool",
    summary:
      "Use the MCP server when the runtime supports tools or resources and you want a narrower, explicit contract for search, exact lookup, chains, and categories.",
    recommendation:
      "Choose MCP when an LLM runtime should decide when to search or fetch without being handed raw API details.",
    implementation: [
      "Register the server with stdio for local-first clients.",
      "Expose the HTTP transport only when you need remote access.",
      "Prefer dapps_search for discovery and dapps_get for stable lookup.",
    ],
  },
  {
    badge: "Ops",
    title: "Feed internal analytics, monitoring, or enrichment jobs",
    summary:
      "Use the HTTP API for scheduled jobs and the MCP server for analyst or assistant-driven exploration against the same catalog.",
    recommendation:
      "Pair both surfaces when humans and machines need the same source of truth in different runtimes.",
    implementation: [
      "Schedule periodic sync jobs against /v1/dapps and aggregate endpoints.",
      "Store chain and category counts for trend dashboards.",
      "Use MCP for analyst-facing assistants that need guided lookup.",
    ],
  },
] as const

export interface ImplementationGuideCard {
  badge: string
  title: string
  description: string
  steps: string[]
  code: string
}

export const IMPLEMENTATION_GUIDE_CARDS: ImplementationGuideCard[] = [
  {
    badge: "Next.js",
    title: "Build a directory page or server-rendered search route",
    description:
      "Use server components or route handlers to fetch directory data and cache it with predictable invalidation.",
    steps: [
      "Call the HTTP API from the server, not the browser, when you control the app backend.",
      "Translate query params into URLSearchParams once and keep the envelope parsing in one helper.",
      "Revalidate at the route level so the directory stays fresh without hammering the API.",
    ],
    code: `const params = new URLSearchParams({
  chain: "Base",
  category: "DeFi",
  limit: "12",
})

const response = await fetch(
  \`http://localhost:8787/v1/dapps?\${params}\`,
  { next: { revalidate: 300 } },
)

const payload = await response.json()
return payload.data.items`,
  },
  {
    badge: "Backend",
    title: "Use the API from a worker, cron, or ETL pipeline",
    description:
      "Keep the dApp catalog in sync with your internal database, analytics layer, or search service.",
    steps: [
      "Query the API with exact filters for the slice you need.",
      "Normalize the payload once before persisting it internally.",
      "Track the generatedAt timestamp from metadata to avoid stale refresh assumptions.",
    ],
    code: `const response = await fetch("http://localhost:8787/v1/dapps?limit=100")
const payload = await response.json()

for (const item of payload.data.items) {
  await upsertDirectoryRecord(item)
}`,
  },
  {
    badge: "Agent runtime",
    title: "Wrap the catalog as tools for deterministic agent steps",
    description:
      "Use either the MCP server directly or a thin HTTP wrapper when the agent runtime needs explicit, stable actions.",
    steps: [
      "Start with read-only search and lookup capabilities.",
      "Return compact result objects to keep tool payloads efficient.",
      "Escalate to full MCP transport when your client already supports it.",
    ],
    code: `export async function findBaseDapps() {
  const response = await fetch(
    "http://localhost:8787/v1/dapps?chain=Base&limit=5",
  )
  const payload = await response.json()

  return payload.data.items.map((item) => ({
    id: item.id,
    name: item.name,
    categories: item.categories,
  }))
}`,
  },
] as const
