"use client"

import { useState, useTransition } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import {
  HTTP_GATEWAY_PRESETS,
  LOCAL_API_BASE_URL,
  MCP_RESOURCE_PRESETS,
  MCP_TOOL_PRESETS,
} from "@/lib/documentation-content"

const textareaClassName =
  "min-h-32 w-full rounded-md border border-input bg-input/20 px-3 py-2 font-mono text-xs leading-6 text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const formatOutput = (value: unknown) => {
  if (typeof value === "string") {
    return value
  }

  return JSON.stringify(value, null, 2)
}

const readToolSample = (name: string) =>
  MCP_TOOL_PRESETS.find((tool) => tool.name === name)?.sampleQuery ?? "{}"

export function DocumentationPlaygrounds() {
  const [httpBaseUrl, setHttpBaseUrl] = useState(LOCAL_API_BASE_URL)
  const [httpPath, setHttpPath] = useState<string>(
    HTTP_GATEWAY_PRESETS[1]?.path ?? "/health",
  )
  const [httpSummary, setHttpSummary] = useState("No request sent yet.")
  const [httpResponse, setHttpResponse] = useState("")
  const [httpPending, startHttpTransition] = useTransition()

  const [mcpMode, setMcpMode] = useState<"tool" | "resource">("tool")
  const [selectedTool, setSelectedTool] = useState<string>(
    MCP_TOOL_PRESETS[0]?.name ?? "dapps_search",
  )
  const [toolArguments, setToolArguments] = useState(
    readToolSample(MCP_TOOL_PRESETS[0]?.name ?? "dapps_search"),
  )
  const [resourceUri, setResourceUri] = useState<string>(MCP_RESOURCE_PRESETS[0] ?? "catalog://dapps/chains")
  const [mcpSummary, setMcpSummary] = useState("No request sent yet.")
  const [mcpResponse, setMcpResponse] = useState("")
  const [mcpPending, startMcpTransition] = useTransition()

  const runHttpGateway = () => {
    startHttpTransition(async () => {
      try {
        const response = await fetch("/api/documentation/http-gateway", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            baseUrl: httpBaseUrl,
            path: httpPath,
          }),
        })

        const payload = await response.json()
        if (!response.ok || !payload.success) {
          setHttpSummary(payload.error?.message ?? `Gateway failed with HTTP ${response.status}.`)
          setHttpResponse(formatOutput(payload.error ?? payload))
          return
        }

        setHttpSummary(
          `${payload.data.status} ${payload.data.requestUrl} in ${payload.data.durationMs}ms`,
        )
        setHttpResponse(formatOutput(payload.data.body))
      } catch (error) {
        setHttpSummary("The API gateway request failed before reaching the upstream.")
        setHttpResponse(
          error instanceof Error ? error.message : "Unknown documentation gateway error.",
        )
      }
    })
  }

  const runMcpGateway = () => {
    startMcpTransition(async () => {
      try {
        const request =
          mcpMode === "tool"
            ? {
                type: "tool" as const,
                name: selectedTool,
                arguments: JSON.parse(toolArguments || "{}") as Record<string, unknown>,
              }
            : {
                type: "resource" as const,
                uri: resourceUri,
              }

        const response = await fetch("/api/documentation/mcp-gateway", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(request),
        })

        const payload = await response.json()
        if (!response.ok || !payload.success) {
          setMcpSummary(payload.error?.message ?? `Gateway failed with HTTP ${response.status}.`)
          setMcpResponse(formatOutput(payload.error ?? payload))
          return
        }

        setMcpSummary(`${payload.data.kind} ${payload.data.target}`)
        setMcpResponse(payload.data.payload)
      } catch (error) {
        setMcpSummary("The MCP gateway request failed before returning a payload.")
        setMcpResponse(
          error instanceof Error ? error.message : "Unknown MCP gateway error.",
        )
      }
    })
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            API gateway
          </Badge>
          <CardTitle>Run browser-safe HTTP requests against the API</CardTitle>
          <CardDescription>
            This gateway proxies GET requests from the docs UI so you can test the
            local API without browser CORS issues.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="api-base-url">
              Base URL
            </label>
            <Input
              id="api-base-url"
              value={httpBaseUrl}
              onChange={(event) => setHttpBaseUrl(event.target.value)}
              placeholder={LOCAL_API_BASE_URL}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="api-path">
              Request path
            </label>
            <Input
              id="api-path"
              value={httpPath}
              onChange={(event) => setHttpPath(event.target.value)}
              placeholder="/v1/dapps?limit=5"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {HTTP_GATEWAY_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setHttpPath(preset.path)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <Button type="button" onClick={runHttpGateway} disabled={httpPending}>
            {httpPending ? "Running request..." : "Run API gateway"}
          </Button>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Response summary</CardTitle>
              <CardDescription>{httpSummary}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
                <code>{httpResponse || "Response body will appear here."}</code>
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            MCP gateway
          </Badge>
          <CardTitle>Exercise the documented MCP tools and resources</CardTitle>
          <CardDescription>
            This gateway runs the same read-only tool and resource contract
            server-side so you can validate outputs before wiring a client.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={mcpMode === "tool" ? "default" : "outline"}
              size="sm"
              onClick={() => setMcpMode("tool")}
            >
              Tool
            </Button>
            <Button
              type="button"
              variant={mcpMode === "resource" ? "default" : "outline"}
              size="sm"
              onClick={() => setMcpMode("resource")}
            >
              Resource
            </Button>
          </div>

          {mcpMode === "tool" ? (
            <>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Tool name
                </label>
                <Select
                  value={selectedTool}
                  onValueChange={(value) => {
                    setSelectedTool(value)
                    setToolArguments(readToolSample(value))
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {MCP_TOOL_PRESETS.map((tool) => (
                      <SelectItem key={tool.name} value={tool.name}>
                        {tool.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="mcp-tool-arguments">
                  Tool arguments (JSON)
                </label>
                <textarea
                  id="mcp-tool-arguments"
                  value={toolArguments}
                  onChange={(event) => setToolArguments(event.target.value)}
                  className={textareaClassName}
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Resource preset
                </label>
                <div className="flex flex-wrap gap-2">
                  {MCP_RESOURCE_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="xs"
                      variant="outline"
                      onClick={() => setResourceUri(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="mcp-resource-uri">
                  Resource URI
                </label>
                <Input
                  id="mcp-resource-uri"
                  value={resourceUri}
                  onChange={(event) => setResourceUri(event.target.value)}
                  placeholder="catalog://dapps/uniswap"
                />
              </div>
            </>
          )}

          <Button type="button" onClick={runMcpGateway} disabled={mcpPending}>
            {mcpPending ? "Running request..." : "Run MCP gateway"}
          </Button>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Response summary</CardTitle>
              <CardDescription>{mcpSummary}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
                <code>{mcpResponse || "MCP output will appear here."}</code>
              </pre>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </section>
  )
}
