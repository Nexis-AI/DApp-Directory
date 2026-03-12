import { DocumentationLayoutShell } from "@/components/documentation-layout-shell"
import { getDocumentationNavGroups, getDocumentationShellCopy } from "@/lib/documentation-i18n"
import { getCommonCopy } from "@/lib/i18n/common-copy"
import { getRequestLocale } from "@/lib/i18n/server"

export default async function DocumentationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getRequestLocale()
  const [navGroups, shellCopy, commonCopy] = await Promise.all([
    getDocumentationNavGroups(locale),
    getDocumentationShellCopy(locale),
    getCommonCopy(locale),
  ])

  return (
    <DocumentationLayoutShell
      locale={locale}
      navGroups={navGroups}
      copy={{
        ...shellCopy,
        currentPageFallback: shellCopy.currentPageFallback,
        language: commonCopy.language,
        directory: commonCopy.directory,
      }}
    >
      {children}
    </DocumentationLayoutShell>
  )
}
