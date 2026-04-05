import { createHttpServer } from "./server.js";
import { loadGeneratedCatalog, loadGeneratedMeta } from "../catalog/load-generated.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const host = process.env.HOST ?? "0.0.0.0";

const [catalog, generatedMeta] = await Promise.all([
  loadGeneratedCatalog(),
  loadGeneratedMeta(),
]);
const server = createHttpServer({ catalog, generatedMeta });

await server.listen({ port, host });
console.log(`dApps directory API listening on http://${host}:${port}`);
