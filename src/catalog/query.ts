import type { CatalogItem } from "./types.js";

export interface CatalogQuery {
  q?: string;
  chain?: string;
  category?: string;
  limit?: number;
}

export const queryCatalog = (
  catalog: CatalogItem[],
  { q, chain, category, limit }: CatalogQuery,
): CatalogItem[] => {
  const normalizedQuery = q?.toLowerCase();
  const normalizedChain = chain?.toLowerCase();
  const normalizedCategory = category?.toLowerCase();

  const filtered = catalog.filter((item) => {
    if (
      normalizedQuery &&
      ![
        item.name,
        item.shortDescription,
        item.longDescription,
        ...item.categories,
        ...item.chains,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    ) {
      return false;
    }
    if (
      normalizedChain &&
      !item.chains.some((value) => value.toLowerCase() === normalizedChain)
    ) {
      return false;
    }
    if (
      normalizedCategory &&
      !item.categories.some((value) => value.toLowerCase() === normalizedCategory)
    ) {
      return false;
    }
    return true;
  });

  return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
};
