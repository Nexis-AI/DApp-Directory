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
import { DOCUMENTATION_API_BASE_URL } from "@/lib/documentation-config"
import { getLocalizedImplementationGuideCards } from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { localizePath } from "@/lib/i18n/pathnames"
import { translateObjectText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"
import { getOpenApiDocument } from "@/lib/site-data"

const apiOverviewFaqs = [
  {
    question: "When should I use the API instead of MCP?",
    answer:
      "Use the API when your runtime already speaks HTTP and you want predictable request, cache, and pagination behavior. Use MCP when an AI runtime should decide when to search or fetch.",
  },
  {
    question: "Is the API write-capable?",
    answer:
      "No. The current surface is read-only and focused on directory lookup, filtering, and reference metadata.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.apiReference, "/documentation/api")
}

export default async function DocumentationApiOverviewPage() {
  const locale = await getRequestLocale()
  const document = await getOpenApiDocument()
  const endpoints = Object.values(document.paths).filter((path) => path.get).length

  const [guides, faqs, jsonLd, pageStrings] = await Promise.all([
    getLocalizedImplementationGuideCards(locale),
    Promise.all(apiOverviewFaqs.map((item) => translateObjectText(item, locale, ["question", "answer"]))),
    getLocalizedWebPageJsonLd(locale, pageSeo.apiReference, "/documentation/api"),
    translateTextBatch({
      texts: [
        "API overview",
        "Use the HTTP API when your runtime wants plain JSON and predictable filters.",
        "The API is the right fit for web apps, backend jobs, dashboards, search indexing, and any environment that already works well with REST-style request and response flows.",
        "HTTP",
        "OpenAPI",
        "Read-only JSON",
        "Contract",
        "What the API exposes",
        "Keep envelope parsing in one place and use exact filters for chain, category, page, and limit.",
        "API base, response envelope, and filter model",
        "These are the core assumptions most clients need before they open the full endpoint reference.",
        "Base URL",
        "OpenAPI",
        "Response",
        "Routes",
        "Read-only GET routes for health, catalog access, chains, categories, and the OpenAPI document.",
        "Filters",
        "Combine text search and exact filters to shape results without large post-processing passes.",
        "Behavior",
        "What to expect from the API contract",
        "Use `/v1/dapps` for lists and `/v1/dapps/{id}` for stable record lookup by slug or id.",
        "Request model",
        "List queries compose naturally with URLSearchParams. The chain and category endpoints are useful for selectors, filters, and directory navigation.",
        "The list response carries pagination metadata so you do not need to infer totals from item count alone.",
        "Stable IDs and slugs",
        "Exact chain/category filters",
        "List + aggregate helpers",
        "Next steps",
        "Choose the page that matches your next decision.",
        "Need exact endpoints and parameters?",
        "Jump into the full endpoint reference generated from OpenAPI.",
        "Endpoint reference",
        "Need implementation guidance?",
        "Use the task-oriented guides once the route contract is clear.",
        "Implementation guides",
        "Implementation",
        "Common ways teams wire the API into real systems",
        "These patterns are optimized for apps, services, and agent runtimes that want a deterministic JSON surface.",
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
    contractEyebrow,
    contractTitle,
    contractDescription,
    contractCardTitle,
    contractCardDescription,
    baseUrlLabel,
    openApiLabel,
    responseLabel,
    routesLabel,
    routesDetail,
    filtersLabel,
    filtersDetail,
    behaviorEyebrow,
    behaviorTitle,
    behaviorDescription,
    requestModelTitle,
    requestModelParagraphOne,
    requestModelParagraphTwo,
    stableIdsLabel,
    exactFiltersLabel,
    aggregateHelpersLabel,
    nextStepsTitle,
    nextStepsDescription,
    exactEndpointsTitle,
    exactEndpointsDescription,
    endpointReferenceLabel,
    implementationTitle,
    implementationDescription,
    implementationGuidesLabel,
    implementationEyebrow,
    implementationSectionTitle,
    implementationSectionDescription,
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
          eyebrow={contractEyebrow ?? ""}
          title={contractTitle ?? ""}
          description={contractDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{contractCardTitle}</CardTitle>
                <CardDescription>{contractCardDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Pill>{baseUrlLabel}: {DOCUMENTATION_API_BASE_URL}</Pill>
                <Pill variant="secondary">{openApiLabel}: /openapi.json</Pill>
                <Pill variant="secondary">{responseLabel}: {"{ success, data, meta? }"}</Pill>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <StatCard label={routesLabel ?? ""} value={endpoints.toString()} detail={routesDetail ?? ""} />
              <StatCard label={filtersLabel ?? ""} value="q / chain / category" detail={filtersDetail ?? ""} />
            </div>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={behaviorEyebrow ?? ""}
          title={behaviorTitle ?? ""}
          description={behaviorDescription ?? ""}
        >
          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{requestModelTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                <p>{requestModelParagraphOne}</p>
                <p>{requestModelParagraphTwo}</p>
                <div className="flex flex-wrap gap-2">
                  <Pill>{stableIdsLabel}</Pill>
                  <Pill variant="secondary">{exactFiltersLabel}</Pill>
                  <Pill variant="secondary">{aggregateHelpersLabel}</Pill>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{nextStepsTitle}</CardTitle>
                <CardDescription>{nextStepsDescription}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>{exactEndpointsTitle}</CardTitle>
                    <CardDescription>{exactEndpointsDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link href={localizePath("/documentation/api/endpoints", locale)}>
                        {endpointReferenceLabel}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card size="sm">
                  <CardHeader>
                    <CardTitle>{implementationTitle}</CardTitle>
                    <CardDescription>{implementationDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <Link href={localizePath("/documentation/implementation-guides", locale)}>
                        {implementationGuidesLabel}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={implementationEyebrow ?? ""}
          title={implementationSectionTitle ?? ""}
          description={implementationSectionDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {guides.map((guide) => (
              <Card key={guide.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {guide.badge}
                  </Badge>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal space-y-2 ps-5 text-sm leading-7 text-muted-foreground">
                    {guide.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
