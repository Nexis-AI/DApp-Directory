import { createHash } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

const DEFAULT_CACHE_CONTROL = "public, max-age=300, stale-while-revalidate=900";

export const buildEntityTag = (value: unknown) =>
  `"${createHash("sha1").update(JSON.stringify(value)).digest("hex")}"`;

export const applyCacheHeaders = (
  request: FastifyRequest,
  reply: FastifyReply,
  etag: string,
  cacheControl = DEFAULT_CACHE_CONTROL,
) => {
  reply.header("Cache-Control", cacheControl);
  reply.header("ETag", etag);

  const ifNoneMatch = request.headers["if-none-match"];
  if (typeof ifNoneMatch !== "string") {
    return false;
  }

  const requestedTags = ifNoneMatch.split(",").map((value) => value.trim());
  if (!requestedTags.includes(etag)) {
    return false;
  }

  reply.code(304);
  return true;
};
