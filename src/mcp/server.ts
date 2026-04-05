import { FastMCP } from "fastmcp";
import { z } from "zod";

import type { CatalogItem } from "../catalog/types.js";
import { buildArtifacts } from "../catalog/build-artifacts.js";
import { queryCatalog } from "../catalog/query.js";
import { getSupabase } from "../utils/supabase.js";

const withSupabase = async <T>(run: (supabase: ReturnType<typeof getSupabase>) => Promise<T>) => {
  try {
    return await run(getSupabase());
  } catch (error) {
    if (error instanceof Error) {
      return `Supabase is not configured: ${error.message}`;
    }

    return "Supabase is not configured.";
  }
};

export const createMcpServer = (catalog: CatalogItem[]): FastMCP => {
  const server = new FastMCP({
    name: "nexis-dapps-directory",
    version: "0.1.0",
    instructions:
      "Read-only catalog of Web3, NFT, and dApp projects with chain and category filters.",
  });

  const artifacts = buildArtifacts(catalog);

  server.addTool({
    name: "dapps_search",
    description: "Search the dApp catalog by free text, chain, or category.",
    parameters: z.object({
      q: z.string().optional(),
      chain: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }),
    annotations: { readOnlyHint: true },
    execute: async ({ q, chain, category, limit }) =>
      JSON.stringify(queryCatalog(catalog, { q, chain, category, limit: limit ?? 20 }), null, 2),
  });

  server.addTool({
    name: "dapps_get",
    description: "Get a single dApp by stable id or slug.",
    parameters: z.object({
      id: z.string(),
    }),
    annotations: { readOnlyHint: true },
    execute: async ({ id }) => {
      const item = catalog.find((entry) => entry.id === id || entry.slug === id);
      if (!item) {
        return `dApp not found for id '${id}'.`;
      }
      return JSON.stringify(item, null, 2);
    },
  });

  server.addTool({
    name: "dapps_list_chains",
    description: "List supported chains and dApp counts.",
    parameters: z.object({}),
    annotations: { readOnlyHint: true },
    execute: async () => JSON.stringify(artifacts.chains, null, 2),
  });

  server.addTool({
    name: "dapps_list_categories",
    description: "List supported categories and dApp counts.",
    parameters: z.object({}),
    annotations: { readOnlyHint: true },
    execute: async () => JSON.stringify(artifacts.categories, null, 2),
  });

  server.addTool({
    name: "airdrops_search",
    description: "Search active airdrops by chain, category, or keyword.",
    parameters: z.object({
      chain: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }),
    annotations: { readOnlyHint: true },
    execute: async ({ chain, category, limit }) =>
      withSupabase(async (supabase) => {
        let query = supabase.from("airdrops").select("*");
        if (chain) query = query.ilike("chain", `%${chain}%`);
        if (category) query = query.ilike("category", `%${category}%`);
        query = query.limit(limit ?? 20).order("created_at", { ascending: false });

        const { data, error } = await query;
        if (error) return `Error fetching airdrops: ${error.message}`;
        return JSON.stringify(data, null, 2);
      }),
  });

  server.addTool({
    name: "airdrops_get",
    description: "Get detailed information about a specific airdrop by its name.",
    parameters: z.object({
      name: z.string(),
    }),
    annotations: { readOnlyHint: true },
    execute: async ({ name }) =>
      withSupabase(async (supabase) => {
        const { data, error } = await supabase.from("airdrops").select("*").ilike("name", name).single();
        if (error) return `Airdrop not found: ${error.message}`;
        return JSON.stringify(data, null, 2);
      }),
  });

  server.addTool({
    name: "user_airdrops_log",
    description: "Log a user's participation in an airdrop.",
    parameters: z.object({
      user_id: z.string(),
      airdrop_id: z.string(),
      evm_wallet_address: z.string().optional(),
      solana_wallet_address: z.string().optional(),
    }),
    execute: async ({ user_id, airdrop_id, evm_wallet_address, solana_wallet_address }) =>
      withSupabase(async (supabase) => {
        const { data, error } = await supabase
          .from("user_airdrops")
          .upsert(
            {
              user_id,
              airdrop_id,
              evm_wallet_address,
              solana_wallet_address,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id, airdrop_id" },
          )
          .select()
          .single();

        if (error) return `Error logging airdrop: ${error.message}`;
        return JSON.stringify(data, null, 2);
      }),
  });

  server.addTool({
    name: "user_airdrops_list",
    description: "Get a list of all airdrops a user is participating in.",
    parameters: z.object({
      user_id: z.string(),
    }),
    annotations: { readOnlyHint: true },
    execute: async ({ user_id }) =>
      withSupabase(async (supabase) => {
        const { data, error } = await supabase
          .from("user_airdrops")
          .select("*, airdrops(name, logo_url, chain)")
          .eq("user_id", user_id);

        if (error) return `Error fetching user airdrops: ${error.message}`;
        return JSON.stringify(data, null, 2);
      }),
  });

  server.addResource({
    name: "dapps-index",
    description: "Full dApp directory catalog.",
    uri: "catalog://dapps/index",
    mimeType: "application/json",
    load: async () => ({
      text: JSON.stringify(catalog, null, 2),
    }),
  });

  server.addResource({
    name: "dapps-chains",
    description: "Chain counts derived from the dApp directory.",
    uri: "catalog://dapps/chains",
    mimeType: "application/json",
    load: async () => ({
      text: JSON.stringify(artifacts.chains, null, 2),
    }),
  });

  server.addResource({
    name: "dapps-categories",
    description: "Category counts derived from the dApp directory.",
    uri: "catalog://dapps/categories",
    mimeType: "application/json",
    load: async () => ({
      text: JSON.stringify(artifacts.categories, null, 2),
    }),
  });

  server.addResourceTemplate({
    name: "dapp-by-id",
    description: "Single dApp resource by id or slug.",
    uriTemplate: "catalog://dapps/{id}",
    arguments: [
      {
        name: "id",
        required: true,
      },
    ],
    mimeType: "application/json",
    load: async ({ id }) => {
      const item = catalog.find((entry) => entry.id === id || entry.slug === id);
      if (!item) {
        return {
          text: JSON.stringify({ error: `dApp not found for id '${id}'.` }, null, 2),
        };
      }
      return {
        text: JSON.stringify(item, null, 2),
      };
    },
  });

  return server;
};
