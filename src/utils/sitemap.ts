import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  parseTagValue: true,
  trimValues: true,
});

type SitemapDocument = {
  sitemapindex?: {
    sitemap?: Array<{ loc?: string }> | { loc?: string };
  };
  urlset?: {
    url?: Array<{ loc?: string }> | { loc?: string };
  };
};

const asArray = <T>(value: T | T[] | undefined): T[] => {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};

export const parseSitemapUrls = (xml: string): string[] => {
  const parsed = parser.parse(xml) as SitemapDocument;
  if (parsed.sitemapindex) {
    return asArray(parsed.sitemapindex.sitemap)
      .map((entry) => entry.loc)
      .filter((value): value is string => Boolean(value));
  }
  if (parsed.urlset) {
    return asArray(parsed.urlset.url)
      .map((entry) => entry.loc)
      .filter((value): value is string => Boolean(value));
  }
  return [];
};
