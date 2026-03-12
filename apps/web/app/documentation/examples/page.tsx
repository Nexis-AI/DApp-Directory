import type { Metadata } from "next"

import { Badge } from "@workspace/ui/components/badge"
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
import { SeoJsonLd } from "@/components/seo-json-ld"
import { getLocalizedUsageExamples } from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateObjectText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"

const quickRequests = [
  {
    badge: "curl",
    title: "List DeFi dApps on Base",
    description: "Useful for smoke testing the catalog quickly from the terminal.",
    code: `curl "http://localhost:8787/v1/dapps?chain=Base&category=DeFi&limit=5"`,
  },
  {
    badge: "curl",
    title: "List chains",
    description: "Good for selector bootstrapping or data validation.",
    code: `curl "http://localhost:8787/v1/chains"`,
  },
  {
    badge: "MCP",
    title: "Search through MCP",
    description: "Use when an agent runtime should call the tool instead of the HTTP API directly.",
    code: `{
  "name": "dapps_search",
  "arguments": {
    "q": "lending",
    "chain": "Base",
    "limit": 5
  }
}`,
  },
] as const

const exampleFaqs = [
  {
    question: "Should I copy these snippets exactly?",
    answer:
      "Use them as a starting point. Most teams will still wrap the fetch logic, add retries, and adapt the environment-specific base URL handling.",
  },
  {
    question: "Why are there both API and MCP examples?",
    answer:
      "Because some runtimes should call plain JSON endpoints while others should use MCP tools and resources directly.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.examples, "/documentation/examples")
}

export default async function DocumentationExamplesPage() {
  const locale = await getRequestLocale()

  const [usageExamples, faqs, localizedQuickRequests, jsonLd, pageStrings] = await Promise.all([
    getLocalizedUsageExamples(locale),
    Promise.all(exampleFaqs.map((item) => translateObjectText(item, locale, ["question", "answer"]))),
    Promise.all(
      quickRequests.map((request) =>
        translateObjectText(request, locale, ["badge", "title", "description"]),
      ),
    ),
    getLocalizedWebPageJsonLd(locale, pageSeo.examples, "/documentation/examples"),
    translateTextBatch({
      texts: [
        "Examples",
        "Copy-ready snippets for the API, app integrations, and agent runtimes.",
        "Start with the smallest snippet that proves your wiring is correct. Once the shape is stable, fold the logic into your own helpers, clients, or runtime abstractions.",
        "Snippets",
        "API examples",
        "MCP examples",
        "Snippets",
        "Examples you can adapt directly",
        "These examples cover server-side API usage, typed wrappers, browser or Node fetches, and agent-tool wrappers.",
        "Quick requests",
        "Minimal request shapes for debugging and demos",
        "Use these when you want a compact, deterministic request during validation, a demo, or a smoke test.",
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
    sectionOneEyebrow,
    sectionOneTitle,
    sectionOneDescription,
    sectionTwoEyebrow,
    sectionTwoTitle,
    sectionTwoDescription,
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
          eyebrow={sectionOneEyebrow ?? ""}
          title={sectionOneTitle ?? ""}
          description={sectionOneDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {usageExamples.map((example) => (
              <Card key={example.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {example.badge}
                  </Badge>
                  <CardTitle className="text-2xl">{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
                    <code>{example.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={sectionTwoEyebrow ?? ""}
          title={sectionTwoTitle ?? ""}
          description={sectionTwoDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-3">
            {localizedQuickRequests.map((request) => (
              <Card key={request.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {request.badge}
                  </Badge>
                  <CardTitle>{request.title}</CardTitle>
                  <CardDescription>{request.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
                    <code>{request.code}</code>
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
