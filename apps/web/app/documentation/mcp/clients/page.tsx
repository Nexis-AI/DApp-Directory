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
  DocumentationPage,
  DocumentationSection,
} from "@/components/documentation-page"
import { SeoJsonLd } from "@/components/seo-json-ld"
import {
  getLocalizedClientGuideIndexFaqs,
  getLocalizedClientGuides,
} from "@/lib/documentation-i18n"
import { getRequestLocale } from "@/lib/i18n/server"
import { translateTextBatch } from "@/lib/i18n/translate"
import {
  getLocalizedPageMetadata,
  getLocalizedWebPageJsonLd,
  pageSeo,
} from "@/lib/seo"
import { localizePath } from "@/lib/i18n/pathnames"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedPageMetadata(locale, pageSeo.mcpClients, "/documentation/mcp/clients")
}

export default async function DocumentationMcpClientsPage() {
  const locale = await getRequestLocale()
  const [guides, faqs, jsonLd, pageStrings] = await Promise.all([
    getLocalizedClientGuides(locale),
    getLocalizedClientGuideIndexFaqs(locale),
    getLocalizedWebPageJsonLd(locale, pageSeo.mcpClients, "/documentation/mcp/clients"),
    translateTextBatch({
      texts: [
        "Client setup",
        "Choose a client tutorial, then follow a client-specific MCP setup path.",
        "Each supported client now has its own documentation page with prerequisites, configuration steps, verification, examples, and FAQs. Start here when you know the tool your team uses but want the setup details separated cleanly.",
        "MCP",
        "Client tutorials",
        "IDE and assistant setup",
        "Client index",
        "Individual tutorials for each supported client",
        "Open the page that matches the tool you are configuring. Each page stays focused on one transport model, one config location, and one verification flow.",
        "Config location",
        "Open tutorial",
        "Transport guide",
        "How to decide between stdio and HTTP",
        "Most client pages recommend stdio first because it is easier to validate locally. Use HTTP only when the client cannot spawn a local process or when the server needs to be shared remotely.",
        "Local-first",
        "Use stdio for development and private workstation tooling",
        "Best for IDEs, desktop apps, and CLIs that can launch a command on your machine.",
        "Remote",
        "Use HTTP for cloud clients and shared endpoints",
        "Best for ChatGPT-like surfaces and any deployment where localhost is not reachable from the client.",
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
    configLocationLabel,
    openTutorialLabel,
    sectionTwoEyebrow,
    sectionTwoTitle,
    sectionTwoDescription,
    localFirstBadge,
    localFirstTitle,
    localFirstDescription,
    remoteBadge,
    remoteTitle,
    remoteDescription,
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
              <Card key={guide.slug}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="w-fit">
                      {guide.badge}
                    </Badge>
                    <Badge variant="secondary">{guide.transport}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{guide.name}</CardTitle>
                  <CardDescription>{guide.summary}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {guide.tags.map((tag) => (
                      <Badge key={`${guide.slug}-${tag}`} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {configLocationLabel}:{" "}
                    <span className="font-mono text-foreground">{guide.location}</span>
                  </p>

                  <Button variant="outline" asChild>
                    <Link href={localizePath(`/documentation/mcp/clients/${guide.slug}`, locale)}>
                      {openTutorialLabel}
                    </Link>
                  </Button>
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
            <Card>
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {localFirstBadge}
                </Badge>
                <CardTitle>{localFirstTitle}</CardTitle>
                <CardDescription>{localFirstDescription}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {remoteBadge}
                </Badge>
                <CardTitle>{remoteTitle}</CardTitle>
                <CardDescription>{remoteDescription}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </DocumentationSection>
      </DocumentationPage>
    </>
  )
}
