import type { Metadata } from "next"
import {
  Geist_Mono,
  Inter,
  Noto_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_JP,
  Noto_Sans_SC,
} from "next/font/google"

import "@workspace/ui/globals.css"
import { SeoJsonLd } from "@/components/seo-json-ld"
import { ThemeProvider } from "@/components/theme-provider"
import { getLocaleDirection } from "@/lib/i18n/config"
import { getRequestLocale } from "@/lib/i18n/server"
import {
  getLocalizedDatasetJsonLd,
  getLocalizedSiteMetadata,
  getLocalizedWebSiteJsonLd,
} from "@/lib/seo"
import { getDirectoryMeta } from "@/lib/site-data"
import { cn } from "@workspace/ui/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-locale-arabic",
})

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-locale-bengali",
})

const notoHindi = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-locale-devanagari",
})

const notoJapanese = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-locale-japanese",
})

const notoChinese = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-locale-chinese",
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return getLocalizedSiteMetadata(locale)
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getRequestLocale()
  const directoryMeta = await getDirectoryMeta()
  const direction = getLocaleDirection(locale)

  const localeFontClass =
    locale === "ar"
      ? notoArabic.variable
      : locale === "bn"
        ? notoBengali.variable
        : locale === "hi"
          ? notoHindi.variable
          : locale === "ja"
            ? notoJapanese.variable
            : locale === "zh"
              ? notoChinese.variable
              : inter.variable

  const [websiteJsonLd, datasetJsonLd] = await Promise.all([
    getLocalizedWebSiteJsonLd(locale),
    getLocalizedDatasetJsonLd(locale, directoryMeta),
  ])

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", localeFontClass)}
    >
      <body>
        <SeoJsonLd data={websiteJsonLd} />
        <SeoJsonLd data={datasetJsonLd} />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
