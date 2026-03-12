import { filterDirectoryItems, type DirectoryItem } from "./directory"
import type { CountSummary } from "./site-data"

export interface DocumentationGatewayDataset {
  catalog: DirectoryItem[]
  chains: CountSummary[]
  categories: CountSummary[]
}

export interface McpToolGatewayRequest {
  type: "tool"
  name: "dapps_search" | "dapps_get" | "dapps_list_chains" | "dapps_list_categories"
  arguments?: Record<string, unknown>
}

export interface McpResourceGatewayRequest {
  type: "resource"
  uri: string
}

export type McpGatewayRequest = McpToolGatewayRequest | McpResourceGatewayRequest

export interface McpGatewayResult {
  kind: "tool" | "resource"
  target: string
  payload: string
}

const normalizeHost = (value: string) => value.trim().toLowerCase()

const parseNumericValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return undefined
}

const readStringValue = (value: unknown) =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined

const findDapp = (catalog: DirectoryItem[], id: string) =>
  catalog.find((item) => item.id === id || item.slug === id)

export const buildDocumentationGatewayUrl = (
  baseUrl: string,
  path: string,
  allowedHosts: string[],
) => {
  const allowedHostSet = new Set(allowedHosts.map(normalizeHost))
  const normalizedBaseUrl = baseUrl.trim()
  if (!normalizedBaseUrl) {
    throw new Error("A base URL is required.")
  }

  const normalizedPath = path.trim() || "/"
  const isAbsolute = /^https?:\/\//i.test(normalizedPath)
  const base = new URL(normalizedBaseUrl)
  const upstream = isAbsolute
    ? new URL(normalizedPath)
    : new URL(
        normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`,
        base,
      )

  if (!["http:", "https:"].includes(upstream.protocol)) {
    throw new Error("Only HTTP and HTTPS upstreams are supported.")
  }

  if (upstream.username || upstream.password) {
    throw new Error("Credentials are not allowed in documentation gateway URLs.")
  }

  if (!allowedHostSet.has(normalizeHost(upstream.hostname))) {
    throw new Error(`Unsupported host '${upstream.hostname}' for the documentation gateway.`)
  }

  return upstream
}

const runSearchTool = (
  catalog: DirectoryItem[],
  args: Record<string, unknown>,
) => {
  const filtered = filterDirectoryItems(catalog, {
    q: readStringValue(args.q),
    chain: readStringValue(args.chain),
    category: readStringValue(args.category),
  })

  const parsedLimit = parseNumericValue(args.limit)
  const limit =
    typeof parsedLimit === "number"
      ? Math.min(100, Math.max(1, parsedLimit))
      : 20

  return JSON.stringify(filtered.slice(0, limit), null, 2)
}

const runGetTool = (catalog: DirectoryItem[], args: Record<string, unknown>) => {
  const id = readStringValue(args.id)
  if (!id) {
    throw new Error("The 'id' argument is required for dapps_get.")
  }

  const item = findDapp(catalog, id)
  if (!item) {
    return `dApp not found for id '${id}'.`
  }

  return JSON.stringify(item, null, 2)
}

const runResourceRequest = (
  data: DocumentationGatewayDataset,
  uri: string,
) => {
  if (uri === "catalog://dapps/index") {
    return JSON.stringify(data.catalog, null, 2)
  }

  if (uri === "catalog://dapps/chains") {
    return JSON.stringify(data.chains, null, 2)
  }

  if (uri === "catalog://dapps/categories") {
    return JSON.stringify(data.categories, null, 2)
  }

  const match = uri.match(/^catalog:\/\/dapps\/(.+)$/)
  if (!match) {
    throw new Error(`Unsupported MCP resource URI '${uri}'.`)
  }

  const id = match[1] ?? ""
  const item = findDapp(data.catalog, id)
  if (!item) {
    return JSON.stringify({ error: `dApp not found for id '${id}'.` }, null, 2)
  }

  return JSON.stringify(item, null, 2)
}

export const runMcpGatewayRequest = (
  data: DocumentationGatewayDataset,
  request: McpGatewayRequest,
): McpGatewayResult => {
  if (request.type === "resource") {
    return {
      kind: "resource",
      target: request.uri,
      payload: runResourceRequest(data, request.uri),
    }
  }

  const args = request.arguments ?? {}

  switch (request.name) {
    case "dapps_search":
      return {
        kind: "tool",
        target: request.name,
        payload: runSearchTool(data.catalog, args),
      }

    case "dapps_get":
      return {
        kind: "tool",
        target: request.name,
        payload: runGetTool(data.catalog, args),
      }

    case "dapps_list_chains":
      return {
        kind: "tool",
        target: request.name,
        payload: JSON.stringify(data.chains, null, 2),
      }

    case "dapps_list_categories":
      return {
        kind: "tool",
        target: request.name,
        payload: JSON.stringify(data.categories, null, 2),
      }

    default:
      throw new Error(`Unsupported MCP tool '${request.name}'.`)
  }
}
