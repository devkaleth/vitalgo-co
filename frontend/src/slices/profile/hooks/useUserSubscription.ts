/**
 * Custom hook for user subscription information
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalStorageService } from '../../../shared/services/local-storage-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserSubscription {
  id: number;
  plan_id: number;
  plan_name: string;
  plan_display_name: string;
  status: string;
  start_date: string;
  end_date: string | null;
}

interface UseUserSubscriptionResult {
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserSubscription(): UseUserSubscriptionResult {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accessToken = LocalStorageService.getAccessToken();
      if (!accessToken) {
        setError('No access token');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/subscriptions/my-subscription`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else if (response.status === 404) {
        // User has no active subscription
        setSubscription(null);
      } else {
        throw new Error('Failed to fetch subscription');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading subscription';
      console.error('Error fetching subscription:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refetch,
  };
}
