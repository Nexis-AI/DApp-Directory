import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { GeneratedCatalogMeta } from "./mobile-contract.js";
import type { CatalogItem } from "./types.js";

export const GENERATED_DAPPS_PATH = resolve(process.cwd(), "data/generated/dapps.json");
export const GENERATED_META_PATH = resolve(process.cwd(), "data/generated/meta.json");

export const loadGeneratedCatalog = async (): Promise<CatalogItem[]> => {
  const raw = await readFile(GENERATED_DAPPS_PATH, "utf8");
  return JSON.parse(raw) as CatalogItem[];
};

export const loadGeneratedMeta = async (): Promise<GeneratedCatalogMeta> => {
  const raw = await readFile(GENERATED_META_PATH, "utf8");
  return JSON.parse(raw) as GeneratedCatalogMeta;
};
