import type { CatalogItem } from "./types.js";
import { queryCatalog } from "./query.js";

export type BrowserWalletFamily = "evm" | "solana";

export interface MobileCatalogItem extends CatalogItem {
  description: string;
  featuredRank: number | null;
  inAppBrowserAllowed: boolean;
  walletFamilies: BrowserWalletFamily[];
  launchUrl: string;
}

export interface GeneratedCatalogMeta {
  generatedAt: string;
}

export interface MobileCatalogBrowseCategoryPreview {
  id: string;
  chain: string;
  category: string | null;
  title: string;
  total: number;
  dapps: MobileCatalogItem[];
}

export interface MobileCatalogBrowseRow {
  chain: string;
  total: number;
  categories: MobileCatalogBrowseCategoryPreview[];
}

const FEATURED_SLUGS = [
  "uniswap-v3",
  "aave-v3",
  "symbiosis",
  "polymarket",
  "kamino-lend",
  "jupiter-lend",
  "raydium-amm",
  "drift-trade",
] as const;

const CHAIN_ALIASES: Record<string, string> = {
  Binance: "BNB Chain",
  Op_bnb: "opBNB",
  Ton: "TON",
  Xdai: "Gnosis",
  "Polygon Zkevm": "Polygon zkEVM",
  ZkSync: "ZKsync Era",
  Bob: "BOB",
  Boba_avax: "Boba Avalanche",
};

const CATEGORY_ALIASES: Record<string, string> = {
  Cdp: "CDP",
  Dex: "DEX",
  Rwa: "RWA",
  "Rwa Lending": "RWA Lending",
  "Dex Aggregator": "DEX Aggregator",
  "Cross Chain Bridge": "Cross-Chain Bridge",
  "Bridge Aggregator": "Bridge Aggregator",
  "Prediction Markets": "Prediction Markets",
};

const normalizeValue = (value: string, aliases: Record<string, string>) => aliases[value] ?? value;

const getFeaturedRank = (slug: string) => {
  const rank = FEATURED_SLUGS.indexOf(slug as (typeof FEATURED_SLUGS)[number]);
  return rank === -1 ? null : rank + 1;
};

const getWalletFamilies = (chains: string[]): BrowserWalletFamily[] => {
  if (chains.length === 0) {
    return ["evm", "solana"];
  }

  const hasSolana = chains.some((chain) => chain.toLowerCase().includes("solana"));
  const hasOtherChains = chains.some((chain) => !chain.toLowerCase().includes("solana"));

  if (hasSolana && hasOtherChains) {
    return ["evm", "solana"];
  }

  if (hasSolana) {
    return ["solana"];
  }

  return ["evm"];
};

const toLaunchUrl = (item: CatalogItem) => (item.mobileUrl ?? item.webUrl ?? "").trim();

const buildCategoryPreviews = (
  chain: string,
  items: MobileCatalogItem[],
  categoryLimit: number,
): MobileCatalogBrowseCategoryPreview[] => {
  const buckets = new Map<
    string,
    {
      category: string;
      dapps: MobileCatalogItem[];
      seenIds: Set<string>;
    }
  >();

  for (const item of items) {
    const categories = Array.from(
      new Set(item.categories.map((entry) => entry.trim()).filter((entry) => entry.length > 0)),
    );

    for (const category of categories) {
      const key = category.toLowerCase();
      const bucket = buckets.get(key) ?? {
        category,
        dapps: [],
        seenIds: new Set<string>(),
      };

      if (!bucket.seenIds.has(item.id)) {
        bucket.seenIds.add(item.id);
        bucket.dapps.push(item);
      }

      buckets.set(key, bucket);
    }
  }

  return Array.from(buckets.values())
    .sort((left, right) => {
      if (right.dapps.length !== left.dapps.length) {
        return right.dapps.length - left.dapps.length;
      }

      return left.category.localeCompare(right.category);
    })
    .slice(0, categoryLimit)
    .map((bucket) => ({
      id: `${chain}:${bucket.category.toLowerCase()}`,
      chain,
      category: bucket.category,
      title: bucket.category,
      total: bucket.dapps.length,
      dapps: bucket.dapps.slice(0, 3),
    }));
};

export const toMobileCatalog = (catalog: CatalogItem[]): MobileCatalogItem[] =>
  catalog.map((item) => {
    const chains = item.chains.map((chain) => normalizeValue(chain, CHAIN_ALIASES));
    const categories = item.categories.map((category) =>
      normalizeValue(category, CATEGORY_ALIASES),
    );
    const launchUrl = toLaunchUrl(item);

    return {
      ...item,
      description: item.shortDescription,
      categories,
      chains,
      featuredRank: getFeaturedRank(item.slug),
      inAppBrowserAllowed: launchUrl.startsWith("https://"),
      walletFamilies: getWalletFamilies(chains),
      launchUrl,
    };
  });

export const getFeaturedCatalogItems = (catalog: MobileCatalogItem[]): MobileCatalogItem[] =>
  catalog
    .filter((item) => item.featuredRank !== null && item.inAppBrowserAllowed)
    .sort(
      (left, right) =>
        (left.featuredRank ?? Number.MAX_SAFE_INTEGER) -
        (right.featuredRank ?? Number.MAX_SAFE_INTEGER),
    );

export const buildBrowseRows = (
  catalog: MobileCatalogItem[],
  chains: ReadonlyArray<{ name: string; count: number }>,
  {
    chainLimit = 12,
    categoryLimit = 8,
  }: {
    chainLimit?: number;
    categoryLimit?: number;
  } = {},
): MobileCatalogBrowseRow[] =>
  chains.slice(0, chainLimit).flatMap((chainSummary) => {
    const chainItems = queryCatalog(catalog, { chain: chainSummary.name });
    const categories = buildCategoryPreviews(chainSummary.name, chainItems, categoryLimit);

    if (categories.length === 0) {
      return [];
    }

    return [
      {
        chain: chainSummary.name,
        total: chainSummary.count,
        categories,
      },
    ];
  });
