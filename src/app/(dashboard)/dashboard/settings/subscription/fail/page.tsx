/**
 * Payment Failure Page
 *
 * Handles failed payment redirect from Toss
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        <h2 className="text-2xl font-bold mb-2">결제 실패</h2>

        <p className="text-gray-600 mb-6">
          {message || '결제 처리 중 오류가 발생했습니다.'}
        </p>

        {code && (
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-left text-gray-700">
                <p className="font-semibold mb-1">오류 코드</p>
                <p className="font-mono text-xs">{code}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Link href="/dashboard/settings/subscription">
            <Button className="w-full">다시 시도</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">대시보드로 돌아가기</Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          문제가 계속되면 고객센터로 문의해주세요.
        </p>
      </Card>
    </div>
  );
}
