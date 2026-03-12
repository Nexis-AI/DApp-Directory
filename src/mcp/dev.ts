import { createMcpServer } from "./server.js";
import { loadGeneratedCatalog } from "../catalog/load-generated.js";

const catalog = await loadGeneratedCatalog();
const server = createMcpServer(catalog);
const port = Number.parseInt(process.env.MCP_PORT ?? "8788", 10);
const host = process.env.MCP_HOST ?? "0.0.0.0";
const transport = process.env.MCP_TRANSPORT ?? "stdio";

if (transport === "http") {
  await server.start({
    transportType: "httpStream",
    httpStream: {
      host,
      port,
    },
  });
  console.log(`dApps MCP listening on http://${host}:${port}/mcp`);
} else {
  await server.start({
    transportType: "stdio",
  });
}
