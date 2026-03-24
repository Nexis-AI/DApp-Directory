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

import {
  DocumentationPage as DocumentationPageLayout,
  DocumentationSection,
} from "@/components/documentation-page"
import { Pill, StatCard } from "@/components/page-frame"
import { SeoJsonLd } from "@/components/seo-json-ld"
import {
  DOCUMENTATION_API_BASE_URL,
  DOCUMENTATION_MCP_HTTP_URL,
} from "@/lib/documentation-config"
import {
  getDocumentationNavGroups,
  getLocalizedClientGuides,
  getLocalizedDocumentationReferenceCards,
  getLocalizedDocumentationUseCases,
  getLocalizedMcpResources,
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
import { getOpenApiDocument } from "@/lib/site-data"

const documentationHubFaqs = [
  {
    question: "Where should a new user start?",
    answer:
      "Start with Getting Started if you need to run the API or MCP server locally. Start with Use Cases if you already know the repo but need to decide which surface fits your workflow.",
  },
  {
    question: "Why is the MCP section larger than the others?",
    answer:
      "The MCP docs now include a client hub plus per-client setup tutorials, so that section naturally has more child routes than the API or Guides sections.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.documentation, "/documentation")
}

export default async function DocumentationPage() {
  const locale = await getRequestLocale()
  const [
    document,
    navGroups,
    referenceCards,
    useCases,
    clientGuides,
    mcpResources,
    mcpTools,
    faqs,
    jsonLd,
  ] =
    await Promise.all([
      getOpenApiDocument(),
      getDocumentationNavGroups(locale),
      getLocalizedDocumentationReferenceCards(locale),
      getLocalizedDocumentationUseCases(locale),
      getLocalizedClientGuides(locale),
      getLocalizedMcpResources(locale),
      getLocalizedMcpTools(locale),
      Promise.all(
        documentationHubFaqs.map((item) => translateObjectText(item, locale, ["question", "answer"])),
      ),
      getLocalizedWebPageJsonLd(locale, pageSeo.documentation, "/documentation"),
    ])

  const endpointCount = Object.values(document.paths).filter((path) => path.get).length

  const pageStrings = await translateTextBatch({
    texts: [
      "Documentation hub",
      "Start at the overview, then branch into API, MCP, guides, and examples.",
      "Use the standard docs layout to move from local setup into endpoint reference, client tutorials, implementation guides, and copy-ready examples without jumping between unrelated page formats.",
      "dApp directory docs",
      "API",
      "MCP",
      "Examples",
      "Overview",
      "What this documentation covers",
      "The hub gives you the route map, the fastest recommended path, and quick links into the sections most teams open first.",
      "Open the section that matches your immediate task.",
      "Use the hover sidebar to navigate by section, or jump directly into the routes below if you already know the next step.",
      "Get Started",
        "Open API Reference",
        "Open Client Tutorials",
        "HTTP surface",
        `${endpointCount} GET routes`,
        "MCP surface",
        `${mcpTools.length} tools`,
        `${mcpResources.length} resources with HTTP mode at ${DOCUMENTATION_MCP_HTTP_URL}.`,
        "Client tutorials",
      "Dedicated setup pages for IDEs, assistants, CLIs, and remote MCP clients.",
      "Route map",
      "Core documentation sections",
      "Each section groups related pages. The MCP preview is intentionally trimmed here because the client-specific pages now live beneath the client hub.",
      "documentation",
      "Follow these pages in order when you want a tighter route through the docs instead of jumping directly into reference material.",
      "Open",
      "Recommended path",
      "Fastest route to a correct integration",
      "Teams moving quickly should validate locally first, choose API or MCP second, then copy an implementation guide instead of rebuilding contract knowledge from scratch.",
      "1. Local setup",
      "2. Choose surface",
      "3. Implement",
      "4. Copy examples",
      "Deep links",
      "Jump directly into a high-signal reference page",
      "These are the routes most often used after the overview or during implementation.",
      "Deep link",
      "Open section",
      "Use cases",
      "Common reasons teams adopt the directory data surfaces",
      "These examples help you choose whether the API, the MCP server, or both should be part of your stack.",
    ],
    targetLocale: locale,
  })

  const [
    eyebrow,
    title,
    description,
    tagOne,
    tagTwo,
    tagThree,
    tagFour,
    overviewEyebrow,
    overviewTitle,
    overviewDescription,
    openSectionTitle,
    openSectionDescription,
    getStartedLabel,
    openApiReferenceLabel,
    openClientTutorialsLabel,
    httpSurfaceLabel,
    httpSurfaceValue,
    mcpSurfaceLabel,
    mcpSurfaceValue,
    mcpSurfaceDetail,
    clientTutorialsLabel,
    clientTutorialsDetail,
    routeMapEyebrow,
    routeMapTitle,
    routeMapDescription,
    documentationLabel,
    groupDescription,
    openLabel,
    recommendedPathEyebrow,
    recommendedPathTitle,
    recommendedPathDescription,
    stepOne,
    stepTwo,
    stepThree,
    stepFour,
    deepLinksEyebrow,
    deepLinksTitle,
    deepLinksDescription,
    deepLinkBadge,
    openSectionButton,
    useCasesEyebrow,
    useCasesTitle,
    useCasesDescription,
  ] = pageStrings

  return (
    <>
      <SeoJsonLd data={jsonLd} />

      <DocumentationPageLayout
        eyebrow={eyebrow ?? ""}
        title={title ?? ""}
        description={description ?? ""}
        tags={[tagOne ?? "", tagTwo ?? "", tagThree ?? "", tagFour ?? ""]}
        faqs={faqs}
      >
        <DocumentationSection
          eyebrow={overviewEyebrow ?? ""}
          title={overviewTitle ?? ""}
          description={overviewDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{openSectionTitle}</CardTitle>
                <CardDescription>{openSectionDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={localizePath("/documentation/getting-started", locale)}>
                    {getStartedLabel}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={localizePath("/documentation/api/endpoints", locale)}>
                    {openApiReferenceLabel}
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={localizePath("/documentation/mcp/clients", locale)}>
                    {openClientTutorialsLabel}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <StatCard
                label={httpSurfaceLabel ?? ""}
                value={httpSurfaceValue ?? ""}
                detail={`Primary API base: ${DOCUMENTATION_API_BASE_URL}`}
              />
              <StatCard
                label={mcpSurfaceLabel ?? ""}
                value={mcpSurfaceValue ?? ""}
                detail={mcpSurfaceDetail ?? ""}
              />
              <StatCard
                label={clientTutorialsLabel ?? ""}
                value={clientGuides.length.toString()}
                detail={clientTutorialsDetail ?? ""}
              />
            </div>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={routeMapEyebrow ?? ""}
          title={routeMapTitle ?? ""}
          description={routeMapDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {navGroups.map((group) => {
              const previewItems = group.id === "mcp" ? group.items.slice(0, 4) : group.items

              return (
                <Card key={group.id}>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">
                      {group.title}
                    </Badge>
                    <CardTitle>
                      {group.title} {documentationLabel}
                    </CardTitle>
                    <CardDescription>{groupDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {previewItems.map((item) => (
                      <div
                        key={item.href}
                        className="rounded-lg border px-4 py-3 text-sm leading-7"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{item.label}</span>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={localizePath(item.href, locale)}>{openLabel}</Link>
                          </Button>
                        </div>
                        {item.description ? (
                          <p className="mt-2 text-muted-foreground">{item.description}</p>
                        ) : null}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={recommendedPathEyebrow ?? ""}
          title={recommendedPathTitle ?? ""}
          description={recommendedPathDescription ?? ""}
        >
          <div className="flex flex-wrap gap-2">
            <Pill href={localizePath("/documentation/getting-started", locale)}>{stepOne}</Pill>
            <Pill href={localizePath("/documentation/use-cases", locale)} variant="secondary">
              {stepTwo}
            </Pill>
            <Pill
              href={localizePath("/documentation/implementation-guides", locale)}
              variant="secondary"
            >
              {stepThree}
            </Pill>
            <Pill href={localizePath("/documentation/examples", locale)} variant="secondary">
              {stepFour}
            </Pill>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={deepLinksEyebrow ?? ""}
          title={deepLinksTitle ?? ""}
          description={deepLinksDescription ?? ""}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {referenceCards.map((item) => (
              <Card key={item.href}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {deepLinkBadge}
                  </Badge>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" asChild>
                    <Link href={localizePath(item.href, locale)}>{openSectionButton}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={useCasesEyebrow ?? ""}
          title={useCasesTitle ?? ""}
          description={useCasesDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-3">
            {useCases.map((useCase) => (
              <Card key={useCase.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {useCase.badge}
                  </Badge>
                  <CardTitle>{useCase.title}</CardTitle>
                  <CardDescription>{useCase.summary}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DocumentationSection>
      </DocumentationPageLayout>
    </>
  )
}
