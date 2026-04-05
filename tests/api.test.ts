import { afterAll, beforeAll, describe, expect, test } from "vitest";

import type { CatalogItem } from "../src/catalog/types.js";
import { createHttpServer } from "../src/http/server.js";

const catalog: CatalogItem[] = [
  {
    id: "dapp_000001",
    slug: "polymarket",
    name: "Polymarket",
    logoUrl: "https://example.com/polymarket.png",
    webUrl: "https://polymarket.com/",
    mobileUrl: null,
    socials: {
      twitter: "https://twitter.com/PolymarketHQ",
    },
    categories: ["DeFi", "Prediction Markets"],
    chains: ["Polygon"],
    shortDescription: "Polymarket is a decentralized exchange on Polygon.",
    longDescription: "Polymarket lets users trade event outcomes.",
    sourceUrls: [
      "https://www.alchemy.com/dapps/polymarket",
    ],
    updatedAt: "2026-03-09T00:00:00.000Z",
  },
  {
    id: "dapp_000002",
    slug: "synthetix",
    name: "Synthetix",
    logoUrl: "https://example.com/synthetix.png",
    webUrl: "https://synthetix.io/",
    mobileUrl: null,
    socials: {
      twitter: "https://x.com/synthetix",
    },
    categories: ["DeFi", "Derivatives"],
    chains: ["Ethereum", "Optimism"],
    shortDescription: "Decentralized perpetuals trading on Ethereum Mainnet.",
    longDescription: "Synthetix is a decentralized perpetual futures protocol.",
    sourceUrls: [
      "https://rayo.gg/project/synthetix",
    ],
    updatedAt: "2026-03-09T00:00:00.000Z",
  },
];

describe("HTTP API", () => {
  const server = createHttpServer({
    catalog,
    generatedMeta: {
      generatedAt: "2026-03-11T00:07:02.531Z",
    },
    translateBatch: async ({ texts, sourceLocale, targetLocale }) =>
      texts.map((text) => `${targetLocale}:${sourceLocale ?? "en"}:${text}`),
  });

  beforeAll(async () => {
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  test("filters list requests by chain and category with the standard envelope", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/v1/dapps?chain=optimism&category=defi",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        items: [
          {
            id: "dapp_000002",
            name: "Synthetix",
          },
        ],
      },
      meta: {
        generatedAt: "2026-03-11T00:07:02.531Z",
        total: 1,
      },
    });
  });

  test("derives launch metadata and emits cache headers", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/v1/dapps",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["cache-control"]).toBe(
      "public, max-age=300, stale-while-revalidate=900",
    );
    expect(response.headers.etag).toBeDefined();
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        items: expect.arrayContaining([
          expect.objectContaining({
            id: "dapp_000001",
            description: "Polymarket is a decentralized exchange on Polygon.",
            launchUrl: "https://polymarket.com/",
            inAppBrowserAllowed: true,
            walletFamilies: ["evm"],
          }),
        ]),
      },
    });
  });

  test("returns featured dapps with the mobile contract", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/v1/dapps/featured",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        items: expect.arrayContaining([
          expect.objectContaining({
            id: "dapp_000001",
            launchUrl: "https://polymarket.com/",
            inAppBrowserAllowed: true,
          }),
        ]),
      },
      meta: {
        generatedAt: "2026-03-11T00:07:02.531Z",
      },
    });
  });

  test("publishes an OpenAPI document", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/openapi.json",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      openapi: "3.1.0",
      info: {
        title: "Nexis dApps Directory API",
      },
      paths: {
        "/v1/dapps": expect.any(Object),
        "/v1/dapps/featured": expect.any(Object),
        "/v1/dapps/{id}": expect.any(Object),
      },
    });
  });

  test("localizes human-readable catalog fields when a lang query is provided", async () => {
    const response = await server.inject({
      method: "GET",
      url: "/v1/dapps?lang=es",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        items: expect.arrayContaining([
          expect.objectContaining({
            id: "dapp_000001",
            description: "es:en:Polymarket is a decentralized exchange on Polygon.",
            shortDescription: "es:en:Polymarket is a decentralized exchange on Polygon.",
            longDescription: "es:en:Polymarket lets users trade event outcomes.",
          }),
        ]),
      },
    });
  });
});
