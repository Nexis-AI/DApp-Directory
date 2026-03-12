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
  DocumentationCodeBlock,
  DocumentationPage,
  DocumentationSection,
  DocumentationStepList,
} from "@/components/documentation-page"
import { SeoJsonLd } from "@/components/seo-json-ld"
import {
  getLocalizedImplementationGuideCards,
  getLocalizedUsageExamples,
} from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateObjectText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"

const implementationGuideFaqs = [
  {
    question: "Should I start from the implementation guides or the endpoint docs?",
    answer:
      "Use the implementation guides when you already know the runtime you are targeting. Use the endpoint docs first if you still need the exact API contract.",
  },
  {
    question: "Are these guides production-ready?",
    answer:
      "They are practical starting points. You should still adapt caching, retries, monitoring, and environment-specific configuration to your own deployment model.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(
    locale,
    pageSeo.implementationGuides,
    "/documentation/implementation-guides",
  )
}

export default async function DocumentationImplementationGuidesPage() {
  const locale = await getRequestLocale()

  const [guides, examples, faqs, jsonLd, pageStrings] = await Promise.all([
    getLocalizedImplementationGuideCards(locale),
    getLocalizedUsageExamples(locale),
    Promise.all(
      implementationGuideFaqs.map((item) =>
        translateObjectText(item, locale, ["question", "answer"]),
      ),
    ),
    getLocalizedWebPageJsonLd(
      locale,
      pageSeo.implementationGuides,
      "/documentation/implementation-guides",
    ),
    translateTextBatch({
      texts: [
        "Implementation guides",
        "Follow task-oriented instructions instead of reverse engineering the contract.",
        "These guides are deliberately practical. Use them when you already know your target runtime and want a direct path from local validation to working code in a production app, service, or agent workflow.",
        "Guides",
        "Examples",
        "Production-oriented",
        "Guides",
        "Task-oriented setup paths",
        "Each guide is organized around a common runtime rather than around raw endpoint inventory.",
        "Examples",
        "Companion examples that pair well with the guides",
        "Use these snippets as the smallest working unit before integrating the directory into a larger app or automation surface.",
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
            {guides.map((guide) => (
              <Card key={guide.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {guide.badge}
                  </Badge>
                  <CardTitle>{guide.title}</CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DocumentationStepList steps={guide.steps} />
                  <DocumentationCodeBlock title={`${guide.badge} example`} code={guide.code} />
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
          <div className="grid gap-5 xl:grid-cols-2">
            {examples.map((example) => (
              <Card key={example.title}>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {example.badge}
                  </Badge>
                  <CardTitle>{example.title}</CardTitle>
                  <CardDescription>{example.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
