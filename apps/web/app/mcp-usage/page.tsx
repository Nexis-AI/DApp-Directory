import { redirect } from "next/navigation"

import { DEFAULT_LOCALE } from "@/lib/i18n/config"
import { localizePath } from "@/lib/i18n/pathnames"
import { getRequestLocale } from "@/lib/i18n/server"

export default async function MpcUsagePage() {
  const locale = await getRequestLocale()
  if (locale === DEFAULT_LOCALE) {
    redirect("/documentation/mcp")
  }
  redirect(localizePath("/documentation/mcp", locale))
}
