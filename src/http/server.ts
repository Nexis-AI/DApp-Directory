import fastify, { type FastifyInstance } from "fastify";

import { buildArtifacts } from "../catalog/build-artifacts.js";
import type { CatalogItem } from "../catalog/types.js";
import { queryCatalog } from "../catalog/query.js";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from "../i18n/config.js";
import { translateTextBatch } from "../i18n/translate.js";
import { buildOpenApiDocument } from "./openapi.js";

export interface CreateHttpServerOptions {
  catalog: CatalogItem[];
  translateBatch?: typeof translateTextBatch;
}

const success = <T>(data: T, meta?: Record<string, unknown>) => ({
  success: true,
  data,
  meta,
});

const error = (code: string, message: string) => ({
  success: false,
  error: {
    code,
    message,
  },
});

export const createHttpServer = ({
  catalog,
  translateBatch = translateTextBatch,
}: CreateHttpServerOptions): FastifyInstance => {
  const server = fastify({ logger: false });
  const artifacts = buildArtifacts(catalog);
  const openApiDocument = buildOpenApiDocument();

  const localizeCatalogItems = async (
    items: CatalogItem[],
    locale: SupportedLocale,
  ): Promise<CatalogItem[]> => {
    if (locale === DEFAULT_LOCALE || items.length === 0) {
      return items;
    }

    const shortDescriptions = await translateBatch({
      texts: items.map((item) => item.shortDescription),
      targetLocale: locale,
    });
    const longDescriptions = await translateBatch({
      texts: items.map((item) => item.longDescription),
      targetLocale: locale,
    });

    return items.map((item, index) => ({
      ...item,
      shortDescription: shortDescriptions[index] ?? item.shortDescription,
      longDescription: longDescriptions[index] ?? item.longDescription,
    }));
  };

  const localizeCountSummaries = async (
    items: Array<{ name: string; count: number }>,
    locale: SupportedLocale,
  ) => {
    if (locale === DEFAULT_LOCALE || items.length === 0) {
      return items;
    }

    const translatedNames = await translateBatch({
      texts: items.map((item) => item.name),
      targetLocale: locale,
    });

    return items.map((item, index) => ({
      ...item,
      name: translatedNames[index] ?? item.name,
    }));
  };

  server.get("/health", async () => success({ status: "ok" }));

  server.get("/openapi.json", async () => openApiDocument);

  server.get("/docs", async (_, reply) => {
    reply.type("text/html");
    return `<!DOCTYPE html><html><body><h1>Nexis dApps Directory API</h1><p>OpenAPI document: <a href="/openapi.json">/openapi.json</a></p></body></html>`;
  });

  server.get("/v1/dapps", async (request) => {
    const { q, chain, category, page, limit, lang } = request.query as Record<
      string,
      string | undefined
    >;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const normalizedQuery =
      locale === DEFAULT_LOCALE || !q
        ? q
        : (
            await translateBatch({
              texts: [q],
              sourceLocale: locale,
              targetLocale: DEFAULT_LOCALE,
            })
          )[0];
    const parsedPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const parsedLimit = Math.min(250, Math.max(1, Number.parseInt(limit ?? "50", 10) || 50));
    const filtered = queryCatalog(catalog, { q: normalizedQuery, chain, category });
    const start = (parsedPage - 1) * parsedLimit;
    const items = await localizeCatalogItems(filtered.slice(start, start + parsedLimit), locale);

    return success(
      {
        items,
      },
      {
        page: parsedPage,
        limit: parsedLimit,
        total: filtered.length,
        hasMore: start + parsedLimit < filtered.length,
      },
    );
  });

  server.get("/v1/dapps/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { lang } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const item = catalog.find((entry) => entry.id === id || entry.slug === id);
    if (!item) {
      reply.code(404);
      return error("NOT_FOUND", "dApp not found");
    }
    const [localizedItem] = await localizeCatalogItems([item], locale);
    return success(localizedItem);
  });

  server.get("/v1/chains", async (request) => {
    const { lang } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const items = await localizeCountSummaries(artifacts.chains, locale);

    return success({ items }, { total: items.length });
  });

  server.get("/v1/categories", async (request) => {
    const { lang } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const items = await localizeCountSummaries(artifacts.categories, locale);

    return success({ items }, { total: items.length });
  });

  return server;
};
