/**
 * Billing Page Client Component
 *
 * Shows payment history and invoices
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BillingHistory } from '@/components/subscription';
import { usePaymentHistory } from '@/hooks/subscription';
import { useAuth } from '@/components/auth/AuthProvider';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function BillingPageClient() {
  const { user } = useAuth();
  const { payments, isLoading } = usePaymentHistory();

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

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">결제 내역</h1>
        <p className="text-gray-600">구독 결제 내역 및 영수증을 확인하세요.</p>
      </div>

      {/* Billing History */}
      <BillingHistory payments={payments} isLoading={isLoading} />
    </div>
  );
}
