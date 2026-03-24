import fastifyHttpProxy from "@fastify/http-proxy";
import { getMcpRuntimeConfig } from "./mcp/runtime.js";
import { loadGeneratedCatalog } from "./catalog/load-generated.js";
import { createHttpServer } from "./http/server.js";
import { createMcpServer } from "./mcp/server.js";

async function main() {
  const catalog = await loadGeneratedCatalog();

  // 1. Start the MCP server on an internal port
  const mcpServer = createMcpServer(catalog);
  const mcpConfig = getMcpRuntimeConfig();
  // Using a distinct internal port, or fallback
  const internalMcpPort = Number.parseInt(process.env.MCP_INTERNAL_PORT ?? "3001", 10);
  
  await mcpServer.start({
    transportType: "httpStream",
    httpStream: {
      host: "127.0.0.1",
      port: internalMcpPort,
    },
  });
  console.log(`[Internal] MCP server listening on http://127.0.0.1:${internalMcpPort}/mcp`);

  // 2. Start the Fastify HTTP server on the exposed port
  const fastifyServer = createHttpServer({ catalog });
  const externalPort = Number.parseInt(process.env.PORT ?? "8787", 10);
  const externalHost = process.env.HOST ?? "0.0.0.0";

  // 3. Register proxy for /mcp to the internal FastMCP server
  fastifyServer.register(fastifyHttpProxy, {
    upstream: `http://127.0.0.1:${internalMcpPort}`,
    prefix: '/mcp',
    rewritePrefix: '/mcp', // keep the /mcp prefix since FastMCP expects it
    http2: false,
  });

  await fastifyServer.listen({ port: externalPort, host: externalHost });
  console.log(`[Unified] dApps API & MCP proxy listening on http://${externalHost}:${externalPort}`);
  console.log(`[Unified] - REST API: http://${externalHost}:${externalPort}/v1/dapps`);
  console.log(`[Unified] - MCP API : http://${externalHost}:${externalPort}/mcp`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
