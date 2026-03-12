import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import type { DocumentationFaqItem } from "@/lib/documentation-content"
import { getCommonCopy } from "@/lib/i18n/common-copy"
import { getRequestLocale } from "@/lib/i18n/server"

export function DocumentationPage({
  eyebrow,
  title,
  description,
  tags = [],
  faqs = [],
  children,
}: {
  eyebrow: string
  title: string
  description: string
  tags?: string[]
  faqs?: DocumentationFaqItem[]
  children: React.ReactNode
}) {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Badge variant="outline" className="w-fit">
          {eyebrow}
        </Badge>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="max-w-4xl text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </header>

      {children}

      {faqs.length > 0 ? <DocumentationFaqSection items={faqs} /> : null}
    </div>
  )
}

export function DocumentationSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        {eyebrow ? (
          <Badge variant="outline" className="w-fit">
            {eyebrow}
          </Badge>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="max-w-4xl text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function DocumentationCodeBlock({
  title,
  description,
  code,
}: {
  title: string
  description?: string
  code: string
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-md border bg-muted/30 p-4 text-xs leading-6 text-foreground">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}

export function DocumentationStepList({
  steps,
}: {
  steps: string[]
}) {
  return (
    <ol className="list-decimal space-y-2 ps-5 text-sm leading-7 text-muted-foreground">
      {steps.map((step) => (
        <li key={step}>{step}</li>
      ))}
    </ol>
  )
}

export async function DocumentationFaqSection({
  items,
}: {
  items: DocumentationFaqItem[]
}) {
  const locale = await getRequestLocale()
  const copy = await getCommonCopy(locale)

  return (
    <section className="space-y-4 border-t pt-8">
      <div className="space-y-2">
        <Badge variant="outline" className="w-fit">
          {copy.faqBadge}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">{copy.faqTitle}</h2>
        <p className="max-w-4xl text-sm leading-7 text-muted-foreground">
          {copy.faqDescription}
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <Card key={item.question}>
            <CardHeader>
              <CardTitle>{item.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground">
              {item.answer}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
