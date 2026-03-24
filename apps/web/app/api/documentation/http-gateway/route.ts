import { NextRequest, NextResponse } from "next/server"

import {
  DOCUMENTATION_API_BASE_URL,
  getDocumentationUpstreamHosts,
} from "@/lib/documentation-config"
import { buildDocumentationGatewayUrl } from "@/lib/documentation-gateway"
import { siteUrl } from "@/lib/seo"

const readRequestBody = async (request: NextRequest) => {
  try {
    return (await request.json()) as {
      baseUrl?: unknown
      path?: unknown
    }
  } catch {
    return null
  }
}

const buildAllowedHosts = (request: NextRequest) => {
  const allowedHosts = new Set(["127.0.0.1", "0.0.0.0", "localhost"])
  allowedHosts.add(request.nextUrl.hostname)
  getDocumentationUpstreamHosts().forEach((host) => allowedHosts.add(host))

  try {
    allowedHosts.add(new URL(siteUrl).hostname)
  } catch {
    // Ignore invalid env configuration and keep the local host allowlist.
  }

  return [...allowedHosts]
}

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request)
  if (!body) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "The API gateway expects a JSON body.",
        },
      },
      { status: 400 },
    )
  }

  const baseUrl =
    typeof body.baseUrl === "string" ? body.baseUrl : DOCUMENTATION_API_BASE_URL
  const path = typeof body.path === "string" ? body.path : "/health"

  try {
    const upstreamUrl = buildDocumentationGatewayUrl(
      baseUrl,
      path,
      buildAllowedHosts(request),
    )
    const startedAt = Date.now()
    const response = await fetch(upstreamUrl, {
      headers: {
        accept: "application/json, text/plain;q=0.9, */*;q=0.8",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    const durationMs = Date.now() - startedAt
    const contentType = response.headers.get("content-type")
    const rawBody = await response.text()

    let parsedBody: unknown = rawBody
    if (contentType?.includes("application/json")) {
      try {
        parsedBody = JSON.parse(rawBody)
      } catch {
        parsedBody = rawBody
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        requestUrl: upstreamUrl.toString(),
        status: response.status,
        ok: response.ok,
        durationMs,
        contentType,
        body: parsedBody,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown API gateway error."

    return NextResponse.json(
      {
        success: false,
        error: {
          message,
        },
      },
      {
        status:
          message.includes("Unsupported host") ||
          message.includes("required") ||
          message.includes("Only HTTP")
            ? 400
            : 502,
      },
    )
  }
}
