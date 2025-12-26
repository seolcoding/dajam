'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Check, ArrowRight } from 'lucide-react';

interface SubscriptionCardProps {
  subscription?: {
    plan: 'free' | 'pro';
    nextBillingDate?: string | null;
    features: string[];
  };
  isLoading?: boolean;
}

// Mock data for demonstration
const mockSubscription = {
  plan: 'free' as const,
  nextBillingDate: null,
  features: [
    '월 10개 세션',
    '세션당 최대 50명',
    '기본 분석',
    '7일 데이터 보관',
  ],
};

const planFeatures = {
  free: [
    '월 10개 세션',
    '세션당 최대 50명',
    '기본 분석',
    '7일 데이터 보관',
  ],
  pro: [
    '무제한 세션',
    '세션당 최대 500명',
    '고급 분석 및 리포트',
    '90일 데이터 보관',
    '우선 지원',
    '커스텀 브랜딩',
  ],
};

export function SubscriptionCard({
  subscription = mockSubscription,
  isLoading = false,
}: SubscriptionCardProps) {
  const isPro = subscription.plan === 'pro';
  const features = planFeatures[subscription.plan];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">구독 플랜</CardTitle>
          <Badge variant={isPro ? 'default' : 'secondary'} className="gap-1">
            {isPro && <Crown className="w-3 h-3" />}
            {isPro ? 'Pro' : 'Free'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Name */}
        <div>
          <div className="text-2xl font-bold mb-1">
            {isPro ? 'Pro 플랜' : 'Free 플랜'}
          </div>
          {isPro && subscription.nextBillingDate && (
            <div className="text-xs text-muted-foreground">
              다음 결제일:{' '}
              {new Date(subscription.nextBillingDate).toLocaleDateString('ko-KR')}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">포함 기능</div>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        {isPro ? (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/settings/subscription">
              구독 관리
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        ) : (
          <div className="space-y-2">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600" asChild>
              <Link href="/dashboard/settings/subscription">
                <Crown className="w-4 h-4 mr-2" />
                Pro로 업그레이드
              </Link>
            </Button>
            <div className="text-center">
              <Link
                href="/pricing"
                className="text-xs text-muted-foreground hover:underline"
              >
                플랜 비교하기
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
