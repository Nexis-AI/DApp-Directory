import { load } from "cheerio";

import type { SourceRecord } from "../catalog/types.js";
import { decodeNextImageUrl } from "../utils/html.js";
import {
  canonicalWebsiteKey,
  collapseWhitespace,
  normalizeCategory,
  normalizeChain,
  normalizeUrl,
  socialKeyFromUrl,
  uniqueSorted,
} from "../utils/normalize.js";

const alchemyCategoryFromTitle = (title: string): string | null => {
  const match = title.match(/-\s*(.*?)\s+Dapps\s+-/i);
  return match ? normalizeCategory(match[1] ?? "") : null;
};

export const parseAlchemyDappHtml = (
  sourceUrl: string,
  html: string,
  fetchedAt = new Date().toISOString(),
): SourceRecord => {
  const $ = load(html);
  const name = collapseWhitespace($("h1").first().text());
  const title = collapseWhitespace($("title").first().text());
  const detailsColumn = $("h1").first().parent();
  const shortDescription = collapseWhitespace(
    $("h1").first().siblings("p").first().text(),
  );
  const longDescription = collapseWhitespace(
    $("h2")
      .filter((_, element) =>
        collapseWhitespace($(element).text()).toLowerCase().startsWith("what is "),
      )
      .first()
      .nextAll("p")
      .first()
      .text(),
  );

  const websiteLink =
    normalizeUrl($(`a#${name}-website`).attr("href")) ??
    normalizeUrl(
      $("a")
        .filter((_, element) =>
          collapseWhitespace($(element).text()).toLowerCase().includes("visit website"),
        )
        .first()
        .attr("href"),
    );

  const socials: SourceRecord["socials"] = {};
  $("a[href]").each((_, element) => {
    const href = normalizeUrl($(element).attr("href"));
    if (!href || href === websiteLink) {
      return;
    }
    const key = socialKeyFromUrl(href);
    if (key) {
      socials[key] = href;
    }
  });

  const badgeElements = [
    ...detailsColumn.children("span").toArray(),
    ...detailsColumn.children("div").first().find("span").toArray(),
  ];
  const badgeCategories = badgeElements
    .map((element) => collapseWhitespace($(element).text()))
    .filter((value) => value && !/^free/i.test(value))
    .map(normalizeCategory);

  const titleCategory = alchemyCategoryFromTitle(title);
  const categories = uniqueSorted([
    ...(titleCategory ? [titleCategory] : []),
    ...badgeCategories,
  ]);

  const chains = uniqueSorted(
    detailsColumn
      .find("img[title], img[alt$='Logo']")
      .map((_, element) => {
        const titleText =
          $(element).attr("title") ??
          ($(element).attr("alt") ?? "").replace(/\s+logo$/i, "");
        return normalizeChain(titleText);
      })
      .get(),
  ).filter((value) => Boolean(value) && value !== name);

  const logoUrl = decodeNextImageUrl(
    $("img")
      .filter((_, element) => collapseWhitespace($(element).attr("alt") ?? "") === name)
      .first()
      .attr("src"),
  );

  const sourceId =
    sourceUrl.split("/").filter(Boolean).at(-1) ??
    canonicalWebsiteKey(websiteLink) ??
    name.toLowerCase();

  return {
    source: "alchemy",
    sourceId,
    sourceUrl,
    name,
    logoUrl,
    webUrl: websiteLink,
    mobileUrl: null,
    socials,
    categories,
    chains,
    shortDescription,
    longDescription,
    updatedAt: fetchedAt,
  };
};
