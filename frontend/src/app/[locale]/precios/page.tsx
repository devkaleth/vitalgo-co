/**
 * Pricing Route - /precios
 * Next.js App Router page for pricing and plans
 */
'use client';

import { PricingPage } from '@/slices/pricing/pages/PricingPage';
import { HomeLayout } from '@/slices/home/components/templates/HomeLayout';

export default function Pricing() {
  return (
    <HomeLayout>
      <PricingPage />
    </HomeLayout>
  );
}
