/**
 * Countries API Service
 * Fetches country data from the backend API
 */

export interface Country {
  id: number;
  name: string;
  code: string;
  flag_emoji: string | null;
  phone_code: string;
  is_active: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch with retry logic for resilience
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  delay = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Fetch attempt ${attempt + 1}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error('Fetch failed after retries');
}

/**
 * Fetch all active countries from the API
 * Countries are returned ordered by ID (Colombia first, then by proximity)
 */
export async function fetchCountries(): Promise<Country[]> {
  try {
    // Simple GET request without Content-Type to avoid CORS preflight
    const response = await fetchWithRetry(`${API_URL}/api/countries`, {
      method: 'GET',
      // No Content-Type header for GET - avoids unnecessary CORS preflight
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.statusText}`);
    }

    const countries: Country[] = await response.json();
    return countries;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
}

/**
 * Fetch a specific country by its ISO code
 */
export async function fetchCountryByCode(code: string): Promise<Country | null> {
  try {
    const response = await fetchWithRetry(`${API_URL}/api/countries/${code}`, {
      method: 'GET',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch country: ${response.statusText}`);
    }

    const country: Country = await response.json();
    return country;
  } catch (error) {
    console.error(`Error fetching country with code ${code}:`, error);
    throw error;
  }
}

/**
 * Convert API country to the format expected by PhoneInputGroup
 */
export function countryToPhoneInputFormat(country: Country) {
  return {
    code: country.code,
    name: country.name,
    dialCode: country.phone_code,
    flag: country.flag_emoji || '',
  };
}
