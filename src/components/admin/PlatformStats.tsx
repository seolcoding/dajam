'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, FolderOpen, Crown, DollarSign, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface PlatformStatsProps {
  stats?: {
    totalUsers: number;
    activeUsersThisWeek: number;
    totalSessions: number;
    proSubscribers: number;
    monthlyRevenue: number;
    activeSessions: number;
  };
  isLoading?: boolean;
}

// Mock trend data for mini charts
const mockTrendData = [
  { value: 10 },
  { value: 15 },
  { value: 12 },
  { value: 18 },
  { value: 22 },
  { value: 20 },
  { value: 25 },
];

export function PlatformStats({ stats, isLoading = false }: PlatformStatsProps) {
  const statCards = [
    {
      icon: Users,
      label: '총 사용자',
      value: stats?.totalUsers.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive' as const,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Activity,
      label: '활성 사용자 (이번 주)',
      value: stats?.activeUsersThisWeek.toLocaleString() || '0',
      change: '+8%',
      changeType: 'positive' as const,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: FolderOpen,
      label: '총 세션',
      value: stats?.totalSessions.toLocaleString() || '0',
      change: '+15%',
      changeType: 'positive' as const,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Crown,
      label: 'Pro 구독자',
      value: stats?.proSubscribers.toLocaleString() || '0',
      change: '+5%',
      changeType: 'positive' as const,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: DollarSign,
      label: '이번 달 매출',
      value: `₩${stats?.monthlyRevenue.toLocaleString() || '0'}`,
      change: '+20%',
      changeType: 'positive' as const,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: TrendingUp,
      label: '활성 세션 (실시간)',
      value: stats?.activeSessions.toLocaleString() || '0',
      change: '',
      changeType: 'neutral' as const,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-24 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change && (
                      <div
                        className={`text-xs mt-1 ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {stat.change} vs 지난주
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mini trend chart */}
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={mockTrendData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={stat.iconColor.replace('text-', '#')}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
