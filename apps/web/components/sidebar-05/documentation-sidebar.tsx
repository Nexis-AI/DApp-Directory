"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@workspace/ui/components/sidebar"
import {
  BookOpen,
  Bot,
  Braces,
  ChevronRight,
  Compass,
  ExternalLink,
  type LucideIcon,
} from "lucide-react"

import nexisDarkLogo from "@/assets/logos/nexis-dark.svg"
import nexisLightLogo from "@/assets/logos/nexis-light.svg"
import type { DocumentationNavGroup, DocumentationNavItem } from "@/lib/documentation-nav"
import type { SupportedLocale } from "@/lib/i18n/config"
import { localizePath, stripLocaleFromPathname } from "@/lib/i18n/pathnames"

const groupIcons: Record<DocumentationNavGroup["id"], LucideIcon> = {
  start: Compass,
  api: Braces,
  mcp: Bot,
  guides: BookOpen,
}

function getActiveGroup(pathname: string, navGroups: DocumentationNavGroup[]): DocumentationNavGroup {
  return (
    navGroups.find((group) => group.items.some((item) => pathname === item.href)) ??
    navGroups[0]!
  )
}

function getActiveItem(pathname: string, navGroups: DocumentationNavGroup[]) {
  return navGroups.flatMap((group) => group.items).find((item) => pathname === item.href)
}

function getGroupIcon(id: DocumentationNavGroup["id"]) {
  return groupIcons[id] ?? BookOpen
}

function DocumentationSidebarGroup({
  group,
  locale,
  pathname,
  onOpen,
}: {
  group: DocumentationNavGroup
  locale: SupportedLocale
  pathname: string
  onOpen: (title: string) => void
}) {
  const Icon = getGroupIcon(group.id)
  const isActive = group.items.some((item) => item.href === pathname)
  const defaultHref = group.items[0]?.href ?? "/documentation"

  return (
    <SidebarMenuItem
      onMouseEnter={() => onOpen(group.title)}
      onFocusCapture={() => onOpen(group.title)}
    >
      <SidebarMenuButton asChild isActive={isActive} className="h-10 px-3">
        <Link href={localizePath(defaultHref, locale)}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{group.title}</span>
          </div>
          <ChevronRight className="ms-auto size-4 shrink-0 opacity-70" />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function DocumentationSidebarItem({
  item,
  locale,
  pathname,
}: {
  item: DocumentationNavItem
  locale: SupportedLocale
  pathname: string
}) {
  const isActive = pathname === item.href

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="h-auto items-start gap-3 px-3 py-3"
      >
        <Link href={localizePath(item.href, locale)}>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{item.label}</div>
            {item.description ? (
              <div className="mt-1 text-xs leading-5 text-sidebar-foreground/70">
                {item.description}
              </div>
            ) : null}
          </div>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function DocumentationSidebarFlyout({
  group,
  locale,
  pathname,
  copy,
  onMouseEnter,
  onMouseLeave,
}: {
  group: DocumentationNavGroup
  locale: SupportedLocale
  pathname: string
  copy: DocumentationSidebarCopy
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const Icon = getGroupIcon(group.id)
  const groupSummaries: Record<DocumentationNavGroup["id"], string> = {
    start: copy.groupSummaryStart,
    api: copy.groupSummaryApi,
    mcp: copy.groupSummaryMcp,
    guides: copy.groupSummaryGuides,
  }

  return (
    <div
      className="fixed inset-y-0 z-30 hidden w-80 border-e bg-sidebar text-sidebar-foreground md:flex"
      style={{ left: "var(--sidebar-width)" }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex size-full flex-col">
        <SidebarHeader className="gap-3 px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-sidebar-accent p-2 text-sidebar-accent-foreground">
              <Icon className="size-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold">{group.title}</p>
              <p className="text-xs leading-5 text-sidebar-foreground/70">
                {groupSummaries[group.id]}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup className="px-3 py-3">
            <SidebarGroupLabel>{copy.pagesLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <DocumentationSidebarItem
                    key={item.href}
                    item={item}
                    locale={locale}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </div>
  )
}

export interface DocumentationSidebarCopy {
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

export function DocumentationSidebar({
  locale,
  navGroups,
  copy,
}: {
  locale: SupportedLocale
  navGroups: DocumentationNavGroup[]
  copy: DocumentationSidebarCopy
}) {
  const pathname = usePathname()
  const closeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const [openGroupTitle, setOpenGroupTitle] = React.useState<string | null>(null)
  const normalizedPathname = stripLocaleFromPathname(pathname || "/")

  const cancelClose = React.useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [])

  const scheduleClose = React.useCallback(() => {
    cancelClose()
    closeTimeoutRef.current = setTimeout(() => {
      setOpenGroupTitle(null)
    }, 120)
  }, [cancelClose])

  const openGroup = navGroups.find((group) => group.title === openGroupTitle) ?? null

  React.useEffect(() => {
    return () => {
      cancelClose()
    }
  }, [cancelClose])

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas" className="border-e">
        <SidebarHeader className="gap-3 px-3 py-4">
          <div className="space-y-1">
            <span className="relative flex h-5 items-center">
              <Image
                src={nexisDarkLogo}
                alt=""
                aria-hidden="true"
                className="h-5 w-auto dark:hidden"
                priority
              />
              <Image
                src={nexisLightLogo}
                alt=""
                aria-hidden="true"
                className="hidden h-5 w-auto dark:block"
                priority
              />
            </span>
            <p className="text-sm font-semibold">{copy.headerTitle}</p>
          </div>
          <p className="text-xs leading-5 text-sidebar-foreground/70">{copy.hoverHint}</p>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent onMouseLeave={scheduleClose}>
          <SidebarGroup>
            <SidebarGroupLabel>{copy.sectionsLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navGroups.map((group) => (
                  <DocumentationSidebarGroup
                    key={group.id}
                    group={group}
                    locale={locale}
                    pathname={normalizedPathname}
                    onOpen={(title) => {
                      cancelClose()
                      setOpenGroupTitle(title)
                    }}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="px-3 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="px-3">
                <Link href={localizePath("/", locale)}>
                  <ExternalLink className="size-4 shrink-0" />
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-sm font-medium">{copy.backToDirectoryTitle}</div>
                    <div className="text-xs text-sidebar-foreground/70">
                      {copy.backToDirectoryDescription}
                    </div>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {openGroup ? (
        <DocumentationSidebarFlyout
          group={openGroup}
          locale={locale}
          pathname={normalizedPathname}
          copy={copy}
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        />
      ) : null}
    </>
  )
}

export function getDocumentationShellState(
  pathname: string,
  navGroups: DocumentationNavGroup[],
) {
  const activeGroup = getActiveGroup(pathname, navGroups)
  const activeItem = getActiveItem(pathname, navGroups) ?? activeGroup.items[0]!

  return {
    activeGroup,
    activeItem,
  }
}
