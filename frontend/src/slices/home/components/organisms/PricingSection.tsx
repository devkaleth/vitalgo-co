"use client"

import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Badge } from '../atoms/Badge'

export function PricingSection() {
  const t = useTranslations('home')

  const plans = [
    {
      name: 'Gratis',
      price: '$0',
      period: 'por siempre',
      description: 'Para pacientes que necesitan gestionar su información médica básica',
      features: [
        'Perfil médico completo',
        'Gestión de medicamentos',
        'Registro de alergias',
        'Historial de cirugías',
        'Código QR de emergencia',
        'Acceso desde cualquier dispositivo'
      ],
      highlighted: true
    }
  ]

  return (
    <section
      className="py-16 lg:py-24 bg-white"
      data-testid="home-pricing-section"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge
            className="mb-4 bg-vitalgo-green/10 text-vitalgo-green"
            data-testid="home-pricing-badge"
          >
            {t('pricing.badge') || 'Precios'}
          </Badge>
          <h2
            className="text-3xl lg:text-4xl font-light text-gray-900 mb-4"
            data-testid="home-pricing-title"
          >
            {t('pricing.title') || 'Un solo plan, todas las funciones'}
          </h2>
          <p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            data-testid="home-pricing-description"
          >
            {t('pricing.description') || 'Acceso completo a todas las funcionalidades sin costos ocultos'}
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl border-2 ${
                plan.highlighted
                  ? 'border-vitalgo-green'
                  : 'border-gray-200'
              } p-8 lg:p-10`}
              data-testid={`pricing-plan-${index}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center">
                  <Badge className="bg-vitalgo-green text-white px-6 py-1 text-sm font-medium">
                    Recomendado
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-5xl font-bold text-vitalgo-green">
                    {plan.price}
                  </span>
                  <span className="text-xl text-gray-600 ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="mb-8">
                <a
                  href="/es/signup/paciente"
                  className="block w-full text-center px-6 py-3 bg-vitalgo-green text-white font-medium rounded-lg hover:bg-vitalgo-green-light transition-colors duration-150"
                >
                  Comenzar gratis
                </a>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-semibold text-gray-900 mb-4">
                  Incluye:
                </div>
                {plan.features.map((feature, featureIndex) => (
                  <div
                    key={featureIndex}
                    className="flex items-start"
                  >
                    <Check className="h-5 w-5 text-vitalgo-green mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            ¿Necesitas funcionalidades empresariales?{' '}
            <a
              href="/contact"
              className="text-vitalgo-green hover:text-vitalgo-green-light font-medium"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
