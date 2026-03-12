export type SourceName = "alchemy" | "rayo" | "moralis" | "defillama";

export type SocialKey =
  | "twitter"
  | "discord"
  | "telegram"
  | "github"
  | "youtube"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "medium"
  | "reddit"
  | "substack"
  | "farcaster"
  | "lens";

export type SocialLinks = Partial<Record<SocialKey, string>>;

export interface SourceRecord {
  source: SourceName;
  sourceId: string;
  sourceUrl: string;
  name: string;
  logoUrl: string | null;
  webUrl: string | null;
  mobileUrl: string | null;
  socials: SocialLinks;
  categories: string[];
  chains: string[];
  shortDescription: string;
  longDescription: string;
  updatedAt: string;
}

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  webUrl: string | null;
  mobileUrl: string | null;
  socials: SocialLinks;
  categories: string[];
  chains: string[];
  shortDescription: string;
  longDescription: string;
  sourceUrls: string[];
  updatedAt: string;
}

export interface DuplicateReviewItem {
  reason: string;
  candidateKeys: string[];
  sourceUrls: string[];
}

export type CatalogOverride = Partial<CatalogItem> & {
  exclude?: boolean;
};

export interface BuildCatalogInput {
  sourceRecords: SourceRecord[];
  existingIdMap: Record<string, string>;
  overrides: Record<string, CatalogOverride>;
}

export interface BuildCatalogResult {
  items: CatalogItem[];
  idMap: Record<string, string>;
  duplicateReview: DuplicateReviewItem[];
}
