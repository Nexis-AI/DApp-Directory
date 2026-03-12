"use client"

import { startTransition } from "react"
import { Globe } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import {
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getLocaleLanguageTag,
} from "@/lib/i18n/config"
import { switchLocaleInPathname } from "@/lib/i18n/pathnames"

const NATIVE_LANGUAGE_LABELS: Record<SupportedLocale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  hi: "हिन्दी",
  pt: "Português",
  nl: "Nederlands",
  de: "Deutsch",
  ar: "العربية",
  ja: "日本語",
  id: "Bahasa Indonesia",
  fr: "Français",
  bn: "বাংলা",
}

const getDisplayLabel = (currentLocale: SupportedLocale, locale: SupportedLocale) => {
  try {
    const displayNames = new Intl.DisplayNames([getLocaleLanguageTag(currentLocale)], {
      type: "language",
    })

    return displayNames.of(locale) ?? NATIVE_LANGUAGE_LABELS[locale]
  } catch {
    return NATIVE_LANGUAGE_LABELS[locale]
  }
}

export function LanguageSwitcher({
  locale,
  label,
}: {
  locale: SupportedLocale
  label: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPathname = pathname || "/"

  const options = SUPPORTED_LOCALES.map((item) => ({
    value: item,
    label: getDisplayLabel(locale, item),
  }))

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="size-9" aria-hidden="true" tabIndex={-1}>
        <Globe className="size-4" />
      </Button>
      <Select
        value={locale}
        onValueChange={(nextLocale) => {
          document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`

          const nextPathname = switchLocaleInPathname(
            currentPathname,
            nextLocale as SupportedLocale,
          )

          const query = searchParams.toString()
          startTransition(() => {
            router.replace(query ? `${nextPathname}?${query}` : nextPathname)
          })
        }}
      >
        <SelectTrigger className="h-9 min-w-40" aria-label={label}>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
