import Link from "next/link"

import type { Metadata } from "next"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { DocumentationPage, DocumentationSection } from "@/components/documentation-page"
import { Pill, StatCard } from "@/components/page-frame"
import { SeoJsonLd } from "@/components/seo-json-ld"
import {
  getLocalizedMcpCapabilities,
  getLocalizedMcpResources,
  getLocalizedMcpServer,
  getLocalizedMcpTools,
} from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { localizePath } from "@/lib/i18n/pathnames"
import { translateObjectText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"

const resourceSamples = [
  "catalog://dapps/index",
  "catalog://dapps/chains",
  "catalog://dapps/uniswap",
] as const

const mcpFaqs = [
  {
    question: "Why use MCP instead of wrapping the API directly?",
    answer:
      "MCP gives agent runtimes a narrower, explicit tool and resource contract, which reduces prompt complexity and makes tool selection more predictable.",
  },
  {
    question: "Should MCP be the only integration path?",
    answer:
      "Not always. Many teams use the HTTP API for backend systems and the MCP server for analyst, IDE, or assistant workflows.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.mcpOverview, "/documentation/mcp")
}

export default async function DocumentationMcpOverviewPage() {
  const locale = await getRequestLocale()
  const server = await getLocalizedMcpServer(locale)
  const [capabilities, resources, tools, faqs, jsonLd, pageStrings] =
    await Promise.all([
      getLocalizedMcpCapabilities(locale),
      getLocalizedMcpResources(locale),
      getLocalizedMcpTools(locale),
      Promise.all(mcpFaqs.map((item) => translateObjectText(item, locale, ["question", "answer"]))),
      getLocalizedWebPageJsonLd(locale, pageSeo.mcpOverview, "/documentation/mcp"),
      translateTextBatch({
        texts: [
          "MCP overview",
          "Use MCP when an AI runtime should discover and fetch dApp directory data for itself.",
          "The MCP server narrows the catalog into read-only tools and resources that are easy for agent frameworks to reason about. It is the best fit when the runtime already supports tool or resource selection and you want to avoid exposing raw API details inside prompts.",
          "MCP",
          "AI agents",
          "Read-only tools",
          "Server",
          "Capabilities and server shape",
          "The exposed capabilities are intentionally narrow so agent behavior stays predictable and auditable.",
          "What the MCP server is optimized for",
          "Use it for discovery, lookup, aggregates, and resource reads inside tool-capable runtimes.",
          "Server",
          `Version ${server.version}`,
          "Tools",
          "Search, exact lookup, chains, and categories for read-only workflows.",
          "Resources",
          "Full index, chains, categories, and per-dApp resource shapes.",
          "Instructions",
          "How the server presents itself to agent runtimes",
          "This is the server framing most clients will surface when the MCP connection succeeds.",
          "Use stdio for local-first clients and private workstation tooling. Use HTTP only when the client can reach a shared remote endpoint over HTTPS.",
          "Search, fetch-by-id, and aggregate summaries are usually enough for discovery, planning, and enrichment.",
          "Canonical resource URIs",
          "Tools",
          "Tool reference and parameter shapes",
          "These are the read-only actions agents can take once the server is connected.",
          "Tool",
          "read-only",
          "no parameters",
          "Client tutorials",
          "Move into client-specific setup once the MCP model is clear",
          "Use the client hub for IDEs, assistants, and CLIs. Each tutorial now lives on its own route.",
          "Client-specific configuration",
          "Open the client hub to choose Cursor, Claude, ChatGPT, Codex, Gemini, Claude Code, and other dedicated setup tutorials.",
          "Open client setup",
          "Resource",
        ],
        targetLocale: locale,
      }),
    ])

  const [
    eyebrow,
    title,
    description,
    tagOne,
    tagTwo,
    tagThree,
    serverEyebrow,
    serverTitle,
    serverDescription,
    optimizedTitle,
    optimizedDescription,
    serverStatLabel,
    serverStatDetail,
    toolsStatLabel,
    toolsStatDetail,
    resourcesStatLabel,
    resourcesStatDetail,
    instructionsEyebrow,
    instructionsTitle,
    instructionsDescription,
    localFirstParagraph,
    secondParagraph,
    resourceUrisTitle,
    toolsEyebrow,
    toolsTitle,
    toolsDescription,
    toolBadge,
    readOnlyLabel,
    noParametersLabel,
    clientTutorialsEyebrow,
    clientTutorialsTitle,
    clientTutorialsDescription,
    clientConfigTitle,
    clientConfigDescription,
    openClientSetupLabel,
    resourceBadge,
  ] = pageStrings

  return (
    <>
      <SeoJsonLd data={jsonLd} />

      <DocumentationPage
        eyebrow={eyebrow ?? ""}
        title={title ?? ""}
        description={description ?? ""}
        tags={[tagOne ?? "", tagTwo ?? "", tagThree ?? ""]}
        faqs={faqs}
      >
        <DocumentationSection
          eyebrow={serverEyebrow ?? ""}
          title={serverTitle ?? ""}
          description={serverDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{optimizedTitle}</CardTitle>
                <CardDescription>{optimizedDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {capabilities.map((capability) => (
                  <Pill key={capability}>{capability}</Pill>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <StatCard label={serverStatLabel ?? ""} value={server.name} detail={serverStatDetail ?? ""} />
              <StatCard
                label={toolsStatLabel ?? ""}
                value={tools.length.toString()}
                detail={toolsStatDetail ?? ""}
              />
              <StatCard
                label={resourcesStatLabel ?? ""}
                value={resources.length.toString()}
                detail={resourcesStatDetail ?? ""}
              />
            </div>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={instructionsEyebrow ?? ""}
          title={instructionsTitle ?? ""}
          description={instructionsDescription ?? ""}
        >
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{server.name}</CardTitle>
                <CardDescription>{server.instructions}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <p>{localFirstParagraph}</p>
                <p>{secondParagraph}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{resourceUrisTitle}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {resourceSamples.map((sample) => (
                  <pre
                    key={sample}
                    className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground"
                  >
                    <code>{sample}</code>
                  </pre>
                ))}
              </CardContent>
            </Card>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={toolsEyebrow ?? ""}
          title={toolsTitle ?? ""}
          description={toolsDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {tools.map((tool) => (
              <Card key={tool.name}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="outline" className="w-fit">
                        {toolBadge}
                      </Badge>
                      <CardTitle className="mt-3 text-2xl">{tool.name}</CardTitle>
                    </div>
                    <Pill variant="secondary">{readOnlyLabel}</Pill>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {tool.parameters.length === 0 ? <Pill>{noParametersLabel}</Pill> : null}
                    {tool.parameters.map((parameter) => (
                      <Pill key={`${tool.name}-${parameter}`}>{parameter}</Pill>
                    ))}
                  </div>

                  <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
                    <code>{tool.sampleQuery}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={clientTutorialsEyebrow ?? ""}
          title={clientTutorialsTitle ?? ""}
          description={clientTutorialsDescription ?? ""}
        >
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">{clientConfigTitle}</p>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                {clientConfigDescription}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={localizePath("/documentation/mcp/clients", locale)}>
                {openClientSetupLabel}
              </Link>
            </Button>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {resources.map((resource) => (
              <Card key={resource.uri}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {resourceBadge}
                  </Badge>
                  <CardTitle className="text-2xl">{resource.uri}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
