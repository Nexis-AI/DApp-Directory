type RuntimeEnv = Record<string, string | undefined>

export const DEFAULT_DOCUMENTATION_API_BASE_URL = "http://localhost:8787"
export const DEFAULT_DOCUMENTATION_MCP_HTTP_URL = "http://localhost:8788/mcp"

const normalizeConfiguredUrl = (value?: string) => {
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  try {
    return new URL(trimmed).toString().replace(/\/+$/, "")
  } catch {
    return undefined
  }
}

const getConfiguredHostname = (value?: string) => {
  const normalized = normalizeConfiguredUrl(value)
  if (!normalized) {
    return undefined
  }

  return new URL(normalized).hostname
}

export const getDocumentationApiBaseUrl = (env: RuntimeEnv = process.env) =>
  normalizeConfiguredUrl(env.NEXT_PUBLIC_DOCS_API_BASE_URL) ??
  DEFAULT_DOCUMENTATION_API_BASE_URL

export const getDocumentationMcpHttpUrl = (env: RuntimeEnv = process.env) =>
  normalizeConfiguredUrl(env.NEXT_PUBLIC_DOCS_MCP_HTTP_URL) ??
  DEFAULT_DOCUMENTATION_MCP_HTTP_URL

export const getDocumentationUpstreamHosts = (env: RuntimeEnv = process.env) =>
  [
    getConfiguredHostname(env.NEXT_PUBLIC_DOCS_API_BASE_URL),
    getConfiguredHostname(env.NEXT_PUBLIC_DOCS_MCP_HTTP_URL),
  ].filter((value, index, items): value is string => Boolean(value) && items.indexOf(value) === index)

export const replaceDocumentationApiBaseUrl = (
  value: string,
  env: RuntimeEnv = process.env,
) => value.replaceAll(DEFAULT_DOCUMENTATION_API_BASE_URL, getDocumentationApiBaseUrl(env))

export const replaceDocumentationMcpHttpUrl = (
  value: string,
  env: RuntimeEnv = process.env,
) => value.replaceAll(DEFAULT_DOCUMENTATION_MCP_HTTP_URL, getDocumentationMcpHttpUrl(env))

export const DOCUMENTATION_API_BASE_URL = getDocumentationApiBaseUrl()
export const DOCUMENTATION_MCP_HTTP_URL = getDocumentationMcpHttpUrl()
