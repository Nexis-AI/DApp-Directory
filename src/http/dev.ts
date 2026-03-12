import { createHttpServer } from "./server.js";
import { loadGeneratedCatalog } from "../catalog/load-generated.js";

const port = Number.parseInt(process.env.PORT ?? "8787", 10);
const host = process.env.HOST ?? "0.0.0.0";

const catalog = await loadGeneratedCatalog();
const server = createHttpServer({ catalog });

await server.listen({ port, host });
console.log(`dApps directory API listening on http://${host}:${port}`);
