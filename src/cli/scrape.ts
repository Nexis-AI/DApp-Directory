import { resolve } from "node:path";

import { buildArtifacts } from "../catalog/build-artifacts.js";
import { buildCatalog } from "../catalog/build-catalog.js";
import { buildOpenApiDocument } from "../http/openapi.js";
import { fetchAllSourceRecords } from "../sources/fetchers.js";
import { readJsonFile, writeJsonFile } from "../utils/fs.js";

const parseArgs = () => {
  const args = new Map<string, string>();
  for (const token of process.argv.slice(2)) {
    const normalized = token.replace(/^--/, "");
    const [key, value = "true"] = normalized.split("=", 2);
    if (!key) {
      continue;
    }
    args.set(key, value);
  }
  return args;
};

const args = parseArgs();
const limit = args.has("limit") ? Number.parseInt(args.get("limit") ?? "0", 10) : undefined;
const concurrency = args.has("concurrency")
  ? Number.parseInt(args.get("concurrency") ?? "0", 10)
  : undefined;
const sources = (args.get("sources") ?? "alchemy,rayo,moralis,defillama")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean) as Array<"alchemy" | "rayo" | "moralis" | "defillama">;

const idMapPath = resolve(process.cwd(), "data/manual/id-map.json");
const overridesPath = resolve(process.cwd(), "data/manual/overrides.json");
const generatedDirectory = resolve(process.cwd(), "data/generated");
const openApiPath = resolve(process.cwd(), "openapi/openapi.json");

console.log(`Starting scrape for sources: ${sources.join(", ")}`);
if (limit) {
  console.log(`Applying per-source limit: ${limit}`);
}

const [existingIdMap, overrides] = await Promise.all([
  readJsonFile<Record<string, string>>(idMapPath, {}),
  readJsonFile<Record<string, object>>(overridesPath, {}),
]);

const sourceRecords = await fetchAllSourceRecords({
  limit,
  concurrency,
  sources,
});

const catalog = buildCatalog({
  sourceRecords,
  existingIdMap,
  overrides,
});
const artifacts = buildArtifacts(catalog.items);

await writeJsonFile(idMapPath, catalog.idMap);
await writeJsonFile(resolve(generatedDirectory, "dapps.json"), catalog.items);
await writeJsonFile(resolve(generatedDirectory, "chains.json"), artifacts.chains);
await writeJsonFile(resolve(generatedDirectory, "categories.json"), artifacts.categories);
await writeJsonFile(
  resolve(generatedDirectory, "duplicates-review.json"),
  catalog.duplicateReview,
);
await writeJsonFile(resolve(generatedDirectory, "sources.json"), sourceRecords);
await writeJsonFile(resolve(generatedDirectory, "meta.json"), {
  generatedAt: new Date().toISOString(),
  dapps: catalog.items.length,
  chains: artifacts.chains.length,
  categories: artifacts.categories.length,
  duplicateReviewItems: catalog.duplicateReview.length,
  sources,
});

await writeJsonFile(openApiPath, buildOpenApiDocument());

console.log(`Generated ${catalog.items.length} dApps`);
console.log(`OpenAPI written to ${openApiPath}`);
