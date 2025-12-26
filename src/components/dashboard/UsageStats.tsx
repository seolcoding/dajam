'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, FolderOpen, Activity, Crown } from 'lucide-react';
import { useUserStats } from '@/lib/analytics';
import type { UserStats } from '@/lib/analytics';

interface UsageStatsProps {
  userId: string | null;
  plan?: 'free' | 'pro';
  monthlyLimit?: number;
}

// Free plan 기본 제한
const DEFAULT_MONTHLY_LIMIT = 10;

// 개발 환경에서 로그인 없이 테스트할 때 사용할 mock user ID
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID;

export function UsageStats({
  userId,
  plan = 'free',
  monthlyLimit = DEFAULT_MONTHLY_LIMIT,
}: UsageStatsProps) {
  // 개발 환경에서 userId가 없으면 DEV_USER_ID 사용
  const effectiveUserId = userId ?? (process.env.NODE_ENV === 'development' ? DEV_USER_ID : null) ?? null;

  const { stats, isLoading, error } = useUserStats({
    userId: effectiveUserId,
    period: 'month',
    enabled: !!effectiveUserId,
  });

  const actualStats: UserStats = stats ?? {
    totalSessions: 0,
    totalParticipants: 0,
    activeSessions: 0,
    byAppType: {},
    byDate: [],
  };

  const usagePercentage = Math.round((actualStats.totalSessions / monthlyLimit) * 100);

  const statCards = [
    {
      icon: FolderOpen,
      label: '이번 달 세션',
      value: `${actualStats.totalSessions} / ${monthlyLimit}`,
      subValue: `${Math.min(usagePercentage, 100)}% 사용`,
      progress: Math.min(usagePercentage, 100),
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: '총 참여자 수',
      value: actualStats.totalParticipants.toLocaleString(),
      subValue: '누적 참여자',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Activity,
      label: '활성 세션',
      value: actualStats.activeSessions,
      subValue: '현재 진행 중',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Crown,
      label: '플랜',
      value: (
        <Badge variant={plan === 'pro' ? 'default' : 'secondary'}>
          {plan === 'pro' ? 'Pro' : 'Free'}
        </Badge>
      ),
      subValue: plan === 'pro' ? '프로 회원' : '무료 회원',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full">
          <CardContent className="pt-6 text-center text-muted-foreground">
            통계를 불러오는 중 오류가 발생했습니다.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold mb-1">
                    {typeof stat.value === 'string' || typeof stat.value === 'number'
                      ? stat.value
                      : stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.subValue}</div>
                  {stat.progress !== undefined && (
                    <Progress value={stat.progress} className="h-1.5 mt-3" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
