"use client"

import Image from "next/image"
import Link from "next/link"

import { Button } from "@workspace/ui/components/button"

import nexisDarkLogo from "@/assets/logos/nexis-dark.svg"
import nexisLightLogo from "@/assets/logos/nexis-light.svg"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import type { CommonCopy } from "@/lib/i18n/common-copy"
import { type SupportedLocale } from "@/lib/i18n/config"
import { localizePath } from "@/lib/i18n/pathnames"

export function SiteHeader({
  activePath,
  locale,
  copy,
}: {
  activePath: "/" | "/documentation"
  locale: SupportedLocale
  copy: CommonCopy
}) {
  const navItems = [
    { href: "/", label: "Directory", translatedLabel: copy.directory },
    {
      href: "/documentation",
      label: "Documentation",
      translatedLabel: copy.documentation,
    },
  ]

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <Link
          href={localizePath("/", locale)}
          className="inline-flex items-center gap-3 text-sm font-medium tracking-[0.24em] text-primary uppercase"
        >
          <span className="relative flex size-8 shrink-0 items-center justify-center">
            <Image
              src={nexisDarkLogo}
              alt=""
              aria-hidden="true"
              className="size-8 dark:hidden"
              priority
            />
            <Image
              src={nexisLightLogo}
              alt=""
              aria-hidden="true"
              className="hidden size-8 dark:block"
              priority
            />
          </span>
          <span>{copy.nexisDirectory}</span>
        </Link>
        <p className="text-xs/relaxed text-muted-foreground">
          {copy.headerTagline}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={item.href === activePath ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={localizePath(item.href, locale)}>{item.translatedLabel}</Link>
            </Button>
          ))}
        </nav>
        <LanguageSwitcher locale={locale} label={copy.language} />
        <ThemeSwitcher />
      </div>
    </div>
  )
}
