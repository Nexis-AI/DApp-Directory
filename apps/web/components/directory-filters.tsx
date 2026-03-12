"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const ALL_CHAINS = "__all_chains__"
const ALL_CATEGORIES = "__all_categories__"

export function DirectoryFilters({
  initialQuery,
  initialChain,
  initialCategory,
  chains,
  categories,
  copy,
}: {
  initialQuery: string
  initialChain: string
  initialCategory: string
  chains: Array<{ value: string; label: string }>
  categories: Array<{ value: string; label: string }>
  copy: {
    searchPlaceholder: string
    allChains: string
    allCategories: string
    apply: string
    reset: string
  }
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [query, setQuery] = useState(initialQuery)
  const [chain, setChain] = useState(initialChain || ALL_CHAINS)
  const [category, setCategory] = useState(initialCategory || ALL_CATEGORIES)

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (query.trim()) {
      params.set("q", query.trim())
    }

    if (chain !== ALL_CHAINS) {
      params.set("chain", chain)
    }

    if (category !== ALL_CATEGORIES) {
      params.set("category", category)
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.push(nextUrl)
  }

  return (
    <div className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={copy.searchPlaceholder}
        className="h-9"
      />

      <Select value={chain} onValueChange={setChain}>
        <SelectTrigger className="h-9 w-full">
          <SelectValue placeholder={copy.allChains} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CHAINS}>{copy.allChains}</SelectItem>
          {chains.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="h-9 w-full">
          <SelectValue placeholder={copy.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES}>{copy.allCategories}</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button type="button" size="sm" onClick={applyFilters}>
          {copy.apply}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setQuery("")
            setChain(ALL_CHAINS)
            setCategory(ALL_CATEGORIES)
            router.push(pathname)
          }}
        >
          {copy.reset}
        </Button>
      </div>
    </div>
  )
}
