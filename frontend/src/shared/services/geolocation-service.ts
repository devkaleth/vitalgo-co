/**
 * Geolocation Service
 *
 * Provides IP-based geolocation functionality using ipapi.co
 * This service can detect user's country, city, and other location data
 * without requiring user permissions.
 *
 * Free tier limits: 1,000 requests/day
 * No API key required
 *
 * @example
 * ```typescript
 * // Get user's country code
 * const countryCode = await GeolocationService.getUserCountryCode();
 *
 * // Get full location data
 * const location = await GeolocationService.getUserLocation();
 * console.log(location.country_name); // "Colombia"
 * ```
 */

export interface GeolocationData {
  ip: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  asn: string;
  org: string;
}

export interface GeolocationOptions {
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Fallback country code if API fails (default: 'CO') */
  fallbackCountry?: string;
  /** Cache duration in milliseconds (default: 1 hour) */
  cacheDuration?: number;
}

const DEFAULT_OPTIONS: Required<GeolocationOptions> = {
  timeout: 5000,
  fallbackCountry: 'CO',
  cacheDuration: 60 * 60 * 1000, // 1 hour
};

// Cache key for localStorage
const CACHE_KEY = 'vitalgo_geolocation_cache';

interface CachedGeolocation {
  data: GeolocationData;
  timestamp: number;
}

export class GeolocationService {
  private static readonly API_URL = 'https://ipapi.co/json/';

  /**
   * Get full geolocation data for the current user
   * Results are cached in localStorage to minimize API calls
   */
  static async getUserLocation(
    options: GeolocationOptions = {}
  ): Promise<GeolocationData | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      // Check cache first
      const cached = this.getFromCache();
      if (cached && Date.now() - cached.timestamp < opts.cacheDuration) {
        return cached.data;
      }

      // Fetch from API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), opts.timeout);

      const response = await fetch(this.API_URL, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeolocationData = await response.json();

      // Cache the result
      this.saveToCache(data);

      return data;
    } catch (error) {
      console.warn('Geolocation API error:', error);

      // Try to return cached data even if expired
      const cached = this.getFromCache();
      if (cached) {
        console.info('Using expired cached geolocation data');
        return cached.data;
      }

      return null;
    }
  }

  /**
   * Get only the country code for the current user
   * This is the most common use case and returns quickly
   */
  static async getUserCountryCode(
    options: GeolocationOptions = {}
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const location = await this.getUserLocation(options);
      return location?.country_code || opts.fallbackCountry;
    } catch (error) {
      console.warn('Failed to get country code:', error);
      return opts.fallbackCountry;
    }
  }

  /**
   * Get country calling code (dial code) for the current user
   * @returns Dial code with '+' prefix (e.g., '+57', '+1')
   */
  static async getUserDialCode(
    options: GeolocationOptions = {}
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    try {
      const location = await this.getUserLocation(options);
      return location?.country_calling_code || '+57'; // Default to Colombia
    } catch (error) {
      console.warn('Failed to get dial code:', error);
      return '+57';
    }
  }

  /**
   * Check if user is in the European Union
   */
  static async isUserInEU(
    options: GeolocationOptions = {}
  ): Promise<boolean> {
    try {
      const location = await this.getUserLocation(options);
      return location?.in_eu || false;
    } catch (error) {
      console.warn('Failed to check EU status:', error);
      return false;
    }
  }

  /**
   * Clear cached geolocation data
   * Useful for testing or when user changes location
   */
  static clearCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  /**
   * Save geolocation data to cache
   */
  private static saveToCache(data: GeolocationData): void {
    if (typeof window !== 'undefined') {
      try {
        const cached: CachedGeolocation = {
          data,
          timestamp: Date.now(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
      } catch (error) {
        console.warn('Failed to cache geolocation data:', error);
      }
    }
  }

  /**
   * Get geolocation data from cache
   */
  private static getFromCache(): CachedGeolocation | null {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          return JSON.parse(cached) as CachedGeolocation;
        }
      } catch (error) {
        console.warn('Failed to read cached geolocation data:', error);
      }
    }
    return null;
  }
}
