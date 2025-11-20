"use client"

import { ArrowRight, Globe, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { StatCard } from '../molecules/StatCard'

export function HeroSection() {
  const t = useTranslations('home')

  const stats = [
    { number: "10K+", label: t('hero.stats.patients'), icon: <ArrowRight className="h-5 w-5 text-vitalgo-green" /> },
    { number: "500+", label: t('hero.stats.healthCenters'), icon: <Stethoscope className="h-5 w-5 text-vitalgo-green" /> },
    { number: "70%", label: t('hero.stats.timeSaved'), icon: <Globe className="h-5 w-5 text-vitalgo-green" /> },
    { number: "24/7", label: t('hero.stats.availability'), icon: <ArrowRight className="h-5 w-5 text-vitalgo-green" /> }
  ]
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-white via-vitalgo-green/5 to-white py-16 lg:py-24"
      data-testid="home-hero-section"
    >
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-vitalgo-green/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo principal */}
          <div className="flex justify-center mb-8">
            <img
              src="/assets/images/logos/logoh-blue-light-background.png"
              alt="VitalGo Logo"
              className="h-16 w-auto"
              data-testid="home-hero-logo"
            />
          </div>

          <Badge
            className="mb-6 bg-vitalgo-green/10 text-vitalgo-green hover:bg-vitalgo-green/20"
            data-testid="home-hero-badge"
          >
            <Globe className="w-3 h-3 mr-1" />
            {t('hero.badge')}
          </Badge>

          <h2
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-tight text-gray-900 mb-6"
            data-testid="home-hero-title"
          >
            {t('hero.title')}
            <br />
            <span className="text-vitalgo-green font-normal">{t('hero.titleHighlight')}</span>
          </h2>

          <p
            className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8"
            data-testid="home-hero-description"
          >
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-vitalgo-green hover:bg-vitalgo-green/90 hover:scale-105 text-white hover:text-gray-100 px-8 py-3 text-base transition-all duration-200"
                data-testid="home-hero-login-button"
              >
                {t('hero.loginButton')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/precios">
              <Button
                variant="outline"
                size="lg"
                className="bg-white border-gray-300 text-gray-600 hover:bg-white hover:border-vitalgo-green hover:text-vitalgo-green hover:scale-105 px-8 py-3 text-base transition-all duration-200"
                data-testid="home-hero-patient-button"
              >
                {t('hero.patientButton')}
              </Button>
            </Link>
            {/* Temporarily hidden - Health Professional button */}
            {/* <Link href="/signup/paramedico">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                data-testid="home-hero-professional-button"
              >
                {t('hero.professionalButton')}
                <Stethoscope className="ml-2 h-5 w-5" />
              </Button>
            </Link> */}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}