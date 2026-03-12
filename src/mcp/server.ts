import { FastMCP } from "fastmcp";
import { z } from "zod";

import type { CatalogItem } from "../catalog/types.js";
import { buildArtifacts } from "../catalog/build-artifacts.js";
import { queryCatalog } from "../catalog/query.js";

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
