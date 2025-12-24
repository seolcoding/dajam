/**
 * usePaymentHistory Hook
 *
 * Fetches and manages payment history for the current user
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { PaymentHistory } from '@/types/subscription';

interface UsePaymentHistoryReturn {
  payments: PaymentHistory[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function usePaymentHistory(): UsePaymentHistoryReturn {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  const fetchPaymentHistory = useCallback(async () => {
    if (!user || !supabase) {
      setPayments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPayments(data || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch payment history');
      setError(error);
      console.error('Failed to fetch payment history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchPaymentHistory();
  }, [fetchPaymentHistory]);

  return {
    payments,
    isLoading,
    error,
    refresh: fetchPaymentHistory,
  };
}
