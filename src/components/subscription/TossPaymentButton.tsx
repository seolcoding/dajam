/**
 * TossPaymentButton Component
 *
 * Initiates Toss billing key registration flow
 * Handles customer key generation and redirect
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { requestBillingAuth, MOCK_MODE, getMockBillingAuth } from '@/lib/toss/client';

interface TossPaymentButtonProps {
  customerKey: string;
  customerName: string;
  customerEmail?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function TossPaymentButton({
  customerKey,
  customerName,
  customerEmail,
  onSuccess,
  onError,
  className,
}: TossPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoading(true);

      // Mock mode for development
      if (MOCK_MODE) {
        console.warn('Running in MOCK mode - Toss client key not configured');
        const mockAuth = getMockBillingAuth();
        // Redirect to success page with mock data
        const successUrl = new URL('/dashboard/settings/subscription/success', window.location.origin);
        successUrl.searchParams.set('authKey', mockAuth.authKey);
        successUrl.searchParams.set('customerKey', customerKey);
        window.location.href = successUrl.toString();
        return;
      }

      const successUrl = new URL('/dashboard/settings/subscription/success', window.location.origin);
      const failUrl = new URL('/dashboard/settings/subscription/fail', window.location.origin);

      await requestBillingAuth({
        customerKey,
        customerName,
        customerEmail,
        successUrl: successUrl.toString(),
        failUrl: failUrl.toString(),
      });

      onSuccess?.();
    } catch (error) {
      console.error('Failed to initiate billing auth:', error);
      const err = error instanceof Error ? error : new Error('결제 정보 등록에 실패했습니다.');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      size="lg"
    >
      <CreditCard className="w-4 h-4 mr-2" />
      {isLoading ? '처리 중...' : '결제 정보 등록'}
    </Button>
  );
}
