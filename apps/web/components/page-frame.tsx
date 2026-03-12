import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { SiteHeader } from "@/components/site-header"
import type { CommonCopy } from "@/lib/i18n/common-copy"
import { type SupportedLocale } from "@/lib/i18n/config"
import { localizePath } from "@/lib/i18n/pathnames"

export function PageFrame({
  activePath,
  locale,
  copy,
  eyebrow,
  title,
  description,
  aside,
  children,
}: {
  activePath: "/" | "/documentation"
  locale: SupportedLocale
  copy: CommonCopy
  eyebrow: string
  title: string
  description: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-6 py-6 sm:px-8 lg:px-10">
        <Card className="border-none shadow-none ring-0">
          <CardContent className="flex flex-col gap-5 p-0 sm:gap-6">
            <SiteHeader activePath={activePath} locale={locale} copy={copy} />

            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
              <Card>
                <CardHeader>
                  <Badge variant="outline" className="w-fit">
                    {eyebrow}
                  </Badge>
                  <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    {title}
                  </CardTitle>
                  <CardDescription className="max-w-3xl text-sm leading-7">
                    {description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={localizePath("/", locale)}>{copy.browseDirectory}</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={localizePath("/documentation", locale)}>
                      {copy.readDocumentation}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={localizePath("/documentation/api/endpoints", locale)}>
                      {copy.inspectHttpApi}
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={localizePath("/documentation/mcp", locale)}>
                      {copy.inspectMcpServer}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {aside ? <div className="flex flex-col gap-4">{aside}</div> : null}
            </div>
          </CardContent>
        </Card>

        {children}
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <Badge variant="outline" className="w-fit">
          {label}
        </Badge>
        <CardTitle className="text-2xl">{value}</CardTitle>
        <CardDescription>{detail}</CardDescription>
      </CardHeader>
    </Card>
  )
}

export function Pill({
  children,
  href,
  variant = "outline",
}: {
  children: React.ReactNode
  href?: string
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
}) {
  const badge = (
    <Badge
      variant={variant}
      className={cn("h-auto min-h-5 px-2 py-1 text-[0.625rem]", href ? "cursor-pointer" : "")}
    >
      {children}
    </Badge>
  )

  if (!href) {
    return badge
  }

  return (
    <Link href={href}>
      {badge}
    </Link>
  )
}
