import type { CatalogItem } from "./types.js";

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
