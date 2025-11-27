/**
 * useCountries Hook
 * Custom hook to fetch and manage countries data from API
 */

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { fetchCountries, Country, countryToPhoneInputFormat } from '@/services/countriesService';

interface UseCountriesResult {
  countries: Country[];
  isLoading: boolean;
  error: Error | null;
  getCountryByCode: (code: string) => Country | undefined;
  countriesForPhoneInput: Array<{
    code: string;
    name: string;
    dialCode: string;
    flag: string;
  }>;
}

export function useCountries(): UseCountriesResult {
  const locale = useLocale();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchCountries();

        if (isMounted) {
          setCountries(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load countries'));
          setIsLoading(false);
        }
      }
    };

    loadCountries();

    return () => {
      isMounted = false;
    };
  }, []);

  const getCountryByCode = (code: string): Country | undefined => {
    return countries.find(country => country.code === code);
  };

  const countriesForPhoneInput = countries.map(c => countryToPhoneInputFormat(c, locale));

  return {
    countries,
    isLoading,
    error,
    getCountryByCode,
    countriesForPhoneInput,
  };
}
