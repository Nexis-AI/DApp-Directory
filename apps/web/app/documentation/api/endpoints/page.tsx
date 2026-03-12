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
import { Pill, StatCard } from "@/components/page-frame"
import { SeoJsonLd } from "@/components/seo-json-ld"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateObjectText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"
import { getOpenApiDocument } from "@/lib/site-data"

const curlSamples = [
  {
    label: "List Base DeFi dApps",
    command:
      "curl 'http://localhost:8787/v1/dapps?chain=Base&category=DeFi&limit=10'",
  },
  {
    label: "Search by text",
    command: "curl 'http://localhost:8787/v1/dapps?q=prediction%20market&page=1&limit=5'",
  },
  {
    label: "Get a single record",
    command: "curl 'http://localhost:8787/v1/dapps/uniswap'",
  },
] as const

const endpointFaqs = [
  {
    question: "Is this generated from the OpenAPI file or hand-maintained?",
    answer:
      "This page reads from the generated OpenAPI document, so the route list and parameter shapes stay aligned with the current API contract.",
  },
  {
    question: "Why are all routes GET-only?",
    answer:
      "The current directory API is intentionally read-only. It is designed for search, discovery, and reference access rather than mutation.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.apiEndpoints, "/documentation/api/endpoints")
}

export default async function DocumentationApiEndpointsPage() {
  const locale = await getRequestLocale()
  const document = await getOpenApiDocument()
  const endpoints = Object.entries(document.paths).flatMap(([path, methods]) => {
    if (!methods.get) {
      return []
    }

    return [
      {
        method: "GET",
        path,
        summary: methods.get.summary ?? "No summary",
        parameters: methods.get.parameters ?? [],
      },
    ]
  })

  const [faqs, localizedCurlSamples, jsonLd, pageStrings] = await Promise.all([
    Promise.all(endpointFaqs.map((item) => translateObjectText(item, locale, ["question", "answer"]))),
    Promise.all(curlSamples.map((sample) => translateObjectText(sample, locale, ["label"]))),
    getLocalizedWebPageJsonLd(locale, pageSeo.apiEndpoints, "/documentation/api/endpoints"),
    translateTextBatch({
      texts: [
        "Endpoint reference",
        "Full HTTP contract for the Web3 dApp directory API.",
        "This reference is derived from the generated OpenAPI document and is the authoritative route-level contract for API users that need the exact path, parameter list, or sample request shape.",
        "OpenAPI",
        "Route reference",
        "HTTP contract",
        "Summary",
        "OpenAPI version, server, and sample calls",
        "Use this top section when you need the route inventory and the smallest possible request examples.",
        "HTTP entrypoints",
        "Base URL, OpenAPI JSON, and the standard response envelope used by data routes.",
        "Base URL",
        "OpenAPI JSON",
        "Response envelope",
        "OpenAPI",
        "Endpoints",
        "Routes",
        "Route and parameter reference",
        "Every current GET route is listed below with its parameter shapes and summary.",
        "params",
        "No parameters.",
        "required",
        "optional",
        "No summary",
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
    summaryEyebrow,
    summaryTitle,
    summaryDescription,
    httpEntrypointsTitle,
    httpEntrypointsDescription,
    baseUrlLabel,
    openApiJsonLabel,
    responseEnvelopeLabel,
    openApiLabel,
    endpointsLabel,
    routesEyebrow,
    routesTitle,
    routesDescription,
    paramsLabel,
    noParametersLabel,
    requiredLabel,
    optionalLabel,
    noSummaryLabel,
  ] = pageStrings

  const localizedEndpoints =
    locale === "en"
      ? endpoints
      : await Promise.all(
          endpoints.map(async (endpoint) => ({
            ...endpoint,
            summary:
              endpoint.summary === "No summary"
                ? noSummaryLabel ?? endpoint.summary
                : (
                    await translateObjectText(endpoint, locale, ["summary"])
                  ).summary,
            parameters: await Promise.all(
              endpoint.parameters.map((parameter) =>
                parameter.description
                  ? translateObjectText(parameter, locale, ["description"])
                  : Promise.resolve(parameter),
              ),
            ),
          })),
        )

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
          eyebrow={summaryEyebrow ?? ""}
          title={summaryTitle ?? ""}
          description={summaryDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{httpEntrypointsTitle}</CardTitle>
                <CardDescription>{httpEntrypointsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <p>
                  {baseUrlLabel}:{" "}
                  <span className="font-mono text-foreground">
                    {document.servers?.[0]?.url ?? "http://localhost:8787"}
                  </span>
                </p>
                <p>
                  {openApiJsonLabel}:{" "}
                  <span className="font-mono text-foreground">/openapi.json</span>
                </p>
                <p>
                  {responseEnvelopeLabel}:{" "}
                  <span className="font-mono text-foreground">
                    {"{ success, data, meta? }"}
                  </span>
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <StatCard
                label={openApiLabel ?? ""}
                value={document.openapi}
                detail={`${document.info.title} v${document.info.version}`}
              />
              <StatCard
                label={endpointsLabel ?? ""}
                value={endpoints.length.toString()}
                detail={`Primary server: ${document.servers?.[0]?.url ?? "http://localhost:8787"}`}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {localizedCurlSamples.map((sample) => (
              <Card key={sample.label}>
                <CardHeader>
                  <CardTitle>{sample.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
                    <code>{sample.command}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={routesEyebrow ?? ""}
          title={routesTitle ?? ""}
          description={routesDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {localizedEndpoints.map((endpoint) => (
              <Card key={endpoint.path}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Pill>{endpoint.method}</Pill>
                      <CardTitle className="mt-3 text-2xl">{endpoint.path}</CardTitle>
                    </div>
                    <Pill variant="secondary">
                      {endpoint.parameters.length} {paramsLabel}
                    </Pill>
                  </div>
                  <CardDescription>{endpoint.summary}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {endpoint.parameters.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{noParametersLabel}</p>
                  ) : (
                    endpoint.parameters.map((parameter) => (
                      <Card key={`${endpoint.path}-${parameter.name}`} size="sm">
                        <CardContent className="space-y-2 pt-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm text-foreground">
                              {parameter.name}
                            </span>
                            <Pill>{parameter.in}</Pill>
                            {parameter.required ? (
                              <Pill variant="secondary">{requiredLabel}</Pill>
                            ) : (
                              <Pill variant="secondary">{optionalLabel}</Pill>
                            )}
                            {parameter.schema?.type ? (
                              <Pill variant="secondary">{parameter.schema.type}</Pill>
                            ) : null}
                          </div>
                          {parameter.description ? (
                            <p className="text-sm leading-6 text-muted-foreground">
                              {parameter.description}
                            </p>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
