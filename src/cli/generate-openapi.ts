import { resolve } from "node:path";

import { writeJsonFile } from "../utils/fs.js";
import { buildOpenApiDocument } from "../http/openapi.js";

const outputPath = resolve(process.cwd(), "openapi/openapi.json");
await writeJsonFile(outputPath, buildOpenApiDocument());

console.log(`OpenAPI spec written to ${outputPath}`);
