import { load } from "cheerio";

import { collapseWhitespace } from "./normalize.js";

export const htmlToText = (value: string | null | undefined): string => {
  if (!value) {
    return "";
  }
  const $ = load(`<div>${value}</div>`);
  return collapseWhitespace($.text());
};

export const decodeNextImageUrl = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value, "https://www.alchemy.com");
    const encoded = url.searchParams.get("url");
    return encoded ? decodeURIComponent(encoded) : url.toString();
  } catch {
    return value;
  }
};
