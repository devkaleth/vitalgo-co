/**
 * QR Page Component
 * Main page for authenticated patients to view and download their QR code
 */
'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Smartphone, Building2, AlertCircle, Zap, CheckCircle, Globe, Printer, Save, RefreshCw, Shield } from 'lucide-react';
import { QRCard } from '../molecules/QRCard';
import { useQRGeneration } from '../../hooks/useQRGeneration';
import { PatientNavbar } from '@/shared/components/organisms/PatientNavbar';
import { MinimalFooter } from '@/shared/components/organisms/MinimalFooter';

interface QRPageProps {
  'data-testid'?: string;
}

export function QRPage({ 'data-testid': testId }: QRPageProps) {
  const t = useTranslations('qr');
  const { qrData, isLoading, error, generateQR, downloadQR, clearError } = useQRGeneration();

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  const handleRetry = () => {
    clearError();
    generateQR();
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col" data-testid={testId}>
        <PatientNavbar />
        <main className="flex-1 bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('error.title')}</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={handleRetry}
                  className="bg-vitalgo-green text-white px-6 py-3 rounded-md hover:bg-vitalgo-green/90 transition-colors"
                >
                  {t('error.retry')}
                </button>
              </div>
            </div>
          </div>
        </main>
        <MinimalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid={testId}>
      <PatientNavbar />
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {t('whatIs.title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('whatIs.description')}
            </p>
          </div>

          {/* QR Card */}
          <QRCard
            qrData={qrData || undefined}
            isLoading={isLoading}
            onDownload={downloadQR}
            data-testid="qr-card"
          />

          {/* How It Works Section */}
          <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('howItWorks.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-vitalgo-green/10 p-4 rounded-full">
                    <Smartphone className="w-10 h-10 text-vitalgo-green" />
                  </div>
                </div>
                <div className="bg-vitalgo-green/5 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3">
                  <span className="text-vitalgo-green font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{t('howItWorks.scan.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('howItWorks.scan.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-500/10 p-4 rounded-full">
                    <Building2 className="w-10 h-10 text-blue-500" />
                  </div>
                </div>
                <div className="bg-blue-500/10 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-500 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{t('howItWorks.access.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('howItWorks.access.description')}
                </p>
              </div>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-red-500/10 p-4 rounded-full">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                  </div>
                </div>
                <div className="bg-red-500/10 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3">
                  <span className="text-red-500 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{t('howItWorks.emergency.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('howItWorks.emergency.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mt-8 bg-gradient-to-br from-vitalgo-green/5 to-blue-50 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('benefits.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-vitalgo-green/10 p-2 rounded-lg flex-shrink-0">
                    <Zap className="w-6 h-6 text-vitalgo-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('benefits.speed.title')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('benefits.speed.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('benefits.accuracy.title')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('benefits.accuracy.description')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-500/10 p-2 rounded-lg flex-shrink-0">
                    <Globe className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{t('benefits.universal.title')}</h3>
                    <p className="text-sm text-gray-600">
                      {t('benefits.universal.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Instructions Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('usage.title')}
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 border-2 border-gray-100 rounded-lg hover:border-vitalgo-green/30 transition-colors">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <Printer className="w-8 h-8 text-gray-700" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('usage.print.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('usage.print.description')}
                </p>
              </div>

              <div className="text-center p-6 border-2 border-gray-100 rounded-lg hover:border-vitalgo-green/30 transition-colors">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <Save className="w-8 h-8 text-gray-700" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('usage.digital.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('usage.digital.description')}
                </p>
              </div>

              <div className="text-center p-6 border-2 border-gray-100 rounded-lg hover:border-vitalgo-green/30 transition-colors">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-100 p-4 rounded-full">
                    <RefreshCw className="w-8 h-8 text-gray-700" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('usage.update.title')}</h3>
                <p className="text-sm text-gray-600">
                  {t('usage.update.description')}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-500/10 p-3 rounded-full flex-shrink-0">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{t('security.title')}</h3>
                <p className="text-gray-600">
                  {t('security.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MinimalFooter />
    </div>
  );
}