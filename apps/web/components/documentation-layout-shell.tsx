"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@workspace/ui/components/sidebar"

import {
  DocumentationSidebar,
  getDocumentationShellState,
} from "@/components/sidebar-05/documentation-sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import type { DocumentationNavGroup } from "@/lib/documentation-nav"
import type { SupportedLocale } from "@/lib/i18n/config"
import { localizePath, stripLocaleFromPathname } from "@/lib/i18n/pathnames"

export function DocumentationLayoutShell({
  locale,
  navGroups,
  copy,
  children,
}: {
  locale: SupportedLocale
  navGroups: DocumentationNavGroup[]
  copy: {
    currentPageFallback: string
    language: string
    directory: string
  } & {
    headerTitle: string
    hoverHint: string
    sectionsLabel: string
    pagesLabel: string
    backToDirectoryTitle: string
    backToDirectoryDescription: string
    groupSummaryStart: string
    groupSummaryApi: string
    groupSummaryMcp: string
    groupSummaryGuides: string
  }
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const normalizedPathname = stripLocaleFromPathname(pathname || "/")
  const { activeGroup, activeItem } = getDocumentationShellState(normalizedPathname, navGroups)

  return (
    <SidebarProvider defaultOpen>
      <DocumentationSidebar
        locale={locale}
        navGroups={navGroups}
        copy={copy}
      />

      <SidebarInset className="min-h-svh">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <SidebarTrigger className="md:hidden" />

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
              {activeGroup.title}
            </p>
            <p className="truncate text-sm font-semibold">
              {activeItem?.label ?? copy.currentPageFallback}
            </p>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link href={localizePath("/", locale)}>{copy.directory}</Link>
          </Button>
          <LanguageSwitcher locale={locale} label={copy.language} />
          <ThemeSwitcher />
        </header>

        <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
