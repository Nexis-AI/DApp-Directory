# Nexis dApps Directory

Machine-readable Web3 dApp directory for developers, researchers, internal products, and AI agents. This repo ships a generated catalog, a local web experience, a read-only HTTP API, and an MCP server for agent workflows.

The current generated snapshot includes:

- 4,232 dApps
- 430 chains
- 92 categories

## Features

- Read-only dApp catalog with stable `id` and `slug` lookup
- Free-text search across names, descriptions, categories, and chains
- Exact filtering by chain and category
- Aggregate chain and category summaries
- Local web UI for browsing the directory and documentation
- HTTP API with generated OpenAPI document
- MCP server with tools and resources for AI agents
- Localized catalog responses via the `lang` query parameter
- Catalog generation pipeline that writes reusable JSON artifacts

## Repository Contents

- `apps/web`: Next.js web app and documentation site
- `src/http`: Fastify HTTP API
- `src/mcp`: FastMCP server
- `src/cli`: scrape and OpenAPI generation commands
- `data/generated`: generated catalog artifacts consumed by the app and API
- `data/manual`: overrides, taxonomy, and stable ID mapping
- `openapi/openapi.json`: generated OpenAPI document

## Requirements

- Node.js `22+`
- `pnpm` `10.15.0+`

## Quick Start

```bash
pnpm install
```

Run the web app:

```bash
pnpm web:dev
```

Run the HTTP API:

```bash
pnpm dev:http
```

Run the compiled HTTP API:

```bash
pnpm build
pnpm start:http
```

Run the MCP server over stdio:

```bash
pnpm dev:mcp
```

Run the MCP server over HTTP:

```bash
MCP_TRANSPORT=http pnpm dev:mcp
```

Run the compiled MCP server over HTTP:

```bash
pnpm build
pnpm start:mcp:http
```

Default local endpoints:

- Web app: `http://localhost:3000` (or the next available port)
- HTTP API: `http://localhost:8787`
- OpenAPI: `http://localhost:8787/openapi.json`
- MCP HTTP endpoint: `http://localhost:8788/mcp`

## Usage Guide

### 1. Browse the web variant

The web app is the easiest local entry point. It reads the generated JSON artifacts directly, so you can browse the catalog and the documentation experience without starting the HTTP API first.

```bash
pnpm web:dev
```

Open the local URL shown by Next.js. The app redirects to a localized route such as `/en`.

### 2. Query the HTTP API

The HTTP server exposes read-only endpoints for search, lookup, chains, categories, health, and the OpenAPI contract.

```bash
pnpm dev:http
```

### 3. Use the MCP server with an agent client

For local CLI-style clients, run MCP over stdio:

```bash
pnpm dev:mcp
```

For remote-capable clients or browser-based tooling, expose MCP over HTTP:

```bash
MCP_TRANSPORT=http MCP_HOST=0.0.0.0 MCP_PORT=8788 pnpm dev:mcp
```

For Railway or other production-style environments, the compiled HTTP entrypoint
will honor `PORT` automatically when `MCP_PORT` is unset:

```bash
pnpm build
pnpm start:mcp:http
```

### 4. Regenerate the catalog

The scrape pipeline fetches source records, builds the normalized catalog, writes generated artifacts, and refreshes `openapi/openapi.json`.

```bash
pnpm scrape
```

Useful variants:

```bash
pnpm scrape --limit=100
pnpm scrape --sources=defillama
pnpm scrape --sources=alchemy,rayo,moralis,defillama --concurrency=8
```

## Example Usage

### HTTP API examples

Health check:

```bash
curl http://localhost:8787/health
```

Search for DeFi dApps on Base:

```bash
curl "http://localhost:8787/v1/dapps?chain=Base&category=DeFi&limit=5"
```

Search by free text:

```bash
curl "http://localhost:8787/v1/dapps?q=prediction%20market&limit=5"
```

Fetch a single dApp by slug:

```bash
curl "http://localhost:8787/v1/dapps/uniswap"
```

List supported chains:

```bash
curl "http://localhost:8787/v1/chains"
```

List supported categories:

```bash
curl "http://localhost:8787/v1/categories"
```

Fetch localized results:

```bash
curl "http://localhost:8787/v1/dapps?q=lending&lang=es&limit=3"
```

JavaScript example:

```ts
const response = await fetch(
  "http://localhost:8787/v1/dapps?chain=Base&category=DeFi&limit=5",
);

const payload = await response.json();
console.log(payload.data.items);
console.log(payload.meta);
```

### MCP examples

Available MCP tools:

- `dapps_search`
- `dapps_get`
- `dapps_list_chains`
- `dapps_list_categories`

Sample `dapps_search` arguments:

```json
{
  "q": "lending",
  "chain": "Base",
  "category": "DeFi",
  "limit": 5
}
```

Sample `dapps_get` arguments:

```json
{
  "id": "uniswap"
}
```

Available MCP resources:

- `catalog://dapps/index`
- `catalog://dapps/chains`
- `catalog://dapps/categories`
- `catalog://dapps/{id}`

## Use Cases

- Power a web or mobile directory UI with a normalized dApp dataset
- Feed AI agents with structured search, exact lookup, and resource access via MCP
- Build internal discovery tools for research, BD, ecosystem mapping, or competitive analysis
- Enrich analytics workflows with chain and category summaries
- Provide a local documentation and playground environment for API and MCP integrations
- Generate a reusable JSON catalog for downstream services or scheduled jobs

## API Endpoints

### Base URL

`http://localhost:8787`

### Response shape

Most successful API responses follow this envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Not-found responses use:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "dApp not found"
  }
}
```

### Endpoint Reference

| Endpoint | Method | Description |
| --- | --- | --- |
| `/health` | `GET` | Service health check |
| `/openapi.json` | `GET` | Generated OpenAPI 3.1 document |
| `/v1/dapps` | `GET` | Search and paginate dApps |
| `/v1/dapps/:id` | `GET` | Get one dApp by stable `id` or `slug` |
| `/v1/chains` | `GET` | List chain counts |
| `/v1/categories` | `GET` | List category counts |

### `/v1/dapps` query parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `q` | `string` | Free-text search across name, descriptions, categories, and chains |
| `chain` | `string` | Exact chain filter, case-insensitive |
| `category` | `string` | Exact category filter, case-insensitive |
| `page` | `integer` | Page number, default `1` |
| `limit` | `integer` | Page size, default `50`, max `250` |
| `lang` | `string` | Optional locale for translated human-readable fields |

Supported locales: `en`, `es`, `zh`, `hi`, `pt`, `nl`, `de`, `ar`, `ja`, `id`, `fr`, `bn`

### Catalog item shape

```json
{
  "id": "dapp_000001",
  "slug": "chainlink-requests",
  "name": "Chainlink Requests",
  "logoUrl": "https://icons.llama.fi/chainlink-requests.jpg",
  "webUrl": "https://chain.link/",
  "mobileUrl": null,
  "socials": {
    "twitter": "https://x.com/chainlink"
  },
  "categories": ["Oracle"],
  "chains": [],
  "shortDescription": "...",
  "longDescription": "...",
  "sourceUrls": [
    "https://defillama.com/protocol/chainlink-keepers"
  ],
  "updatedAt": "2026-03-10T23:58:17.953Z"
}
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm web:dev` | Run the Next.js web app locally |
| `pnpm web:build` | Build the web app |
| `pnpm web:typecheck` | Type-check the web app |
| `pnpm dev:http` | Run the local HTTP API |
| `pnpm dev:mcp` | Run the local MCP server |
| `pnpm start:http` | Run the compiled HTTP API |
| `pnpm start:mcp:http` | Run the compiled MCP server over HTTP |
| `pnpm scrape` | Fetch source data and rebuild generated artifacts |
| `pnpm openapi:generate` | Regenerate `openapi/openapi.json` |
| `pnpm test` | Run Vitest |

## Notes

- The web app can run on its own because it reads `data/generated/*.json`.
- The documentation playgrounds are most useful when the HTTP API and MCP HTTP server are also running.
- The HTTP API and MCP server are read-only by design.
