import { createMcpServer } from "./server.js";
import { loadGeneratedCatalog } from "../catalog/load-generated.js";
import { getMcpRuntimeConfig } from "./runtime.js";

const catalog = await loadGeneratedCatalog();
const server = createMcpServer(catalog);
const { host, port, transport } = getMcpRuntimeConfig();

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
