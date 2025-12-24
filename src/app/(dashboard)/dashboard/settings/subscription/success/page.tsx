/**
 * Payment Success Page
 *
 * Handles successful payment redirect from Toss
 * Confirms billing key and activates subscription
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CheckCircle, XCircle, Crown } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('결제 정보를 확인하는 중...');

  useEffect(() => {
    const processPayment = async () => {
      try {
        const authKey = searchParams.get('authKey');
        const customerKey = searchParams.get('customerKey');

        if (!authKey || !customerKey) {
          throw new Error('결제 정보가 올바르지 않습니다.');
        }

        // Step 1: Confirm billing key
        const billingResponse = await fetch('/api/payments/billing-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authKey, customerKey }),
        });

        if (!billingResponse.ok) {
          const error = await billingResponse.json();
          throw new Error(error.error || 'Failed to register billing key');
        }

        // Step 2: Activate subscription
        const subscribeResponse = await fetch('/api/payments/subscribe', {
          method: 'POST',
        });

        if (!subscribeResponse.ok) {
          const error = await subscribeResponse.json();
          throw new Error(error.error || 'Failed to activate subscription');
        }

        setStatus('success');
        setMessage('Pro 구독이 활성화되었습니다!');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.');
      }
    };

    processPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full p-8 text-center">
        {status === 'processing' && (
          <>
            <LoadingSpinner className="mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">결제 처리 중</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-purple-600" />
              환영합니다!
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link href="/dashboard">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                대시보드로 이동
              </Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">결제 실패</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-2">
              <Link href="/dashboard/settings/subscription">
                <Button className="w-full">다시 시도</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">대시보드로 돌아가기</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
