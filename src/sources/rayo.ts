import type { SourceRecord } from "../catalog/types.js";
import { htmlToText } from "../utils/html.js";
import {
  collapseWhitespace,
  normalizeCategory,
  normalizeChain,
  normalizeUrl,
  uniqueSorted,
} from "../utils/normalize.js";

interface RayoDocument {
  props?: {
    pageProps?: {
      projectResponse?: {
        response?: {
          project?: {
            permalink?: string;
            name?: string;
            description?: string;
            avatar?: string;
            url?: string;
            socialLinks?: Record<string, string | null | undefined>;
            tagline?: string;
            updatedAt?: string;
          };
          blockchains?: Array<{ label?: string | null }>;
          categories?: Array<{ label?: string | null }>;
        };
      };
    };
  };
}

const nextDataPattern =
  /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/;

export const parseRayoProjectHtml = (
  sourceUrl: string,
  html: string,
  fetchedAt = new Date().toISOString(),
): SourceRecord => {
  const match = html.match(nextDataPattern);
  if (!match?.[1]) {
    throw new Error(`Rayo __NEXT_DATA__ missing for ${sourceUrl}`);
  }

  const parsed = JSON.parse(match[1]) as RayoDocument;
  const response = parsed.props?.pageProps?.projectResponse?.response;
  const project = response?.project;
  if (!project?.name) {
    throw new Error(`Rayo project payload missing for ${sourceUrl}`);
  }

  const socials: SourceRecord["socials"] = {};
  for (const [key, value] of Object.entries(project.socialLinks ?? {})) {
    const normalized = normalizeUrl(value);
    if (!normalized) {
      continue;
    }
    if (key === "website") {
      continue;
    }
    socials[key as keyof typeof socials] = normalized;
  }

  return {
    source: "rayo",
    sourceId: project.permalink ?? sourceUrl.split("/").filter(Boolean).at(-1) ?? project.name,
    sourceUrl,
    name: collapseWhitespace(project.name),
    logoUrl: normalizeUrl(project.avatar),
    webUrl: normalizeUrl(project.url),
    mobileUrl: null,
    socials,
    categories: uniqueSorted(
      (response?.categories ?? []).map((entry) => normalizeCategory(entry.label ?? "")),
    ),
    chains: uniqueSorted(
      (response?.blockchains ?? []).map((entry) => normalizeChain(entry.label ?? "")),
    ),
    shortDescription: collapseWhitespace(project.tagline ?? ""),
    longDescription: htmlToText(project.description),
    updatedAt: project.updatedAt ?? fetchedAt,
  };
};
