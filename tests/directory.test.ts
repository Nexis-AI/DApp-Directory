import { describe, expect, test } from "vitest";

import type { DirectoryItem } from "../apps/web/lib/directory.js";
import { filterDirectoryItems, paginateDirectoryItems } from "../apps/web/lib/directory.js";

const items: DirectoryItem[] = [
  {
    id: "dapp_1",
    slug: "uniswap",
    name: "Uniswap",
    categories: ["DEX"],
    chains: ["Ethereum", "Arbitrum"],
    shortDescription: "Swap tokens across chains.",
    longDescription: "Uniswap is a decentralized exchange protocol.",
    webUrl: "https://app.uniswap.org/",
    logoUrl: null,
  },
  {
    id: "dapp_2",
    slug: "aave",
    name: "Aave",
    categories: ["Lending"],
    chains: ["Ethereum", "Base"],
    shortDescription: "Borrow and lend onchain.",
    longDescription: "Aave is a decentralized liquidity protocol.",
    webUrl: "https://app.aave.com/",
    logoUrl: null,
  },
  {
    id: "dapp_3",
    slug: "friend-tech",
    name: "friend.tech",
    categories: ["Social"],
    chains: ["Base"],
    shortDescription: "Social trading.",
    longDescription: "friend.tech is a social dApp.",
    webUrl: "https://friend.tech/",
    logoUrl: null,
  },
];

describe("directory helpers", () => {
  test("filters by free text, chain, and category", () => {
    const filtered = filterDirectoryItems(items, {
      q: "swap",
      chain: "arbitrum",
      category: "dex",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("Uniswap");
  });

  test("paginates filtered results", () => {
    const filtered = filterDirectoryItems(items, {});
    const page = paginateDirectoryItems(filtered, { page: 2, pageSize: 2 });

    expect(page).toMatchObject({
      page: 2,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
    expect(page.items.map((item) => item.slug)).toEqual(["friend-tech"]);
  });
});
