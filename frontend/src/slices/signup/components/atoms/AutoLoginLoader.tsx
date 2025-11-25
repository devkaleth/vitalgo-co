'use client';
/**
 * AutoLoginLoader - Atomic component for showing auto-login progress with countdown
 * Used during registration success to indicate automatic login is happening
 */
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface AutoLoginLoaderProps {
  /** Duration in seconds for the countdown */
  duration?: number;
  /** Callback function called when countdown completes */
  onComplete: () => void;
  /** Optional additional message to show */
  message?: string;
}

export const AutoLoginLoader: React.FC<AutoLoginLoaderProps> = ({
  duration = 3,
  onComplete,
  message
}) => {
  const t = useTranslations('signup');
  const displayMessage = message || t('messages.autoLogin');
  const [countdown, setCountdown] = useState(duration);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
      setProgress(((duration - countdown + 1) / duration) * 100);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, duration, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6" data-testid="auto-login-loader">
      {/* Animated loading spinner */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-vitalgo-green-lightest rounded-full animate-spin border-t-vitalgo-green"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-vitalgo-green">{countdown}</span>
        </div>
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-900">
          {displayMessage}
        </p>
        <p className="text-sm text-gray-600">
          {t('messages.redirectingPanel', { countdown })}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="bg-gray-200 rounded-full h-2">
          <div
            className="bg-vitalgo-green h-2 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Additional visual indicator */}
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-vitalgo-green rounded-full animate-pulse"
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.5s'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};