/**
 * useSubscription Hook
 *
 * Manages subscription state and operations
 * Fetches current user's subscription and provides upgrade/cancel functions
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Subscription, PlanType } from '@/types/subscription';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  plan: PlanType;
  isLoading: boolean;
  error: Error | null;
  upgrade: () => Promise<void>;
  cancel: () => Promise<void>;
  reactivate: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchSubscription = useCallback(async () => {
    if (!user || !supabase) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        // If subscription doesn't exist, create one with free plan
        if (fetchError.code === 'PGRST116') {
          const { data: newSub, error: createError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: user.id,
              plan_type: 'free',
              status: 'active',
              cancel_at_period_end: false,
            })
            .select()
            .single();

          if (createError) {
            throw createError;
          }

          setSubscription(newSub);
        } else {
          throw fetchError;
        }
      } else {
        setSubscription(data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch subscription');
      setError(error);
      console.error('Failed to fetch subscription:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgrade = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Create customer key if not exists
      const customerResponse = await fetch('/api/payments/create-customer', {
        method: 'POST',
      });

      if (!customerResponse.ok) {
        throw new Error('Failed to create customer');
      }

      const { customerKey } = await customerResponse.json();

      // Step 2: Payment flow handled by TossPaymentButton component
      // This will redirect to Toss payment page
      // After successful payment, webhook will update subscription

      return customerKey;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to upgrade');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancel = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/payments/cancel', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      // Optimistic update
      if (subscription) {
        setSubscription({
          ...subscription,
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        });
      }

      // Refresh subscription
      await fetchSubscription();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel subscription');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, fetchSubscription]);

  const reactivate = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/payments/cancel', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reactivate subscription');
      }

      // Optimistic update
      if (subscription) {
        setSubscription({
          ...subscription,
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        });
      }

      // Refresh subscription
      await fetchSubscription();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reactivate subscription');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [subscription, fetchSubscription]);

  return {
    subscription,
    plan: subscription?.plan_type || 'free',
    isLoading,
    error,
    upgrade,
    cancel,
    reactivate,
    refresh: fetchSubscription,
  };
}
