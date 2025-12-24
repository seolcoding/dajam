/**
 * BillingHistory Component
 *
 * Table of past payments
 * Shows date, amount, status, and receipt links
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaymentHistory, PaymentStatus, formatKRW } from '@/types/subscription';
import { Download, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface BillingHistoryProps {
  payments: PaymentHistory[];
  isLoading?: boolean;
}

function getStatusBadge(status: PaymentStatus) {
  switch (status) {
    case 'succeeded':
      return <Badge variant="default" className="bg-green-600">완료</Badge>;
    case 'pending':
      return <Badge variant="secondary">대기중</Badge>;
    case 'failed':
      return <Badge variant="destructive">실패</Badge>;
    case 'refunded':
      return <Badge variant="outline">환불됨</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function BillingHistory({ payments, isLoading }: BillingHistoryProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">아직 결제 내역이 없습니다.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">결제 내역</h3>

      <div className="space-y-2">
        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-gray-600">
                <th className="pb-3 font-semibold">날짜</th>
                <th className="pb-3 font-semibold">내역</th>
                <th className="pb-3 font-semibold">금액</th>
                <th className="pb-3 font-semibold">상태</th>
                <th className="pb-3 font-semibold">영수증</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b last:border-0">
                  <td className="py-4 text-sm">
                    {format(new Date(payment.created_at), 'yyyy.MM.dd', { locale: ko })}
                  </td>
                  <td className="py-4 text-sm">
                    {payment.description || 'Pro 구독'}
                  </td>
                  <td className="py-4 font-semibold">
                    {formatKRW(payment.amount)}
                  </td>
                  <td className="py-4">
                    {getStatusBadge(payment.status)}
                  </td>
                  <td className="py-4">
                    {payment.receipt_url && payment.status === 'succeeded' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-1" />
                          다운로드
                        </a>
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-3">
          {payments.map((payment) => (
            <Card key={payment.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{payment.description || 'Pro 구독'}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(payment.created_at), 'yyyy.MM.dd', { locale: ko })}
                  </p>
                </div>
                {getStatusBadge(payment.status)}
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-lg font-bold">{formatKRW(payment.amount)}</span>
                {payment.receipt_url && payment.status === 'succeeded' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-1" />
                      영수증
                    </a>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
}
