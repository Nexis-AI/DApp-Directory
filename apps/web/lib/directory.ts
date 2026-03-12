export interface DirectoryItem {
  id: string
  slug: string
  name: string
  categories: string[]
  chains: string[]
  shortDescription: string
  longDescription: string
  webUrl: string | null
  logoUrl: string | null
  sourceUrls?: string[]
  updatedAt?: string
}

export interface DirectoryFilters {
  q?: string
  chain?: string
  category?: string
}

export interface PaginationOptions {
  page?: number
  pageSize: number
}

export interface PaginatedDirectory {
  items: DirectoryItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const includesText = (value: string, query: string) => value.toLowerCase().includes(query)

export const filterDirectoryItems = (
  items: DirectoryItem[],
  filters: DirectoryFilters,
): DirectoryItem[] => {
  const query = filters.q?.trim().toLowerCase() ?? ""
  const chain = filters.chain?.trim().toLowerCase() ?? ""
  const category = filters.category?.trim().toLowerCase() ?? ""

  return items.filter((item) => {
    if (chain && !item.chains.some((value) => value.toLowerCase() === chain)) {
      return false
    }

    if (category && !item.categories.some((value) => value.toLowerCase() === category)) {
      return false
    }

    if (!query) {
      return true
    }

    return [
      item.name,
      item.shortDescription,
      item.longDescription,
      item.categories.join(" "),
      item.chains.join(" "),
    ].some((value) => includesText(value, query))
  })
}

export const paginateDirectoryItems = (
  items: DirectoryItem[],
  { page = 1, pageSize }: PaginationOptions,
): PaginatedDirectory => {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    items: items.slice(start, start + pageSize),
    page: currentPage,
    pageSize,
    total,
    totalPages,
  }
}
