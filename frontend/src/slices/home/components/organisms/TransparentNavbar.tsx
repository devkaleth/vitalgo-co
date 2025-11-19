"use client"

import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { LanguageSelectorCompact } from "@/shared/components/molecules/LanguageSelector"

export function TransparentNavbar() {
  const t = useTranslations('home')
  const tNav = useTranslations('nav')
  const locale = useLocale()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-white/80 via-white/40 to-transparent backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center">
            <img
              src="/assets/images/logos/logoh-blue-light-background.png"
              alt="VitalGo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Right side: Pricing + Language Switcher + Login Button */}
          <div className="flex items-center space-x-4">
            <Link
              href={`/${locale}/precios`}
              className="hidden md:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-vitalgo-green transition-colors"
            >
              {tNav('pricing')}
            </Link>

            <LanguageSelectorCompact />

            <Link
              href="/login"
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-gray-700 hover:text-vitalgo-green transition-colors"
            >
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
