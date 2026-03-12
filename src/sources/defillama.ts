import type { SourceRecord } from "../catalog/types.js";
import { fetchJson } from "../utils/fetch.js";
import {
  canonicalWebsiteKey,
  collapseWhitespace,
  normalizeCategory,
  normalizeChain,
  normalizeUrl,
  uniqueSorted,
} from "../utils/normalize.js";
import type { FetchSourceOptions } from "./moralis.js";

const DEFILLAMA_PROTOCOLS_URL = "https://api.llama.fi/protocols";
const DEFILLAMA_PROTOCOL_URL = "https://defillama.com/protocol/";

const EXCLUDED_CATEGORIES = new Set([
  "bug bounty",
  "cex",
  "chain",
  "coins tracker",
  "crypto card issuer",
  "dao service provider",
  "foundation",
  "services",
]);

export interface DefiLlamaProtocol {
  id?: string | number | null;
  slug?: string | null;
  name?: string | null;
  url?: string | null;
  description?: string | null;
  logo?: string | null;
  category?: string | null;
  chains?: string[] | null;
  twitter?: string | null;
}

const toTwitterUrl = (value: string | null | undefined): string | null => {
  const collapsed = collapseWhitespace(value ?? "");
  if (!collapsed) {
    return null;
  }
  return normalizeUrl(
    collapsed.startsWith("http://") || collapsed.startsWith("https://")
      ? collapsed
      : `https://x.com/${collapsed.replace(/^@/, "")}`,
  );
};

export const parseDefiLlamaProtocol = (
  protocol: DefiLlamaProtocol,
  fetchedAt = new Date().toISOString(),
): SourceRecord | null => {
  const name = collapseWhitespace(protocol.name ?? "");
  const webUrl = normalizeUrl(protocol.url);
  const rawCategory = collapseWhitespace(protocol.category ?? "");
  const category = normalizeCategory(rawCategory);

  if (!name || !webUrl || !category || EXCLUDED_CATEGORIES.has(rawCategory.toLowerCase())) {
    return null;
  }

  const sourceId =
    collapseWhitespace(protocol.slug ?? "") ||
    String(protocol.id ?? "") ||
    (canonicalWebsiteKey(webUrl) ?? name.toLowerCase());

  const twitterUrl = toTwitterUrl(protocol.twitter);

  return {
    source: "defillama",
    sourceId,
    sourceUrl:
      protocol.slug && collapseWhitespace(protocol.slug)
        ? new URL(collapseWhitespace(protocol.slug), DEFILLAMA_PROTOCOL_URL).toString()
        : DEFILLAMA_PROTOCOLS_URL,
    name,
    logoUrl: normalizeUrl(protocol.logo),
    webUrl,
    mobileUrl: null,
    socials: twitterUrl ? { twitter: twitterUrl } : {},
    categories: [category],
    chains: uniqueSorted((protocol.chains ?? []).map((value) => normalizeChain(value))),
    shortDescription: collapseWhitespace(protocol.description ?? ""),
    longDescription: collapseWhitespace(protocol.description ?? ""),
    updatedAt: fetchedAt,
  };
};

export const fetchDefiLlamaRecords = async ({
  limit,
}: FetchSourceOptions = {}): Promise<SourceRecord[]> => {
  const protocols = await fetchJson<DefiLlamaProtocol[]>(DEFILLAMA_PROTOCOLS_URL, 60_000);
  const records = protocols
    .map((protocol) => parseDefiLlamaProtocol(protocol))
    .filter((record): record is SourceRecord => Boolean(record));

  return typeof limit === "number" ? records.slice(0, limit) : records;
};
