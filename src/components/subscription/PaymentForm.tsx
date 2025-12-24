/**
 * PaymentForm Component
 *
 * Wrapper for Toss payment flow
 * Shows plan details, terms agreement, and payment button
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { TossPaymentButton } from './TossPaymentButton';
import { PLAN_DETAILS, formatKRW, PlanType } from '@/types/subscription';
import { AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  planType: PlanType;
  customerKey: string;
  customerName: string;
  customerEmail?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function PaymentForm({
  planType,
  customerKey,
  customerName,
  customerEmail,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToRecurring, setAgreedToRecurring] = useState(false);

  const plan = PLAN_DETAILS[planType];
  const isValid = agreedToTerms && agreedToRecurring;

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">결제 정보</h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">플랜</span>
            <span className="font-semibold">{plan.name}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">결제 금액</span>
            <span className="text-2xl font-bold text-purple-600">
              {formatKRW(plan.price)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-500">다음 결제일</span>
            <span className="text-gray-700">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">정기 결제 안내</p>
              <p>매월 자동으로 결제되며, 언제든지 구독을 취소할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
          />
          <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
            <a href="/terms" target="_blank" className="text-purple-600 hover:underline">
              이용약관
            </a>
            {' '}및{' '}
            <a href="/privacy" target="_blank" className="text-purple-600 hover:underline">
              개인정보처리방침
            </a>
            에 동의합니다.
          </Label>
        </div>

        <div className="flex items-start gap-2">
          <Checkbox
            id="recurring"
            checked={agreedToRecurring}
            onCheckedChange={(checked) => setAgreedToRecurring(checked === true)}
          />
          <Label htmlFor="recurring" className="text-sm cursor-pointer leading-relaxed">
            정기 결제 및 자동 갱신에 동의합니다.
          </Label>
        </div>
      </div>

      <TossPaymentButton
        customerKey={customerKey}
        customerName={customerName}
        customerEmail={customerEmail}
        onSuccess={onSuccess}
        onError={onError}
        className={`w-full ${!isValid && 'opacity-50 cursor-not-allowed'}`}
      />

      {!isValid && (
        <p className="text-sm text-center text-gray-500">
          약관에 동의해주세요
        </p>
      )}
    </Card>
  );
}
