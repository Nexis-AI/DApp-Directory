import { describe, expect, test } from "vitest";

import {
  getDocumentationApiBaseUrl,
  getDocumentationMcpHttpUrl,
  getDocumentationUpstreamHosts,
  replaceDocumentationApiBaseUrl,
  replaceDocumentationMcpHttpUrl,
} from "../apps/web/lib/documentation-config.js";
import { getOpenApiServerUrl } from "../src/http/openapi.js";
import { getMcpRuntimeConfig } from "../src/mcp/runtime.js";

describe("documentation config", () => {
  test("prefers deploy-time API and MCP URLs over localhost defaults", () => {
    const env = {
      NEXT_PUBLIC_DOCS_API_BASE_URL: "https://api.example.com/",
      NEXT_PUBLIC_DOCS_MCP_HTTP_URL: "https://mcp.example.com/mcp/",
    };

    expect(getDocumentationApiBaseUrl(env)).toBe("https://api.example.com");
    expect(getDocumentationMcpHttpUrl(env)).toBe("https://mcp.example.com/mcp");
  });

  test("keeps localhost defaults when deploy-time URLs are unset", () => {
    expect(getDocumentationApiBaseUrl({})).toBe("http://localhost:8787");
    expect(getDocumentationMcpHttpUrl({})).toBe("http://localhost:8788/mcp");
  });

  test("adds configured upstream hosts to the docs gateway allowlist", () => {
    const env = {
      NEXT_PUBLIC_DOCS_API_BASE_URL: "https://api.example.com",
      NEXT_PUBLIC_DOCS_MCP_HTTP_URL: "https://mcp.example.com/mcp",
    };

    expect(getDocumentationUpstreamHosts(env)).toEqual(
      expect.arrayContaining(["api.example.com", "mcp.example.com"]),
    );
  });

  test("rewrites embedded localhost snippets to the configured deploy-time URLs", () => {
    const env = {
      NEXT_PUBLIC_DOCS_API_BASE_URL: "https://api.example.com",
      NEXT_PUBLIC_DOCS_MCP_HTTP_URL: "https://mcp.example.com/mcp",
    };

    expect(
      replaceDocumentationApiBaseUrl(
        'curl "http://localhost:8787/v1/dapps?limit=5"',
        env,
      ),
    ).toBe('curl "https://api.example.com/v1/dapps?limit=5"');
    expect(
      replaceDocumentationMcpHttpUrl(
        "Connect to http://localhost:8788/mcp for MCP",
        env,
      ),
    ).toBe("Connect to https://mcp.example.com/mcp for MCP");
  });
});

describe("MCP runtime config", () => {
  test("falls back to Railway PORT when MCP_PORT is unset", () => {
    expect(
      getMcpRuntimeConfig({
        PORT: "4010",
        MCP_TRANSPORT: "http",
      }),
    ).toMatchObject({
      port: 4010,
      transport: "http",
    });
  });

  test("prefers MCP_PORT when both MCP_PORT and PORT are set", () => {
    expect(
      getMcpRuntimeConfig({
        PORT: "4010",
        MCP_PORT: "8788",
      }),
    ).toMatchObject({
      port: 8788,
    });
  });
});

describe("OpenAPI server URL", () => {
  test("prefers an explicit API base URL and trims trailing slashes", () => {
    expect(
      getOpenApiServerUrl({
        API_BASE_URL: "https://api.example.com/",
      }),
    ).toBe("https://api.example.com");
  });

  test("falls back to Railway public domains when no explicit API base URL is set", () => {
    expect(
      getOpenApiServerUrl({
        RAILWAY_PUBLIC_DOMAIN: "api-production.up.railway.app",
      }),
    ).toBe("https://api-production.up.railway.app");
  });
});
