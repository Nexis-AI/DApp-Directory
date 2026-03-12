import pLimit from "p-limit";

import type { SourceRecord } from "../catalog/types.js";
import { fetchText } from "../utils/fetch.js";
import { parseSitemapUrls } from "../utils/sitemap.js";
import { parseAlchemyDappHtml } from "./alchemy.js";
import { fetchDefiLlamaRecords } from "./defillama.js";
import { fetchMoralisRecords, type FetchSourceOptions } from "./moralis.js";
import { parseRayoProjectHtml } from "./rayo.js";

const ALCHEMY_SITEMAPS = [
  "https://www.alchemy.com/dapps/sitemap-0.xml",
  "https://www.alchemy.com/dapps/sitemap-1.xml",
];

const RAYO_SITEMAP = "https://rayo.gg/server-sitemap-projects.xml";

const extractAlchemyDetailUrls = (html: string): string[] => {
  const matches = html.match(/"?(\/dapps\/[a-z0-9-]+)"?/gi) ?? [];
  const urls = matches
    .map((value) => value.replace(/^"+|"+$/g, ""))
    .filter((value) => {
      if (value.startsWith("/dapps/_next")) return false;
      if (value.startsWith("/dapps/best/")) return false;
      if (value.startsWith("/dapps/list-of/")) return false;
      return value !== "/dapps";
    })
    .map((value) => new URL(value, "https://www.alchemy.com").toString());

  return [...new Set(urls)];
};

const fetchRecordsFromUrls = async (
  urls: string[],
  fetcher: (url: string, html: string) => SourceRecord,
  concurrency: number,
): Promise<SourceRecord[]> => {
  const limit = pLimit(concurrency);
  const settled = await Promise.allSettled(
    urls.map((url) =>
      limit(async () => {
        const html = await fetchText(url);
        return fetcher(url, html);
      }),
    ),
  );

  return settled
    .filter(
      (result): result is PromiseFulfilledResult<SourceRecord> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);
};

export const fetchAlchemyRecords = async ({
  limit,
  concurrency = 12,
}: FetchSourceOptions = {}): Promise<SourceRecord[]> => {
  const sitemapPayloads = await Promise.all(ALCHEMY_SITEMAPS.map((url) => fetchText(url)));
  const listingUrls = sitemapPayloads.flatMap((payload) => parseSitemapUrls(payload));
  const discoveredDetailUrls = new Set<string>();

  if (typeof limit === "number") {
    for (const listingUrl of listingUrls) {
      const html = await fetchText(listingUrl);
      for (const detailUrl of extractAlchemyDetailUrls(html)) {
        discoveredDetailUrls.add(detailUrl);
        if (discoveredDetailUrls.size >= limit) {
          break;
        }
      }
      if (discoveredDetailUrls.size >= limit) {
        break;
      }
    }
  } else {
    const pageLimit = pLimit(Math.max(2, Math.floor(concurrency / 2)));
    const settled = await Promise.allSettled(
      listingUrls.map((listingUrl) =>
        pageLimit(async () => extractAlchemyDetailUrls(await fetchText(listingUrl))),
      ),
    );
    for (const result of settled) {
      if (result.status !== "fulfilled") {
        continue;
      }
      for (const detailUrl of result.value) {
        discoveredDetailUrls.add(detailUrl);
      }
    }
  }

  const selected = [...discoveredDetailUrls];
  return fetchRecordsFromUrls(selected, parseAlchemyDappHtml, concurrency);
};

export const fetchRayoRecords = async ({
  limit,
  concurrency = 12,
}: FetchSourceOptions = {}): Promise<SourceRecord[]> => {
  const sitemapPayload = await fetchText(RAYO_SITEMAP);
  const urls = parseSitemapUrls(sitemapPayload);
  const selected = typeof limit === "number" ? urls.slice(0, limit) : urls;
  return fetchRecordsFromUrls(selected, parseRayoProjectHtml, concurrency);
};

export const fetchAllSourceRecords = async ({
  limit,
  concurrency,
  sources = ["alchemy", "rayo", "moralis", "defillama"],
}: FetchSourceOptions & {
  sources?: Array<"alchemy" | "rayo" | "moralis" | "defillama">;
} = {}): Promise<
  SourceRecord[]
> => {
  const withTimeout = async <T>(label: string, task: Promise<T>, timeoutMs = 180_000): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      task.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });

  const records: SourceRecord[] = [];
  if (sources.includes("alchemy")) {
    try {
      const alchemy = await withTimeout(
        "Alchemy fetch",
        fetchAlchemyRecords({ limit, concurrency }),
      );
      console.log(`Fetched ${alchemy.length} Alchemy records`);
      records.push(...alchemy);
    } catch (error) {
      console.warn(
        `Skipping Alchemy due to error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  if (sources.includes("rayo")) {
    try {
      const rayo = await withTimeout(
        "Rayo fetch",
        fetchRayoRecords({ limit, concurrency }),
      );
      console.log(`Fetched ${rayo.length} Rayo records`);
      records.push(...rayo);
    } catch (error) {
      console.warn(
        `Skipping Rayo due to error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  if (sources.includes("moralis")) {
    try {
      const moralis = await withTimeout(
        "Moralis fetch",
        fetchMoralisRecords({ limit, concurrency }),
        90_000,
      );
      console.log(`Fetched ${moralis.length} Moralis records`);
      records.push(...moralis);
    } catch (error) {
      console.warn(
        `Skipping Moralis due to error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  if (sources.includes("defillama")) {
    try {
      const defillama = await withTimeout(
        "DefiLlama fetch",
        fetchDefiLlamaRecords({ limit }),
        90_000,
      );
      console.log(`Fetched ${defillama.length} DefiLlama records`);
      records.push(...defillama);
    } catch (error) {
      console.warn(
        `Skipping DefiLlama due to error: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  return records;
};
