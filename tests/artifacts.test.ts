import { describe, expect, test } from "vitest";

import type { CatalogItem } from "../src/catalog/types.js";
import { buildArtifacts } from "../src/catalog/build-artifacts.js";

const catalog: CatalogItem[] = [
  {
    id: "dapp_000001",
    slug: "polymarket",
    name: "Polymarket",
    logoUrl: "https://example.com/polymarket.png",
    webUrl: "https://polymarket.com/",
    mobileUrl: null,
    socials: {},
    categories: ["DeFi", "Prediction Markets"],
    chains: ["Polygon"],
    shortDescription: "Polymarket is a decentralized exchange on Polygon.",
    longDescription: "Polymarket lets users trade event outcomes.",
    sourceUrls: ["https://www.alchemy.com/dapps/polymarket"],
    updatedAt: "2026-03-09T00:00:00.000Z",
  },
  {
    id: "dapp_000002",
    slug: "synthetix",
    name: "Synthetix",
    logoUrl: "https://example.com/synthetix.png",
    webUrl: "https://synthetix.io/",
    mobileUrl: null,
    socials: {},
    categories: ["DeFi", "Derivatives"],
    chains: ["Ethereum", "Optimism"],
    shortDescription: "Decentralized perpetuals trading on Ethereum Mainnet.",
    longDescription: "Synthetix is a decentralized perpetual futures protocol.",
    sourceUrls: ["https://rayo.gg/project/synthetix"],
    updatedAt: "2026-03-09T00:00:00.000Z",
  },
];

describe("buildArtifacts", () => {
  test("derives chain and category indexes from the catalog", () => {
    const artifacts = buildArtifacts(catalog);

    expect(artifacts.categories).toEqual([
      { count: 2, name: "DeFi" },
      { count: 1, name: "Derivatives" },
      { count: 1, name: "Prediction Markets" },
    ]);
    expect(artifacts.chains).toEqual([
      { count: 1, name: "Ethereum" },
      { count: 1, name: "Optimism" },
      { count: 1, name: "Polygon" },
    ]);
  });
});
