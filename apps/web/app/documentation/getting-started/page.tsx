import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import {
  DocumentationPage,
  DocumentationSection,
} from "@/components/documentation-page"
import { DocumentationPlaygrounds } from "@/components/documentation-playgrounds"
import { Pill, StatCard } from "@/components/page-frame"
import { SeoJsonLd } from "@/components/seo-json-ld"
import {
  DOCUMENTATION_API_BASE_URL,
  DOCUMENTATION_MCP_HTTP_URL,
} from "@/lib/documentation-config"
import {
  getLocalizedHttpGatewayPresets,
  getLocalizedMcpResourcePresets,
  getLocalizedMcpToolPresets,
  getLocalizedRuntimeCommands,
} from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateObjectText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"

const gettingStartedFaqs = [
  {
    question: "Which surface should I start first?",
    answer:
      "Start with the HTTP API if you want simple request testing. Start with MCP if your main goal is configuring an assistant or IDE client.",
  },
  {
    question: "Do I need both API and MCP running at the same time?",
    answer:
      "No. You can validate them independently, but running both locally makes it easier to compare deterministic HTTP responses with MCP tool output.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.gettingStarted, "/documentation/getting-started")
}

export default async function DocumentationGettingStartedPage() {
  const locale = await getRequestLocale()
  const [runtimeCommands, httpPresets, mcpToolPresets, mcpResourcePresets, faqs, jsonLd, pageStrings] =
    await Promise.all([
      getLocalizedRuntimeCommands(locale),
      getLocalizedHttpGatewayPresets(locale),
      getLocalizedMcpToolPresets(locale),
      getLocalizedMcpResourcePresets(locale),
      Promise.all(
        gettingStartedFaqs.map((item) => translateObjectText(item, locale, ["question", "answer"])),
      ),
      getLocalizedWebPageJsonLd(locale, pageSeo.gettingStarted, "/documentation/getting-started"),
      translateTextBatch({
        texts: [
          "Getting started",
          "Run both surfaces locally and make the first request before integrating.",
          "Start the HTTP API for deterministic request testing. Start the MCP server when you need agent tools, resource templates, or client-side MCP configuration. Validate both locally before exposing anything to a shared environment.",
          "Quickstart",
          "Local validation",
          "API and MCP",
          "Runtime",
          "Local endpoints and startup order",
          "Bring the servers up locally first so the rest of the documentation becomes configuration work instead of transport debugging.",
          "The local runtime surface you should expect",
          "Use these values while validating the examples and interactive docs tools.",
          "API base",
          "MCP HTTP",
          "MCP stdio",
          "Step 1",
          "Run",
          "Start the HTTP API or the MCP server depending on the surface you want to validate first.",
          "Step 2",
          "Validate",
          "Use the presets and docs playgrounds to confirm both transports are responding locally.",
          "Step 3",
          "Integrate",
          "Move into API, MCP, guides, or examples once the local contract is behaving as expected.",
          "Commands",
          "Commands to run locally",
          "Use these exact commands before you open the interactive docs tools or register an MCP client.",
          "Runtime commands",
          "Start from these commands and change transport only when the client requires it.",
          "First checks",
          "If these requests work locally, the rest of the integration should stay focused on app logic.",
          "HTTP presets",
          "MCP tool presets",
          "MCP resource presets",
          "Validation",
          "Use the playgrounds to test without leaving the docs",
          "The HTTP playground proxies GET requests through the Next app. The MCP playground replays the documented read-only contract against the local catalog so you can validate payloads before configuring a real client.",
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
    runtimeEyebrow,
    runtimeTitle,
    runtimeDescription,
    localRuntimeTitle,
    localRuntimeDescription,
    apiBaseLabel,
    mcpHttpLabel,
    mcpStdioLabel,
    stepOneLabel,
    stepOneValue,
    stepOneDetail,
    stepTwoLabel,
    stepTwoValue,
    stepTwoDetail,
    stepThreeLabel,
    stepThreeValue,
    stepThreeDetail,
    commandsEyebrow,
    commandsTitle,
    commandsDescription,
    runtimeCommandsTitle,
    runtimeCommandsDescription,
    firstChecksTitle,
    firstChecksDescription,
    httpPresetsLabel,
    mcpToolPresetsLabel,
    mcpResourcePresetsLabel,
    validationEyebrow,
    validationTitle,
    validationDescription,
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
          eyebrow={runtimeEyebrow ?? ""}
          title={runtimeTitle ?? ""}
          description={runtimeDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{localRuntimeTitle}</CardTitle>
                <CardDescription>{localRuntimeDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Pill>{apiBaseLabel}: {DOCUMENTATION_API_BASE_URL}</Pill>
                <Pill variant="secondary">{mcpHttpLabel}: {DOCUMENTATION_MCP_HTTP_URL}</Pill>
                <Pill variant="secondary">{mcpStdioLabel}: pnpm dev:mcp</Pill>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <StatCard label={stepOneLabel ?? ""} value={stepOneValue ?? ""} detail={stepOneDetail ?? ""} />
              <StatCard label={stepTwoLabel ?? ""} value={stepTwoValue ?? ""} detail={stepTwoDetail ?? ""} />
              <StatCard label={stepThreeLabel ?? ""} value={stepThreeValue ?? ""} detail={stepThreeDetail ?? ""} />
            </div>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={commandsEyebrow ?? ""}
          title={commandsTitle ?? ""}
          description={commandsDescription ?? ""}
        >
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{runtimeCommandsTitle}</CardTitle>
                <CardDescription>{runtimeCommandsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {runtimeCommands.map((command) => (
                  <Card key={command.label} size="sm">
                    <CardHeader>
                      <CardTitle>{command.label}</CardTitle>
                      <CardDescription>{command.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
                        <code>{command.command}</code>
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{firstChecksTitle}</CardTitle>
                <CardDescription>{firstChecksDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {httpPresetsLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {httpPresets.map((preset) => (
                      <Pill key={preset.path}>
                        {preset.label}: {preset.path}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {mcpToolPresetsLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mcpToolPresets.map((preset) => (
                      <Pill key={preset.name} variant="secondary">
                        {preset.name}
                      </Pill>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                    {mcpResourcePresetsLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mcpResourcePresets.map((preset) => (
                      <Pill key={preset} variant="secondary">
                        {preset}
                      </Pill>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={validationEyebrow ?? ""}
          title={validationTitle ?? ""}
          description={validationDescription ?? ""}
        >
          <DocumentationPlaygrounds />
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
