/**
 * Subscription Page Client Component
 *
 * Manages subscription UI and interactions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PlanSelector, SubscriptionManager, PaymentForm } from '@/components/subscription';
import { useSubscription } from '@/hooks/subscription';
import { useAuth } from '@/components/auth/AuthProvider';
import { PlanType } from '@/types/subscription';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function SubscriptionPageClient() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { subscription, plan, isLoading, cancel, reactivate } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [customerKey, setCustomerKey] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPlan = async (newPlan: PlanType) => {
    if (newPlan === 'free') {
      // Downgrade to free - cancel subscription
      if (confirm('무료 플랜으로 변경하시겠습니까? 현재 구독은 기간 종료 시 자동으로 취소됩니다.')) {
        try {
          await cancel();
          router.push('/dashboard');
        } catch (error) {
          alert('구독 변경에 실패했습니다. 다시 시도해주세요.');
        }
      }
      return;
    }

    // Upgrade to Pro - show payment form
    setSelectedPlan(newPlan);

    try {
      setIsProcessing(true);

      // Create customer key
      const response = await fetch('/api/payments/create-customer', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const data = await response.json();
      setCustomerKey(data.customerKey);
    } catch (error) {
      alert('결제 준비에 실패했습니다. 다시 시도해주세요.');
      setSelectedPlan(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Payment will be processed by Toss redirect
    // Success handler will be in success page
  };

  const handlePaymentError = (error: Error) => {
    alert(error.message);
    setSelectedPlan(null);
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">로그인이 필요합니다.</p>
          <Link href="/login">
            <Button>로그인하기</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/settings">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            설정으로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">구독 관리</h1>
        <p className="text-gray-600">플랜을 선택하고 구독을 관리하세요.</p>
      </div>

      <div className="space-y-8">
        {/* Show payment form if upgrading to Pro */}
        {selectedPlan === 'pro' && customerKey ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pro 플랜 결제</h2>
              <p className="text-gray-600">결제 정보를 입력하고 Pro 플랜을 시작하세요.</p>
            </div>

            <PaymentForm
              planType="pro"
              customerKey={customerKey}
              customerName={profile?.nickname || user.email?.split('@')[0] || '회원'}
              customerEmail={profile?.email || user.email || undefined}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />

            <div className="flex justify-center">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedPlan(null);
                  setCustomerKey('');
                }}
              >
                취소
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Current Subscription Status */}
            {subscription && subscription.plan_type === 'pro' && (
              <SubscriptionManager
                subscription={subscription}
                onCancel={cancel}
                onReactivate={reactivate}
                isLoading={isLoading}
              />
            )}

            {/* Plan Selector */}
            <div>
              <h2 className="text-2xl font-bold mb-6">플랜 선택</h2>
              <PlanSelector
                currentPlan={plan}
                onSelectPlan={handleSelectPlan}
                isLoading={isProcessing}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
