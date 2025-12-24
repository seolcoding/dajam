'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, FolderOpen, Activity, Crown } from 'lucide-react';

interface UsageStatsProps {
  stats?: {
    monthlySessionsUsed: number;
    monthlySessionsLimit: number;
    totalParticipants: number;
    activeSessions: number;
    plan: 'free' | 'pro';
  };
  isLoading?: boolean;
}

// Mock data for demonstration
const mockStats = {
  monthlySessionsUsed: 5,
  monthlySessionsLimit: 10,
  totalParticipants: 142,
  activeSessions: 2,
  plan: 'free' as const,
};

export function UsageStats({ stats = mockStats, isLoading = false }: UsageStatsProps) {
  const usagePercentage = Math.round(
    (stats.monthlySessionsUsed / stats.monthlySessionsLimit) * 100
  );

  const statCards = [
    {
      icon: FolderOpen,
      label: '이번 달 세션',
      value: `${stats.monthlySessionsUsed} / ${stats.monthlySessionsLimit}`,
      subValue: `${usagePercentage}% 사용`,
      progress: usagePercentage,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Users,
      label: '총 참여자 수',
      value: stats.totalParticipants.toLocaleString(),
      subValue: '누적 참여자',
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Activity,
      label: '활성 세션',
      value: stats.activeSessions,
      subValue: '현재 진행 중',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Crown,
      label: '플랜',
      value: (
        <Badge variant={stats.plan === 'pro' ? 'default' : 'secondary'}>
          {stats.plan === 'pro' ? 'Pro' : 'Free'}
        </Badge>
      ),
      subValue: stats.plan === 'pro' ? '프로 회원' : '무료 회원',
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
