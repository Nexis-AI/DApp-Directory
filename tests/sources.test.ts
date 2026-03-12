import { describe, expect, test } from "vitest";

import { parseAlchemyDappHtml } from "../src/sources/alchemy.js";
import { parseDefiLlamaProtocol } from "../src/sources/defillama.js";
import { parseRayoProjectHtml } from "../src/sources/rayo.js";

const alchemyHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Polymarket - DeFi Dapps - Alchemy</title>
  </head>
  <body>
    <div>
      <img
        alt="Polymarket"
        src="/dapps/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Falchemy-website%2Fimage%2Fupload%2Fv1%2Fdapp-store%2Fdapp-logos%2FPolymarket.jpg&w=640&q=75"
      />
      <span>Free Customers</span>
      <span>Web3 Prediction Markets</span>
      <h1>Polymarket</h1>
      <p>Polymarket is a decentralized exchange on Polygon.</p>
      <img alt="Polygon Logo" title="Polygon" src="https://example.com/polygon.svg" />
      <a href="https://polymarket.com/" id="Polymarket-website">Visit website</a>
      <a href="https://twitter.com/PolymarketHQ">X</a>
      <h2>What is Polymarket?</h2>
      <p>
        Polymarket is a decentralized trading protocol on Polygon that lets users
        trade on the outcomes of future events.
      </p>
    </div>
  </body>
</html>
`;

const rayoHtml = `
<!DOCTYPE html>
<html>
  <body>
    <script id="__NEXT_DATA__" type="application/json">
      {
        "props": {
          "pageProps": {
            "projectResponse": {
              "response": {
                "project": {
                  "permalink": "synthetix",
                  "name": "Synthetix",
                  "description": "<p>Synthetix is a decentralized perpetual futures protocol.</p>",
                  "avatar": "https://images.rayo.gg/dev/uploads/proposals/avatar_synthetix.png",
                  "url": "https://synthetix.io",
                  "socialLinks": {
                    "twitter": "https://x.com/synthetix",
                    "discord": null,
                    "github": null
                  },
                  "tagline": "Decentralized perpetuals trading on Ethereum Mainnet.",
                  "updatedAt": "2026-03-07T23:43:27.915Z"
                },
                "blockchains": [
                  { "label": "Ethereum" },
                  { "label": "Optimism" }
                ],
                "categories": [
                  { "label": "DeFi" },
                  { "label": "Derivatives" }
                ]
              }
            }
          }
        }
      }
    </script>
  </body>
</html>
`;

const defillamaProtocol = {
  id: "611",
  slug: "uniswap",
  name: "Uniswap",
  url: "https://app.uniswap.org",
  description: "Uniswap is a decentralized exchange for swapping onchain assets.",
  logo: "https://icons.llama.fi/uniswap.jpg",
  category: "Dexs",
  chains: ["Ethereum", "Arbitrum", "Optimism"],
  twitter: "Uniswap",
};

describe("source parsers", () => {
  test("parses an Alchemy detail page into a normalized source record", () => {
    const parsed = parseAlchemyDappHtml(
      "https://www.alchemy.com/dapps/polymarket",
      alchemyHtml,
    );

    expect(parsed).toMatchObject({
      source: "alchemy",
      sourceId: "polymarket",
      name: "Polymarket",
      webUrl: "https://polymarket.com/",
      logoUrl:
        "https://res.cloudinary.com/alchemy-website/image/upload/v1/dapp-store/dapp-logos/Polymarket.jpg",
      chains: ["Polygon"],
      categories: ["DeFi", "Prediction Markets"],
      shortDescription: "Polymarket is a decentralized exchange on Polygon.",
    });
    expect(parsed.socials.twitter).toBe("https://twitter.com/PolymarketHQ");
    expect(parsed.longDescription).toContain("decentralized trading protocol");
  });

  test("parses a Rayo detail page from __NEXT_DATA__", () => {
    const parsed = parseRayoProjectHtml(
      "https://rayo.gg/project/synthetix",
      rayoHtml,
    );

    expect(parsed).toMatchObject({
      source: "rayo",
      sourceId: "synthetix",
      name: "Synthetix",
      webUrl: "https://synthetix.io/",
      logoUrl: "https://images.rayo.gg/dev/uploads/proposals/avatar_synthetix.png",
      chains: ["Ethereum", "Optimism"],
      categories: ["DeFi", "Derivatives"],
      shortDescription: "Decentralized perpetuals trading on Ethereum Mainnet.",
    });
    expect(parsed.socials.twitter).toBe("https://x.com/synthetix");
    expect(parsed.longDescription).toContain("perpetual futures protocol");
  });

  test("parses a DefiLlama protocol into a normalized source record", () => {
    const parsed = parseDefiLlamaProtocol(defillamaProtocol);

    expect(parsed).toMatchObject({
      source: "defillama",
      sourceId: "uniswap",
      sourceUrl: "https://defillama.com/protocol/uniswap",
      name: "Uniswap",
      webUrl: "https://app.uniswap.org/",
      logoUrl: "https://icons.llama.fi/uniswap.jpg",
      chains: ["Arbitrum", "Ethereum", "Optimism"],
      categories: ["DEX"],
      shortDescription: "Uniswap is a decentralized exchange for swapping onchain assets.",
    });
    expect(parsed?.socials.twitter).toBe("https://x.com/Uniswap");
    expect(parsed?.longDescription).toContain("decentralized exchange");
  });

  test("filters out non-dapp DefiLlama protocols", () => {
    const parsed = parseDefiLlamaProtocol({
      ...defillamaProtocol,
      slug: "binance-cex",
      name: "Binance",
      category: "CEX",
      url: "https://www.binance.com",
    });

    expect(parsed).toBeNull();
  });
});
