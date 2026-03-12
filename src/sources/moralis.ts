import pLimit from "p-limit";
import { chromium } from "playwright";

import type { SourceRecord } from "../catalog/types.js";
import { collapseWhitespace, normalizeCategory, normalizeChain, normalizeUrl, uniqueSorted } from "../utils/normalize.js";

export interface FetchSourceOptions {
  limit?: number;
  concurrency?: number;
}

const MORALIS_LIST_URL = "https://moralis.com/web3-wiki/top/defi-dapps/";

type MoralisExtract = {
  sourceId: string;
  name: string;
  sourceUrl: string;
  logoUrl: string | null;
  webUrl: string | null;
  categories: string[];
  chains: string[];
  shortDescription: string;
  longDescription: string;
};

export const fetchMoralisRecords = async ({
  limit,
  concurrency = 2,
}: FetchSourceOptions = {}): Promise<SourceRecord[]> => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.goto(MORALIS_LIST_URL, { waitUntil: "networkidle", timeout: 90_000 });
    await page.waitForSelector("h1", { timeout: 30_000 });

    const detailUrls = await page.evaluate(() => {
      const urls = new Set<string>();
      document.querySelectorAll<HTMLAnchorElement>('a[href*="/web3-wiki/"]').forEach((anchor) => {
        const href = anchor.href;
        if (
          href.includes("/web3-wiki/top/defi-dapps") ||
          href.endsWith("/web3-wiki/") ||
          href.endsWith("/web3-wiki")
        ) {
          return;
        }
        urls.add(href);
      });
      return [...urls];
    });
    await page.close();

    const selectedUrls =
      typeof limit === "number" ? detailUrls.slice(0, limit) : detailUrls;

    const workerLimit = pLimit(concurrency);
    const records = await Promise.all(
      selectedUrls.map((detailUrl) =>
        workerLimit(async () => {
          const detailPage = await browser.newPage();
          try {
            await detailPage.goto(detailUrl, {
              waitUntil: "networkidle",
              timeout: 90_000,
            });
            await detailPage.waitForSelector("h1", { timeout: 30_000 });
            const extracted = (await detailPage.evaluate(() => {
              const extractSectionValues = (headingText: string): string[] => {
                const headings = Array.from(
                  document.querySelectorAll("h1, h2, h3, h4, h5, h6, strong"),
                ) as HTMLElement[];
                const heading = headings.find(
                  (element) =>
                    element.textContent?.trim().toLowerCase() === headingText.toLowerCase(),
                );
                if (!heading) {
                  return [];
                }
                const values = new Set<string>();
                let cursor = heading.parentElement?.nextElementSibling ?? heading.nextElementSibling;
                let guard = 0;
                while (cursor && guard < 10) {
                  guard += 1;
                  const nestedHeading = cursor.querySelector("h1, h2, h3, h4, h5, h6, strong");
                  if (nestedHeading && nestedHeading.textContent?.trim() !== "") {
                    break;
                  }
                  cursor.querySelectorAll("a, span, li, p").forEach((element) => {
                    const text = element.textContent?.trim();
                    if (text) {
                      values.add(text);
                    }
                  });
                  if (values.size > 0) {
                    break;
                  }
                  cursor = cursor.nextElementSibling;
                }
                return [...values];
              };

              const name =
                document.querySelector("h1")?.textContent?.trim() ?? "";
              const sourceUrl = window.location.href;
              const sourceId = sourceUrl
                .split("/")
                .filter(Boolean)
                .at(-1)
                ?.toLowerCase() ?? name.toLowerCase();
              const webUrl =
                Array.from(document.querySelectorAll("a")).find((anchor) =>
                  anchor.textContent?.toLowerCase().includes("visit website"),
                )?.getAttribute("href") ?? null;
              const shortDescription =
                document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
              const longDescription =
                Array.from(document.querySelectorAll("h2, h3"))
                  .find((element) =>
                    element.textContent?.trim().toLowerCase().startsWith("what is "),
                  )
                  ?.nextElementSibling?.textContent?.trim() ?? shortDescription;
              const logoUrl =
                document.querySelector('meta[property="og:image"]')?.getAttribute("content") ??
                null;

              return {
                sourceId,
                name,
                sourceUrl,
                logoUrl,
                webUrl,
                categories: extractSectionValues("Categories"),
                chains: extractSectionValues("Supported Chains"),
                shortDescription,
                longDescription,
              };
            })) as MoralisExtract;

            return {
              source: "moralis" as const,
              sourceId: extracted.sourceId,
              sourceUrl: extracted.sourceUrl,
              name: collapseWhitespace(extracted.name),
              logoUrl: normalizeUrl(extracted.logoUrl),
              webUrl: normalizeUrl(extracted.webUrl),
              mobileUrl: null,
              socials: {},
              categories: uniqueSorted(extracted.categories.map(normalizeCategory)),
              chains: uniqueSorted(extracted.chains.map(normalizeChain)),
              shortDescription: collapseWhitespace(extracted.shortDescription),
              longDescription: collapseWhitespace(extracted.longDescription),
              updatedAt: new Date().toISOString(),
            };
          } finally {
            await detailPage.close();
          }
        }),
      ),
    );

    return records.filter((record) => Boolean(record.name));
  } finally {
    await browser.close();
  }
};
