import Link from "next/link"
import { notFound } from "next/navigation"

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
  DocumentationCodeBlock,
  DocumentationPage,
  DocumentationSection,
  DocumentationStepList,
} from "@/components/documentation-page"
import { SeoJsonLd } from "@/components/seo-json-ld"
import { CLIENT_GUIDES } from "@/lib/documentation-content"
import { getLocalizedClientGuideBySlug } from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateTextBatch } from "@/lib/i18n/translate"
import { localizePath } from "@/lib/i18n/pathnames"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
} from "@/lib/seo"

export function generateStaticParams() {
  return CLIENT_GUIDES.map((guide) => ({
    client: guide.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ client: string }>
}): Promise<Metadata> {
  const locale = await getRequestLocale()
  const { client } = await params
  const guide = await getLocalizedClientGuideBySlug(locale, client)

  if (!guide) {
    return {}
  }

  return getLocalizedPageMetadata(
    locale,
    {
      title: `${guide.name} MCP Setup for the Web3 dApp Directory`,
      description: guide.summary,
      keywords: [
        `${guide.name} MCP setup`,
        `${guide.name} dApp directory`,
        "AI agent MCP client setup",
        "Web3 MCP tutorial",
      ],
    },
    `/documentation/mcp/clients/${guide.slug}`,
  )
}

export default async function DocumentationMcpClientGuidePage({
  params,
}: {
  params: Promise<{ client: string }>
}) {
  const locale = await getRequestLocale()
  const { client } = await params
  const guide = await getLocalizedClientGuideBySlug(locale, client)

  if (!guide) {
    notFound()
  }

  const [jsonLd, pageStrings] = await Promise.all([
    getLocalizedWebPageJsonLd(
      locale,
      {
        title: `${guide.name} MCP Setup for the Web3 dApp Directory`,
        description: guide.summary,
        keywords: guide.tags,
      },
      `/documentation/mcp/clients/${guide.slug}`,
    ),
    translateTextBatch({
      texts: [
        `${guide.name} setup`,
        `Configure the dApp directory MCP server in ${guide.name}.`,
        "Prerequisites",
        "What to have in place before you start",
        "Prepare the local runtime and the client configuration surface before you add the server entry.",
        "Tutorial",
        "Step-by-step setup",
        "Use the exact order below to keep validation simple and avoid transport confusion.",
        "Steps",
        "Configuration flow",
        "Notes",
        "Important implementation detail",
        "Configuration",
        "Copy the configuration or command",
        "Start from this exact snippet, then adjust the repo path or remote URL for your environment.",
        "Verification",
        "How to confirm the integration is working",
        "Validate the tool registration before relying on the client for production discovery or research work.",
        "Examples",
        "Client-specific examples",
        "Use these snippets and commands to bootstrap a known-good configuration or runtime command.",
        "Next",
        "Continue through the rest of the MCP documentation",
        "Once the client can see the server and execute a deterministic read-only request, move back into the broader MCP or example pages.",
        "Back to client index",
        "Open MCP overview",
        "Open examples",
      ],
      targetLocale: locale,
    }),
  ])

  const [
    eyebrow,
    title,
    prerequisitesEyebrow,
    prerequisitesTitle,
    prerequisitesDescription,
    tutorialEyebrow,
    tutorialTitle,
    tutorialDescription,
    stepsBadge,
    configurationFlowTitle,
    notesBadge,
    notesTitle,
    configurationEyebrow,
    configurationTitle,
    configurationDescription,
    verificationEyebrow,
    verificationTitle,
    verificationDescription,
    examplesEyebrow,
    examplesTitle,
    examplesDescription,
    nextEyebrow,
    nextTitle,
    nextDescription,
    backToClientIndex,
    openMcpOverview,
    openExamples,
  ] = pageStrings

  return (
    <>
      <SeoJsonLd data={jsonLd} />

      <DocumentationPage
        eyebrow={eyebrow ?? ""}
        title={title ?? ""}
        description={guide.summary}
        tags={[guide.badge, guide.transport, ...guide.tags]}
        faqs={guide.faqs}
      >
        <DocumentationSection
          eyebrow={prerequisitesEyebrow ?? ""}
          title={prerequisitesTitle ?? ""}
          description={prerequisitesDescription ?? ""}
        >
          <Card>
            <CardContent className="pt-4">
              <DocumentationStepList steps={guide.prerequisites} />
            </CardContent>
          </Card>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={tutorialEyebrow ?? ""}
          title={tutorialTitle ?? ""}
          description={tutorialDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <Card>
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {stepsBadge}
                </Badge>
                <CardTitle>{configurationFlowTitle}</CardTitle>
                <CardDescription>{guide.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentationStepList steps={guide.steps} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {notesBadge}
                </Badge>
                <CardTitle>{notesTitle}</CardTitle>
                <CardDescription>{guide.transport}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                {guide.note}
              </CardContent>
            </Card>
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={configurationEyebrow ?? ""}
          title={configurationTitle ?? ""}
          description={configurationDescription ?? ""}
        >
          <DocumentationCodeBlock
            title={`${guide.name} configuration`}
            description={guide.location}
            code={guide.code}
          />
        </DocumentationSection>

        <DocumentationSection
          eyebrow={verificationEyebrow ?? ""}
          title={verificationTitle ?? ""}
          description={verificationDescription ?? ""}
        >
          <Card>
            <CardContent className="pt-4">
              <DocumentationStepList steps={guide.verification} />
            </CardContent>
          </Card>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={examplesEyebrow ?? ""}
          title={examplesTitle ?? ""}
          description={examplesDescription ?? ""}
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {guide.examples.map((example) => (
              <DocumentationCodeBlock
                key={`${guide.slug}-${example.title}`}
                title={example.title}
                description={example.description}
                code={example.code}
              />
            ))}
          </div>
        </DocumentationSection>

        <DocumentationSection
          eyebrow={nextEyebrow ?? ""}
          title={nextTitle ?? ""}
          description={nextDescription ?? ""}
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href={localizePath("/documentation/mcp/clients", locale)}>
                {backToClientIndex}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={localizePath("/documentation/mcp", locale)}>{openMcpOverview}</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={localizePath("/documentation/examples", locale)}>{openExamples}</Link>
            </Button>
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
