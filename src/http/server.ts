import fastify, { type FastifyInstance } from "fastify";

import { buildArtifacts } from "../catalog/build-artifacts.js";
import {
  buildBrowseRows,
  getFeaturedCatalogItems,
  type GeneratedCatalogMeta,
  type MobileCatalogBrowseRow,
  type MobileCatalogItem,
  toMobileCatalog,
} from "../catalog/mobile-contract.js";
import type { CatalogItem } from "../catalog/types.js";
import { queryCatalog } from "../catalog/query.js";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  type SupportedLocale,
} from "../i18n/config.js";
import { translateTextBatch } from "../i18n/translate.js";
import { getSupabase } from "../utils/supabase.js";
import { applyCacheHeaders, buildEntityTag } from "./cache.js";
import { buildOpenApiDocument } from "./openapi.js";

export interface CreateHttpServerOptions {
  catalog: CatalogItem[];
  generatedMeta?: GeneratedCatalogMeta;
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

const getSupabaseOrError = () => {
  try {
    return {
      supabase: getSupabase(),
      response: null,
    } as const;
  } catch {
    return {
      supabase: null,
      response: error("SERVICE_UNAVAILABLE", "Airdrop service is not configured."),
    } as const;
  }
};

export const createHttpServer = ({
  catalog,
  generatedMeta,
  translateBatch = translateTextBatch,
}: CreateHttpServerOptions): FastifyInstance => {
  const server = fastify({ logger: false });
  const mobileCatalog = toMobileCatalog(catalog);
  const artifacts = buildArtifacts(mobileCatalog);
  const openApiDocument = buildOpenApiDocument();
  const featuredCatalog = getFeaturedCatalogItems(mobileCatalog);

  const buildCatalogMeta = (meta: Record<string, unknown> = {}) => ({
    ...meta,
    generatedAt: generatedMeta?.generatedAt ?? null,
  });

  const localizeCatalogItems = async (
    items: MobileCatalogItem[],
    locale: SupportedLocale,
  ): Promise<MobileCatalogItem[]> => {
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
      description: shortDescriptions[index] ?? item.description,
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

  const localizeBrowseRows = async (
    rows: MobileCatalogBrowseRow[],
    locale: SupportedLocale,
  ): Promise<MobileCatalogBrowseRow[]> => {
    if (locale === DEFAULT_LOCALE || rows.length === 0) {
      return rows;
    }

    const translatedCategoryTitles = await translateTextBatch({
      texts: rows.flatMap((row) => row.categories.map((category) => category.title)),
      targetLocale: locale,
    });

    let categoryIndex = 0;

    return Promise.all(
      rows.map(async (row, rowIndex) => {
        const localizedCategories = await Promise.all(
          row.categories.map(async (category) => {
            const translatedTitle = translatedCategoryTitles[categoryIndex] ?? category.title;
            categoryIndex += 1;
            const localizedDapps = await localizeCatalogItems(category.dapps, locale);

            return {
              ...category,
              category: translatedTitle,
              title: translatedTitle,
              dapps: localizedDapps,
            };
          }),
        );

        return {
          ...row,
          categories: localizedCategories,
        };
      }),
    );
  };

  server.get("/health", async () => success({ status: "ok" }));

  server.get("/openapi.json", async () => openApiDocument);

  server.get("/docs", async (_, reply) => {
    reply.type("text/html");
    return `<!DOCTYPE html><html><body><h1>Nexis dApps Directory API</h1><p>OpenAPI document: <a href="/openapi.json">/openapi.json</a></p></body></html>`;
  });

  server.get("/v1/dapps", async (request, reply) => {
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
    const filtered = queryCatalog(mobileCatalog, { q: normalizedQuery, chain, category });
    const start = (parsedPage - 1) * parsedLimit;
    const items = await localizeCatalogItems(filtered.slice(start, start + parsedLimit), locale);

    const payload = success(
      {
        items,
      },
      buildCatalogMeta({
        page: parsedPage,
        limit: parsedLimit,
        total: filtered.length,
        hasMore: start + parsedLimit < filtered.length,
      }),
    );

    if (applyCacheHeaders(request, reply, buildEntityTag(payload))) {
      return reply.send();
    }

    return payload;
  });

  server.get("/v1/dapps/featured", async (request, reply) => {
    const { lang } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const items = await localizeCatalogItems(featuredCatalog, locale);
    const payload = success({ items }, buildCatalogMeta({ total: items.length }));

    if (applyCacheHeaders(request, reply, buildEntityTag(payload))) {
      return reply.send();
    }

    return payload;
  });

  server.get("/v1/dapps/browse", async (request, reply) => {
    const { lang, chainLimit, categoryLimit } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const parsedChainLimit = Math.min(
      24,
      Math.max(1, Number.parseInt(chainLimit ?? "12", 10) || 12),
    );
    const parsedCategoryLimit = Math.min(
      12,
      Math.max(1, Number.parseInt(categoryLimit ?? "8", 10) || 8),
    );
    const rows = buildBrowseRows(mobileCatalog, artifacts.chains, {
      chainLimit: parsedChainLimit,
      categoryLimit: parsedCategoryLimit,
    });
    const localizedRows = await localizeBrowseRows(rows, locale);
    const payload = success({ items: localizedRows }, buildCatalogMeta({ total: localizedRows.length }));

    if (applyCacheHeaders(request, reply, buildEntityTag(payload))) {
      return reply.send();
    }

    return payload;
  });

  server.get("/v1/dapps/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { lang } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const item = mobileCatalog.find((entry) => entry.id === id || entry.slug === id);
    if (!item) {
      reply.code(404);
      return error("NOT_FOUND", "dApp not found");
    }
    const [localizedItem] = await localizeCatalogItems([item], locale);
    const payload = success(localizedItem, buildCatalogMeta());

    if (applyCacheHeaders(request, reply, buildEntityTag(payload))) {
      return reply.send();
    }

    return payload;
  });

  server.get("/v1/chains", async (request, reply) => {
    const { lang } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const items = await localizeCountSummaries(artifacts.chains, locale);
    const payload = success({ items }, buildCatalogMeta({ total: items.length }));

    if (applyCacheHeaders(request, reply, buildEntityTag(payload))) {
      return reply.send();
    }

    return payload;
  });

  server.get("/v1/categories", async (request, reply) => {
    const { lang } = request.query as Record<string, string | undefined>;
    const locale = isSupportedLocale(lang) ? lang : DEFAULT_LOCALE;
    const items = await localizeCountSummaries(artifacts.categories, locale);
    const payload = success({ items }, buildCatalogMeta({ total: items.length }));

    if (applyCacheHeaders(request, reply, buildEntityTag(payload))) {
      return reply.send();
    }

    return payload;
  });

  server.get("/v1/airdrops", async (request, reply) => {
    const dependency = getSupabaseOrError();
    if (!dependency.supabase) {
      reply.code(503);
      return dependency.response;
    }
    const { supabase } = dependency;
    const { chain, category, page, limit } = request.query as Record<string, string | undefined>;
    const parsedPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
    const parsedLimit = Math.min(250, Math.max(1, Number.parseInt(limit ?? "50", 10) || 50));
    const start = (parsedPage - 1) * parsedLimit;

    let query = supabase.from("airdrops").select("*", { count: "exact" });
    if (chain) query = query.ilike("chain", `%${chain}%`);
    if (category) query = query.ilike("category", `%${category}%`);
    
    query = query.range(start, start + parsedLimit - 1).order("created_at", { ascending: false });

    const { data, error: dbError, count } = await query;

    if (dbError) {
      reply.code(500);
      return error("DATABASE_ERROR", dbError.message);
    }

    return success(
      { items: data },
      {
        page: parsedPage,
        limit: parsedLimit,
        total: count ?? 0,
        hasMore: count ? start + parsedLimit < count : false,
      }
    );
  });

  server.post("/v1/user-airdrops", async (request, reply) => {
    const dependency = getSupabaseOrError();
    if (!dependency.supabase) {
      reply.code(503);
      return dependency.response;
    }
    const { supabase } = dependency;
    const { user_id, airdrop_id, evm_wallet_address, solana_wallet_address } = request.body as any;
    
    if (!user_id || !airdrop_id) {
      reply.code(400);
      return error("BAD_REQUEST", "user_id and airdrop_id are required");
    }

    const { data, error: dbError } = await supabase
      .from("user_airdrops")
      .upsert(
        {
          user_id,
          airdrop_id,
          evm_wallet_address,
          solana_wallet_address,
          updated_at: new Date().toISOString()
        },
        { onConflict: "user_id, airdrop_id" }
      )
      .select()
      .single();

    if (dbError) {
      reply.code(500);
      return error("DATABASE_ERROR", dbError.message);
    }

    return success(data);
  });

  server.get("/v1/user-airdrops/:user_id", async (request, reply) => {
    const dependency = getSupabaseOrError();
    if (!dependency.supabase) {
      reply.code(503);
      return dependency.response;
    }
    const { supabase } = dependency;
    const { user_id } = request.params as { user_id: string };

    const { data, error: dbError } = await supabase
      .from("user_airdrops")
      .select(`
        *,
        airdrops (
          name,
          logo_url,
          rewards,
          chain,
          category
        )
      `)
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (dbError) {
      reply.code(500);
      return error("DATABASE_ERROR", dbError.message);
    }

    return success({ items: data });
  });

  return server;


};
