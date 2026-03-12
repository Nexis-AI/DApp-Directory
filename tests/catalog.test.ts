import { describe, expect, test } from "vitest";

import { buildCatalog } from "../src/catalog/build-catalog.js";
import type { SourceRecord } from "../src/catalog/types.js";

const alchemyRecord: SourceRecord = {
  source: "alchemy",
  sourceId: "polymarket",
  sourceUrl: "https://www.alchemy.com/dapps/polymarket",
  name: "Polymarket",
  logoUrl:
    "https://res.cloudinary.com/alchemy-website/image/upload/v1/dapp-store/dapp-logos/Polymarket.jpg",
  webUrl: "https://polymarket.com/",
  mobileUrl: null,
  socials: {
    twitter: "https://twitter.com/PolymarketHQ",
  },
  categories: ["DeFi", "Prediction Markets"],
  chains: ["Polygon"],
  shortDescription: "Polymarket is a decentralized exchange on Polygon.",
  longDescription: "Polymarket lets users trade on event outcomes.",
  updatedAt: "2026-03-08T00:00:00.000Z",
};

const rayoRecord: SourceRecord = {
  source: "rayo",
  sourceId: "polymarket",
  sourceUrl: "https://rayo.gg/project/polymarket",
  name: "Polymarket",
  logoUrl: "https://images.rayo.gg/prod/polymarket.png",
  webUrl: "https://polymarket.com",
  mobileUrl: null,
  socials: {
    twitter: "https://x.com/PolymarketHQ",
    discord: "https://discord.gg/polymarket",
  },
  categories: ["Prediction Markets"],
  chains: ["Polygon", "Base"],
  shortDescription: "Prediction markets for real-world events.",
  longDescription:
    "Polymarket is a prediction market where users take positions on future events.",
  updatedAt: "2026-03-09T00:00:00.000Z",
};

describe("buildCatalog", () => {
  test("deduplicates by canonical website and preserves stable ids", () => {
    const catalog = buildCatalog({
      sourceRecords: [alchemyRecord, rayoRecord],
      existingIdMap: {
        "web:polymarket.com": "dapp_000123",
      },
      overrides: {},
    });
    const item = catalog.items[0];

    expect(catalog.items).toHaveLength(1);
    expect(item).toBeDefined();
    expect(item).toMatchObject({
      id: "dapp_000123",
      name: "Polymarket",
      webUrl: "https://polymarket.com/",
      categories: ["DeFi", "Prediction Markets"],
      chains: ["Base", "Polygon"],
    });
    expect(item?.socials.discord).toBe("https://discord.gg/polymarket");
    expect(catalog.idMap).toEqual({
      "web:polymarket.com": "dapp_000123",
    });
    expect(catalog.duplicateReview).toEqual([]);
  });
});
