/**
 * QR Card Molecule Component
 * Displays QR code with metadata and actions
 */
import { useTranslations } from 'next-intl';
import { Heart } from 'lucide-react';
import { QRCodeImage } from '../atoms/QRCodeImage';
import { DownloadButton } from '../atoms/DownloadButton';
import { EmergencyBadge } from '../atoms/EmergencyBadge';
import { QRData } from '../../types';

interface QRCardProps {
  qrData?: QRData;
  isLoading?: boolean;
  onDownload: () => void;
  'data-testid'?: string;
}

export function QRCard({
  qrData,
  isLoading = false,
  onDownload,
  'data-testid': testId
}: QRCardProps) {
  const t = useTranslations('qr');

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto border-2 border-vitalgo-green/10"
      data-testid={testId}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="bg-vitalgo-green/10 p-2 rounded-full">
            <Heart className="w-6 h-6 text-vitalgo-green fill-vitalgo-green" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t('emergencyCardTitle')}</h2>
        </div>
        <EmergencyBadge />
      </div>

      {/* QR Code */}
      <div className="flex justify-center mb-6 bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
        <QRCodeImage
          qrImageBase64={qrData?.qrImageBase64}
          emergencyUrl={qrData?.emergencyUrl}
          size="lg"
          isLoading={isLoading}
          data-testid="qr-code-image"
        />
      </div>

      {/* Emergency URL */}
      {qrData?.emergencyUrl && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm font-medium text-blue-900 mb-2">{t('emergencyUrl')}</p>
          <p className="text-xs text-blue-700 break-all font-mono bg-white p-2 rounded">
            {qrData.emergencyUrl}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center mb-6">
        <DownloadButton
          onClick={onDownload}
          disabled={(!qrData?.qrImageBase64 && !qrData?.emergencyUrl) || isLoading}
          label={t('download')}
          data-testid="download-qr-button"
        />
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-red-500/10 p-2 rounded-full flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">{t('important')}</p>
            <p className="text-sm text-gray-700">{t('keepAccessible')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}