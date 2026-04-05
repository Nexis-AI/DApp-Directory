type RuntimeEnv = Record<string, string | undefined>;

const DEFAULT_OPENAPI_SERVER_URL = "http://localhost:8787";

const normalizeAbsoluteUrl = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  try {
    return new URL(trimmed).toString().replace(/\/+$/, "");
  } catch {
    return undefined;
  }
};

const getRailwayPublicUrl = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return `https://${trimmed.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
};

export const getOpenApiServerUrl = (env: RuntimeEnv = process.env): string =>
  normalizeAbsoluteUrl(env.API_BASE_URL) ??
  normalizeAbsoluteUrl(env.PUBLIC_API_BASE_URL) ??
  getRailwayPublicUrl(env.RAILWAY_PUBLIC_DOMAIN) ??
  DEFAULT_OPENAPI_SERVER_URL;

const socialLinksSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    twitter: { type: "string", format: "uri" },
    discord: { type: "string", format: "uri" },
    telegram: { type: "string", format: "uri" },
    github: { type: "string", format: "uri" },
    youtube: { type: "string", format: "uri" },
    instagram: { type: "string", format: "uri" },
    facebook: { type: "string", format: "uri" },
    linkedin: { type: "string", format: "uri" },
    medium: { type: "string", format: "uri" },
    reddit: { type: "string", format: "uri" },
    substack: { type: "string", format: "uri" },
    farcaster: { type: "string", format: "uri" },
    lens: { type: "string", format: "uri" },
  },
} as const;

const metaSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    page: { type: "integer", minimum: 1 },
    limit: { type: "integer", minimum: 1 },
    total: { type: "integer", minimum: 0 },
    hasMore: { type: "boolean" },
    generatedAt: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
  },
} as const;

export const buildOpenApiDocument = (serverUrl = getOpenApiServerUrl()) => ({
  openapi: "3.1.0",
  info: {
    title: "Nexis dApps Directory API",
    version: "0.1.0",
    description:
      "Canonical Web3, NFT, and dApp catalog for Nexis web, mobile, and agent clients.",
  },
  servers: [
    {
      url: serverUrl,
    },
  ],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/HealthResponse",
                },
              },
            },
          },
        },
      },
    },
    "/openapi.json": {
      get: {
        summary: "OpenAPI document",
        responses: {
          "200": {
            description: "OpenAPI 3.1 document",
          },
        },
      },
    },
    "/v1/dapps": {
      get: {
        summary: "List dApps",
        parameters: [
          {
            in: "query",
            name: "q",
            schema: { type: "string" },
            description: "Free-text search across names, descriptions, categories, and chains.",
          },
          {
            in: "query",
            name: "chain",
            schema: { type: "string" },
            description: "Exact chain filter.",
          },
          {
            in: "query",
            name: "category",
            schema: { type: "string" },
            description: "Exact category filter.",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", minimum: 1, default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", minimum: 1, maximum: 250, default: 50 },
          },
          {
            in: "query",
            name: "lang",
            schema: {
              type: "string",
              enum: ["en", "es", "zh", "hi", "pt", "nl", "de", "ar", "ja", "id", "fr", "bn"],
              default: "en",
            },
            description: "Optional locale used to translate human-readable catalog fields.",
          },
        ],
        responses: {
          "200": {
            description: "Paged dApp results",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DappListResponse",
                },
              },
            },
          },
        },
      },
    },
    "/v1/dapps/featured": {
      get: {
        summary: "List featured dApps",
        parameters: [
          {
            in: "query",
            name: "lang",
            schema: {
              type: "string",
              enum: ["en", "es", "zh", "hi", "pt", "nl", "de", "ar", "ja", "id", "fr", "bn"],
              default: "en",
            },
            description: "Optional locale used to translate human-readable catalog fields.",
          },
        ],
        responses: {
          "200": {
            description: "Curated featured dApps",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DappFeaturedResponse",
                },
              },
            },
          },
        },
      },
    },
    "/v1/dapps/browse": {
      get: {
        summary: "List chain browse rows with category previews",
        parameters: [
          {
            in: "query",
            name: "chainLimit",
            schema: { type: "integer", minimum: 1, maximum: 24, default: 12 },
          },
          {
            in: "query",
            name: "categoryLimit",
            schema: { type: "integer", minimum: 1, maximum: 12, default: 8 },
          },
          {
            in: "query",
            name: "lang",
            schema: {
              type: "string",
              enum: ["en", "es", "zh", "hi", "pt", "nl", "de", "ar", "ja", "id", "fr", "bn"],
              default: "en",
            },
            description: "Optional locale used to translate human-readable catalog fields.",
          },
        ],
        responses: {
          "200": {
            description: "Chain-first browse rows for mobile directory views",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DappBrowseResponse",
                },
              },
            },
          },
        },
      },
    },
    "/v1/dapps/{id}": {
      get: {
        summary: "Get a dApp by id or slug",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
          {
            in: "query",
            name: "lang",
            schema: {
              type: "string",
              enum: ["en", "es", "zh", "hi", "pt", "nl", "de", "ar", "ja", "id", "fr", "bn"],
              default: "en",
            },
            description: "Optional locale used to translate human-readable catalog fields.",
          },
        ],
        responses: {
          "200": {
            description: "Single dApp record",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DappDetailResponse",
                },
              },
            },
          },
          "404": {
            description: "dApp not found",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/v1/chains": {
      get: {
        summary: "List chains",
        parameters: [
          {
            in: "query",
            name: "lang",
            schema: {
              type: "string",
              enum: ["en", "es", "zh", "hi", "pt", "nl", "de", "ar", "ja", "id", "fr", "bn"],
              default: "en",
            },
            description: "Optional locale used to translate chain labels.",
          },
        ],
        responses: {
          "200": {
            description: "Chain summary list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ChainListResponse",
                },
              },
            },
          },
        },
      },
    },
    "/v1/categories": {
      get: {
        summary: "List categories",
        parameters: [
          {
            in: "query",
            name: "lang",
            schema: {
              type: "string",
              enum: ["en", "es", "zh", "hi", "pt", "nl", "de", "ar", "ja", "id", "fr", "bn"],
              default: "en",
            },
            description: "Optional locale used to translate category labels.",
          },
        ],
        responses: {
          "200": {
            description: "Category summary list",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CategoryListResponse",
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      SocialLinks: socialLinksSchema,
      CatalogItem: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "slug",
          "name",
          "categories",
          "chains",
          "shortDescription",
          "longDescription",
          "sourceUrls",
          "updatedAt",
        ],
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
          name: { type: "string" },
          logoUrl: { anyOf: [{ type: "string", format: "uri" }, { type: "null" }] },
          webUrl: { anyOf: [{ type: "string", format: "uri" }, { type: "null" }] },
          mobileUrl: { anyOf: [{ type: "string", format: "uri" }, { type: "null" }] },
          socials: { $ref: "#/components/schemas/SocialLinks" },
          categories: {
            type: "array",
            items: { type: "string" },
          },
          chains: {
            type: "array",
            items: { type: "string" },
          },
          shortDescription: { type: "string" },
          longDescription: { type: "string" },
          sourceUrls: {
            type: "array",
            items: { type: "string", format: "uri" },
          },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      MobileCatalogItem: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "slug",
          "name",
          "description",
          "categories",
          "chains",
          "walletFamilies",
          "launchUrl",
          "inAppBrowserAllowed",
          "shortDescription",
          "longDescription",
          "sourceUrls",
          "updatedAt",
        ],
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          logoUrl: { anyOf: [{ type: "string", format: "uri" }, { type: "null" }] },
          webUrl: { anyOf: [{ type: "string", format: "uri" }, { type: "null" }] },
          mobileUrl: { anyOf: [{ type: "string", format: "uri" }, { type: "null" }] },
          launchUrl: { type: "string" },
          socials: { $ref: "#/components/schemas/SocialLinks" },
          categories: {
            type: "array",
            items: { type: "string" },
          },
          chains: {
            type: "array",
            items: { type: "string" },
          },
          walletFamilies: {
            type: "array",
            items: {
              type: "string",
              enum: ["evm", "solana"],
            },
          },
          featuredRank: {
            anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }],
          },
          inAppBrowserAllowed: { type: "boolean" },
          shortDescription: { type: "string" },
          longDescription: { type: "string" },
          sourceUrls: {
            type: "array",
            items: { type: "string", format: "uri" },
          },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CountSummary: {
        type: "object",
        additionalProperties: false,
        required: ["name", "count"],
        properties: {
          name: { type: "string" },
          count: { type: "integer", minimum: 0 },
        },
      },
      DappListResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", const: true },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/MobileCatalogItem" },
              },
            },
          },
          meta: metaSchema,
        },
      },
      DappFeaturedResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", const: true },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/MobileCatalogItem" },
              },
            },
          },
          meta: metaSchema,
        },
      },
      DappBrowseCategoryPreview: {
        type: "object",
        additionalProperties: false,
        required: ["id", "chain", "title", "total", "dapps"],
        properties: {
          id: { type: "string" },
          chain: { type: "string" },
          category: { anyOf: [{ type: "string" }, { type: "null" }] },
          title: { type: "string" },
          total: { type: "integer", minimum: 0 },
          dapps: {
            type: "array",
            items: { $ref: "#/components/schemas/MobileCatalogItem" },
          },
        },
      },
      DappBrowseRow: {
        type: "object",
        additionalProperties: false,
        required: ["chain", "total", "categories"],
        properties: {
          chain: { type: "string" },
          total: { type: "integer", minimum: 0 },
          categories: {
            type: "array",
            items: { $ref: "#/components/schemas/DappBrowseCategoryPreview" },
          },
        },
      },
      DappBrowseResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", const: true },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/DappBrowseRow" },
              },
            },
          },
          meta: metaSchema,
        },
      },
      DappDetailResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", const: true },
          data: { $ref: "#/components/schemas/MobileCatalogItem" },
          meta: metaSchema,
        },
      },
      ChainListResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", const: true },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/CountSummary" },
              },
            },
          },
          meta: metaSchema,
        },
      },
      CategoryListResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", const: true },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["items"],
            properties: {
              items: {
                type: "array",
                items: { $ref: "#/components/schemas/CountSummary" },
              },
            },
          },
          meta: metaSchema,
        },
      },
      HealthResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "data"],
        properties: {
          success: { type: "boolean", const: true },
          data: {
            type: "object",
            additionalProperties: false,
            required: ["status"],
            properties: {
              status: { type: "string", enum: ["ok"] },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        additionalProperties: false,
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", const: false },
          error: {
            type: "object",
            additionalProperties: false,
            required: ["code", "message"],
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
    },
  },
});
