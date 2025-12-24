/**
 * SubscriptionManager Component
 *
 * Manages active subscription
 * Shows status, next billing date, cancel/reactivate options
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Subscription, formatKRW, PLAN_DETAILS } from '@/types/subscription';
import { AlertCircle, Calendar, CreditCard, XCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface SubscriptionManagerProps {
  subscription: Subscription;
  onCancel: () => Promise<void>;
  onReactivate: () => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionManager({
  subscription,
  onCancel,
  onReactivate,
  isLoading = false,
}: SubscriptionManagerProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);

  const plan = PLAN_DETAILS[subscription.plan_type];
  const nextBillingDate = subscription.current_period_end
    ? new Date(subscription.current_period_end)
    : null;

  const handleCancel = async () => {
    try {
      setIsCancelling(true);
      await onCancel();
      setShowCancelDialog(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsReactivating(true);
      await onReactivate();
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold mb-1">구독 관리</h3>
            <p className="text-sm text-gray-600">현재 구독 정보 및 결제 관리</p>
          </div>
          <Badge
            variant={subscription.status === 'active' ? 'default' : 'secondary'}
            className={subscription.status === 'active' ? 'bg-green-600' : ''}
          >
            {subscription.status === 'active' ? '활성' : '취소됨'}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 mb-1">현재 플랜</p>
              <p className="text-lg font-semibold">{plan.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">월 요금</p>
              <p className="text-lg font-semibold">{formatKRW(plan.price)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {nextBillingDate && (
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {subscription.cancel_at_period_end ? '만료 예정일' : '다음 결제일'}
                </p>
                <p className="text-lg font-semibold">
                  {format(nextBillingDate, 'yyyy년 MM월 dd일', { locale: ko })}
                </p>
              </div>
            )}

            {subscription.toss_billing_key && (
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  결제 수단
                </p>
                <p className="text-sm">등록된 카드</p>
              </div>
            )}
          </div>
        </div>

        {subscription.cancel_at_period_end && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-800 font-semibold mb-1">
                  구독 취소가 예약되었습니다
                </p>
                <p className="text-sm text-amber-700">
                  {nextBillingDate && format(nextBillingDate, 'yyyy년 MM월 dd일', { locale: ko })}까지 Pro 기능을 계속 사용할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex gap-2">
          {subscription.cancel_at_period_end ? (
            <Button
              variant="default"
              onClick={handleReactivate}
              disabled={isReactivating || isLoading}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isReactivating ? '처리 중...' : '구독 재개'}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(true)}
              disabled={isLoading}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              구독 취소
            </Button>
          )}
        </div>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>구독을 취소하시겠습니까?</DialogTitle>
            <DialogDescription>
              구독을 취소하시면 다음 결제일부터 Pro 기능을 사용할 수 없습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold">취소 시 제한되는 기능:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {PLAN_DETAILS.pro.features.slice(0, 4).map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {nextBillingDate && (
            <p className="text-sm text-gray-600">
              {format(nextBillingDate, 'yyyy년 MM월 dd일', { locale: ko })}까지는 Pro 기능을 계속 사용할 수 있습니다.
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              돌아가기
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? '처리 중...' : '구독 취소'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
