import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { CatalogItem } from "./types.js";

export const GENERATED_DAPPS_PATH = resolve(process.cwd(), "data/generated/dapps.json");

export const loadGeneratedCatalog = async (): Promise<CatalogItem[]> => {
  const raw = await readFile(GENERATED_DAPPS_PATH, "utf8");
  return JSON.parse(raw) as CatalogItem[];
};
