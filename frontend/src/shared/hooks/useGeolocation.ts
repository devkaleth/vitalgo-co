/**
 * useGeolocation Hook
 *
 * React hook for IP-based geolocation detection
 * Provides automatic country/location detection with caching
 *
 * @example
 * ```typescript
 * // Get country code on component mount
 * const { countryCode, isLoading, error } = useGeolocation();
 *
 * // Get full location data
 * const { location, isLoading } = useGeolocation({ fetchFullData: true });
 *
 * // Manual trigger
 * const { countryCode, refresh } = useGeolocation({ autoFetch: false });
 * // Later...
 * refresh();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { GeolocationService, GeolocationData, GeolocationOptions } from '../services/geolocation-service';

export interface UseGeolocationOptions extends GeolocationOptions {
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Fetch full location data instead of just country code (default: false) */
  fetchFullData?: boolean;
}

export interface UseGeolocationReturn {
  /** User's country code (e.g., 'CO', 'US', 'MX') */
  countryCode: string | null;
  /** User's dial code (e.g., '+57', '+1') */
  dialCode: string | null;
  /** Full location data (only if fetchFullData is true) */
  location: GeolocationData | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Manually refresh/refetch geolocation data */
  refresh: () => Promise<void>;
  /** Clear cached data and refresh */
  clearAndRefresh: () => Promise<void>;
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  autoFetch: true,
  fetchFullData: false,
  timeout: 5000,
  fallbackCountry: 'CO',
  cacheDuration: 60 * 60 * 1000, // 1 hour
};

/**
 * Hook for IP-based geolocation
 */
export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [dialCode, setDialCode] = useState<string | null>(null);
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(opts.autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchGeolocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (opts.fetchFullData) {
        // Fetch full location data
        const locationData = await GeolocationService.getUserLocation(opts);
        setLocation(locationData);
        setCountryCode(locationData?.country_code || opts.fallbackCountry);
        setDialCode(locationData?.country_calling_code || '+57');
      } else {
        // Fetch only country code (faster)
        const [code, dial] = await Promise.all([
          GeolocationService.getUserCountryCode(opts),
          GeolocationService.getUserDialCode(opts),
        ]);
        setCountryCode(code);
        setDialCode(dial);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch geolocation');
      setError(error);
      console.error('Geolocation error:', error);

      // Set fallback values
      setCountryCode(opts.fallbackCountry);
      setDialCode('+57');
    } finally {
      setIsLoading(false);
    }
  }, [opts]);

  const clearAndRefresh = useCallback(async () => {
    GeolocationService.clearCache();
    await fetchGeolocation();
  }, [fetchGeolocation]);

  useEffect(() => {
    if (opts.autoFetch) {
      fetchGeolocation();
    }
  }, [opts.autoFetch, fetchGeolocation]);

  return {
    countryCode,
    dialCode,
    location,
    isLoading,
    error,
    refresh: fetchGeolocation,
    clearAndRefresh,
  };
}
