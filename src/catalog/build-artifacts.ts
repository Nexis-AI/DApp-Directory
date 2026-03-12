import type { CatalogItem } from "./types.js";

const countValues = (items: CatalogItem[], key: "chains" | "categories") => {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const value of item[key]) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => left.name.localeCompare(right.name));
};

export const buildArtifacts = (items: CatalogItem[]) => ({
  categories: countValues(items, "categories"),
  chains: countValues(items, "chains"),
});
