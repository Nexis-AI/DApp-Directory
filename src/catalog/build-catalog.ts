import type {
  BuildCatalogInput,
  BuildCatalogResult,
  CatalogItem,
  SocialLinks,
  SourceRecord,
} from "./types.js";
import {
  canonicalWebsiteKey,
  normalizeNameKey,
  normalizeUrl,
  slugify,
  uniqueSorted,
} from "../utils/normalize.js";

type WorkingItem = CatalogItem & {
  canonicalKey: string;
};

const mergeSocials = (left: SocialLinks, right: SocialLinks): SocialLinks => ({
  ...left,
  ...right,
});

const longerText = (left: string, right: string): string =>
  right.length > left.length ? right : left;

const maxTimestamp = (left: string, right: string): string =>
  new Date(right).getTime() > new Date(left).getTime() ? right : left;

const inferCanonicalKey = (record: SourceRecord): string =>
  canonicalWebsiteKey(record.webUrl) ??
  `name:${normalizeNameKey(record.name)}`;

const createIdGenerator = (existingIds: Iterable<string>) => {
  const max = Math.max(
    0,
    ...[...existingIds]
      .map((value) => Number.parseInt(value.replace(/\D+/g, ""), 10))
      .filter((value) => Number.isFinite(value)),
  );

  let current = max;
  return (): string => {
    current += 1;
    return `dapp_${String(current).padStart(6, "0")}`;
  };
};

const mergeRecordIntoItem = (record: SourceRecord, existing?: WorkingItem): WorkingItem => {
  const canonicalKey = inferCanonicalKey(record);
  if (!existing) {
    return {
      id: "",
      slug: slugify(record.name),
      name: record.name,
      logoUrl: record.logoUrl,
      webUrl: normalizeUrl(record.webUrl),
      mobileUrl: normalizeUrl(record.mobileUrl),
      socials: record.socials,
      categories: uniqueSorted(record.categories),
      chains: uniqueSorted(record.chains),
      shortDescription: record.shortDescription,
      longDescription: record.longDescription,
      sourceUrls: [record.sourceUrl],
      updatedAt: record.updatedAt,
      canonicalKey,
    };
  }

  return {
    ...existing,
    logoUrl: existing.logoUrl ?? record.logoUrl,
    webUrl: existing.webUrl ?? normalizeUrl(record.webUrl),
    mobileUrl: existing.mobileUrl ?? normalizeUrl(record.mobileUrl),
    socials: mergeSocials(existing.socials, record.socials),
    categories: uniqueSorted([...existing.categories, ...record.categories]),
    chains: uniqueSorted([...existing.chains, ...record.chains]),
    shortDescription: longerText(existing.shortDescription, record.shortDescription),
    longDescription: longerText(existing.longDescription, record.longDescription),
    sourceUrls: uniqueSorted([...existing.sourceUrls, record.sourceUrl]),
    updatedAt: maxTimestamp(existing.updatedAt, record.updatedAt),
  };
};

export const buildCatalog = ({
  sourceRecords,
  existingIdMap,
  overrides,
}: BuildCatalogInput): BuildCatalogResult => {
  const itemsByKey = new Map<string, WorkingItem>();
  const duplicateReview: BuildCatalogResult["duplicateReview"] = [];
  const recordsByName = new Map<string, string[]>();

  for (const record of sourceRecords) {
    const canonicalKey = inferCanonicalKey(record);
    const nameKey = normalizeNameKey(record.name);
    const existingByName = recordsByName.get(nameKey) ?? [];
    recordsByName.set(nameKey, uniqueSorted([...existingByName, canonicalKey]));

    const existing = itemsByKey.get(canonicalKey);
    itemsByKey.set(canonicalKey, mergeRecordIntoItem(record, existing));
  }

  for (const [nameKey, keys] of recordsByName.entries()) {
    if (keys.length <= 1) {
      continue;
    }
    const websiteKeys = keys.filter((key) => key.startsWith("web:"));
    if (websiteKeys.length > 1) {
      const sourceUrls = websiteKeys.flatMap((key) => itemsByKey.get(key)?.sourceUrls ?? []);
      duplicateReview.push({
        reason: `Multiple canonical websites found for ${nameKey}`,
        candidateKeys: websiteKeys,
        sourceUrls: uniqueSorted(sourceUrls),
      });
    }
  }

  const nextId = createIdGenerator(Object.values(existingIdMap));
  const idMap = { ...existingIdMap };
  const items: CatalogItem[] = [];

  for (const workingItem of [...itemsByKey.values()].sort((left, right) =>
    left.name.localeCompare(right.name),
  )) {
    const override = overrides[workingItem.canonicalKey];
    if (override?.exclude) {
      continue;
    }

    const id = idMap[workingItem.canonicalKey] ?? nextId();
    idMap[workingItem.canonicalKey] = id;

    const merged: CatalogItem = {
      ...workingItem,
      id,
      ...(override ?? {}),
      sourceUrls: uniqueSorted(workingItem.sourceUrls),
      categories: uniqueSorted(override?.categories ?? workingItem.categories),
      chains: uniqueSorted(override?.chains ?? workingItem.chains),
    };

    items.push(merged);
  }

  return {
    items: items.sort((left, right) => left.id.localeCompare(right.id)),
    idMap,
    duplicateReview,
  };
};
