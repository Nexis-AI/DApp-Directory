import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { cache } from "react"

import { getDocumentationApiBaseUrl } from "@/lib/documentation-config"
import {
  filterDirectoryItems,
  paginateDirectoryItems,
  type DirectoryFilters,
  type DirectoryItem,
} from "@/lib/directory"

export interface CountSummary {
  name: string
  count: number
}

export interface DirectoryMeta {
  generatedAt: string
  dapps: number
  chains: number
  categories: number
  duplicateReviewItems: number
  sources: string[]
}

export interface OpenApiDocument {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  paths: Record<
    string,
    {
      get?: {
        summary?: string
        parameters?: Array<{
          name: string
          in: string
          required?: boolean
          description?: string
          schema?: {
            type?: string
            default?: string | number | boolean
          }
        }>
      }
    }
  >
  servers?: Array<{ url: string }>
}

const resolveRepoFile = (relativePath: string): string => {
  const candidates = [
    process.cwd(),
    resolve(process.cwd(), ".."),
    resolve(process.cwd(), "../.."),
  ]

  for (const candidate of candidates) {
    const path = resolve(candidate, relativePath)
    if (existsSync(path)) {
      return path
    }
  }

  throw new Error(`Could not resolve '${relativePath}' from ${process.cwd()}`)
}

const readJson = async <T>(relativePath: string): Promise<T> => {
  const filePath = resolveRepoFile(relativePath)
  const contents = await readFile(filePath, "utf8")
  return JSON.parse(contents) as T
}

export const getDirectoryCatalog = cache(async () =>
  readJson<DirectoryItem[]>("data/generated/dapps.json"),
)

export const getDirectoryMeta = cache(async () =>
  readJson<DirectoryMeta>("data/generated/meta.json"),
)

export const getChainSummary = cache(async () =>
  readJson<CountSummary[]>("data/generated/chains.json"),
)

export const getCategorySummary = cache(async () =>
  readJson<CountSummary[]>("data/generated/categories.json"),
)

export const getOpenApiDocument = cache(async () =>
  {
    const document = await readJson<OpenApiDocument>("openapi/openapi.json")
    const serverUrl = getDocumentationApiBaseUrl()

    return {
      ...document,
      servers: [
        { url: serverUrl },
        ...(document.servers ?? []).filter((server) => server.url !== serverUrl),
      ],
    }
  },
)

export const getDirectoryPageData = async (
  filters: DirectoryFilters & { page?: number; pageSize?: number },
) => {
  const [catalog, meta, chains, categories] = await Promise.all([
    getDirectoryCatalog(),
    getDirectoryMeta(),
    getChainSummary(),
    getCategorySummary(),
  ])

  const filtered = filterDirectoryItems(catalog, filters)
  const pagination = paginateDirectoryItems(filtered, {
    page: filters.page,
    pageSize: filters.pageSize ?? 24,
  })

  return {
    meta,
    chains,
    categories,
    filteredCount: filtered.length,
    ...pagination,
  }
}
