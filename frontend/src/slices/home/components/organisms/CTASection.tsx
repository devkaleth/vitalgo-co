"use client"

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '../atoms/Button'

export function CTASection() {
  const t = useTranslations('home')

  return (
    <section
      className="py-16 lg:py-24 bg-gradient-to-r from-vitalgo-green to-vitalgo-green/90"
      data-testid="home-cta-section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2
            className="text-3xl lg:text-4xl font-light text-white mb-6"
            data-testid="home-cta-title"
          >
            {t('cta.title')}
          </h2>
          <p
            className="text-xl text-white/90 mb-8"
            data-testid="home-cta-description"
          >
            {t('cta.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup/paciente">
              <Button
                size="lg"
                className="bg-white text-vitalgo-green hover:bg-gray-100 px-8 py-4 text-lg"
                data-testid="home-cta-patient-button"
              >
                {t('cta.patientButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/precios">
              <Button
                size="lg"
                className="bg-white/20 text-white border-2 border-white hover:bg-white hover:text-vitalgo-green transition-colors px-8 py-4 text-lg"
                data-testid="home-cta-pricing-button"
              >
                {t('cta.pricingButton')}
              </Button>
            </Link>
          </div>

          <p
            className="text-sm text-white/80 mt-6"
            data-testid="home-cta-note"
          >
            {t('cta.note')}
          </p>
        </div>
      </div>
    </section>
  )
}
