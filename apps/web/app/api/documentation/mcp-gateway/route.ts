import { NextRequest, NextResponse } from "next/server"

import {
  type McpGatewayRequest,
  runMcpGatewayRequest,
} from "@/lib/documentation-gateway"
import {
  getCategorySummary,
  getChainSummary,
  getDirectoryCatalog,
} from "@/lib/site-data"

const readRequestBody = async (request: NextRequest) => {
  try {
    return (await request.json()) as Partial<McpGatewayRequest>
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const body = await readRequestBody(request)
  if (!body || (body.type !== "tool" && body.type !== "resource")) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "The MCP gateway expects a tool or resource request body.",
        },
      },
      { status: 400 },
    )
  }

  try {
    const [catalog, chains, categories] = await Promise.all([
      getDirectoryCatalog(),
      getChainSummary(),
      getCategorySummary(),
    ])

    const result = runMcpGatewayRequest(
      { catalog, chains, categories },
      body as McpGatewayRequest,
    )

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Unknown MCP gateway error.",
        },
      },
      { status: 400 },
    )
  }
}
