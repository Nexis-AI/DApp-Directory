import type { SocialKey } from "../catalog/types.js";

const CHAIN_ALIASES: Record<string, string> = {
  arb: "Arbitrum",
  "arbitrum one": "Arbitrum",
  bsc: "BNB Chain",
  bnb: "BNB Chain",
  "bnb chain": "BNB Chain",
  basechain: "Base",
  eth: "Ethereum",
  mainnet: "Ethereum",
  matic: "Polygon",
  op: "Optimism",
  "op mainnet": "Optimism",
  zksync: "ZkSync",
  "zksync era": "ZkSync",
};

const CATEGORY_ALIASES: Record<string, string> = {
  defi: "DeFi",
  dex: "DEX",
  dexs: "DEX",
  dao: "DAO",
  nft: "NFT",
  nfts: "NFT",
  gamefi: "Gaming",
  game: "Gaming",
  "prediction market": "Prediction Markets",
  "web3 prediction markets": "Prediction Markets",
};

export const collapseWhitespace = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

export const titleCase = (value: string): string =>
  collapseWhitespace(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
    .replace(/\bDefi\b/g, "DeFi")
    .replace(/\bDao\b/g, "DAO")
    .replace(/\bDex\b/g, "DEX")
    .replace(/\bNfts\b/g, "NFTs")
    .replace(/\bNft\b/g, "NFT")
    .replace(/\bDapps\b/g, "dApps")
    .replace(/\bWeb3\b/g, "Web3")
    .replace(/\bAaa\b/g, "AAA")
    .replace(/\bAbi\b/g, "ABI")
    .replace(/\bApi\b/g, "API")
    .replace(/\bSdk\b/g, "SDK")
    .replace(/\bEvm\b/g, "EVM")
    .replace(/\bVc\b/g, "VC")
    .replace(/\bBnb\b/g, "BNB")
    .replace(/\bZksync\b/g, "ZkSync");

export const normalizeChain = (value: string): string => {
  const collapsed = collapseWhitespace(value);
  if (!collapsed) {
    return "";
  }
  const alias = CHAIN_ALIASES[collapsed.toLowerCase()];
  return alias ?? titleCase(collapsed);
};

export const normalizeCategory = (value: string): string => {
  const collapsed = collapseWhitespace(value);
  if (!collapsed) {
    return "";
  }
  const alias = CATEGORY_ALIASES[collapsed.toLowerCase()];
  return alias ?? titleCase(collapsed);
};

export const uniqueSorted = (values: readonly string[]): string[] =>
  [...new Set(values.filter(Boolean))].sort((left, right) =>
    left.localeCompare(right),
  );

export const slugify = (value: string): string =>
  collapseWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeUrl = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    url.hash = "";
    if (
      (url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")
    ) {
      url.port = "";
    }
    return url.toString();
  } catch {
    return null;
  }
};

export const canonicalWebsiteKey = (value: string | null | undefined): string | null => {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return null;
  }
  const url = new URL(normalized);
  const path = url.pathname.replace(/\/+$/, "");
  return path && path !== "/" ? `web:${url.hostname}${path}` : `web:${url.hostname}`;
};

export const normalizeNameKey = (value: string): string =>
  collapseWhitespace(value).toLowerCase();

export const socialKeyFromUrl = (value: string): SocialKey | null => {
  const normalized = normalizeUrl(value);
  if (!normalized) {
    return null;
  }
  const hostname = new URL(normalized).hostname.toLowerCase();
  if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "twitter";
  if (hostname.includes("discord.gg") || hostname.includes("discord.com")) return "discord";
  if (hostname.includes("telegram.me") || hostname.includes("t.me")) return "telegram";
  if (hostname.includes("github.com")) return "github";
  if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
  if (hostname.includes("instagram.com")) return "instagram";
  if (hostname.includes("facebook.com")) return "facebook";
  if (hostname.includes("linkedin.com")) return "linkedin";
  if (hostname.includes("medium.com")) return "medium";
  if (hostname.includes("reddit.com")) return "reddit";
  if (hostname.includes("substack.com")) return "substack";
  if (hostname.includes("warpcast.com") || hostname.includes("farcaster")) return "farcaster";
  if (hostname.includes("hey.xyz") || hostname.includes("lens.xyz")) return "lens";
  return null;
};
