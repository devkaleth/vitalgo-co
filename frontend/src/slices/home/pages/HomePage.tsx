"use client"

import { HomeLayout } from '../components/templates/HomeLayout'
import { HeroSection } from '../components/organisms/HeroSection'
import { FeaturesSection } from '../components/organisms/FeaturesSection'
import { TestimonialsSection } from '../components/organisms/TestimonialsSection'
import { PricingSection } from '../components/organisms/PricingSection'
import { CTASection } from '../components/organisms/CTASection'

export default function HomePage() {
  return (
    <HomeLayout>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
    </HomeLayout>
  )
}