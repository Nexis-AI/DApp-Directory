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
  DocumentationStepList,
} from "@/components/documentation-page"
import { SeoJsonLd } from "@/components/seo-json-ld"
import { getLocalizedDocumentationUseCases } from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateObjectText, translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"

const useCaseFaqs = [
  {
    question: "Can one product use both surfaces?",
    answer:
      "Yes. Many teams use the HTTP API for product and data pipelines while exposing the MCP server to assistants, analysts, or internal agent workflows.",
  },
  {
    question: "Which surface is better for search indexing?",
    answer:
      "The HTTP API is usually better for indexing because it gives you deterministic pagination and plain JSON request handling.",
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.useCases, "/documentation/use-cases")
}

function UseCaseCard({
  useCase,
}: {
  useCase: Awaited<ReturnType<typeof getLocalizedDocumentationUseCases>>[number]
}) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="outline" className="w-fit">
          {useCase.badge}
        </Badge>
        <CardTitle>{useCase.title}</CardTitle>
        <CardDescription>{useCase.summary}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-muted-foreground">{useCase.recommendation}</p>
        <DocumentationStepList steps={useCase.implementation} />
      </CardContent>
    </Card>
  )
}

export default async function DocumentationUseCasesPage() {
  const locale = await getRequestLocale()
  const [useCases, faqs, jsonLd, pageStrings] = await Promise.all([
    getLocalizedDocumentationUseCases(locale),
    Promise.all(useCaseFaqs.map((item) => translateObjectText(item, locale, ["question", "answer"]))),
    getLocalizedWebPageJsonLd(locale, pageSeo.useCases, "/documentation/use-cases"),
    translateTextBatch({
      texts: [
        "Use cases",
        "Decide whether the API, the MCP server, or both should power your workflow.",
        "The HTTP API is best for deterministic app integrations and scheduled jobs. The MCP server is best when an AI runtime should choose when to search or fetch.",
        "API vs MCP",
        "Workflow design",
        "Integration choice",
        "Decision support",
        "Common workflow patterns",
        "Use these examples to align the surface with the runtime instead of forcing one interface to do everything.",
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
    sectionEyebrow,
    sectionTitle,
    sectionDescription,
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
          eyebrow={sectionEyebrow ?? ""}
          title={sectionTitle ?? ""}
          description={sectionDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {useCases.map((useCase) => (
              <UseCaseCard key={useCase.title} useCase={useCase} />
            ))}
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
