'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlatformStats } from '@/components/admin/PlatformStats';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Activity, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const { stats, isLoading } = useAdminStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">관리자 대시보드</h2>
        <p className="text-muted-foreground">플랫폼 전체 현황을 한눈에 확인하세요</p>
      </div>

      {/* Platform Stats */}
      <PlatformStats stats={stats || undefined} isLoading={isLoading} />

      {/* Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`p-2 rounded-lg ${activity.iconBg}`}>
                    <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{activity.title}</div>
                    <div className="text-xs text-muted-foreground">{activity.description}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>시스템 상태</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockSystemStatus.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === 'healthy'
                          ? 'bg-green-500'
                          : item.status === 'warning'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Mock data
import { Users, FolderOpen, CreditCard } from 'lucide-react';

const mockRecentActivities = [
  {
    id: '1',
    icon: Users,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    title: '새 사용자 가입',
    description: '김철수님이 Google로 가입했습니다',
    time: '5분 전',
  },
  {
    id: '2',
    icon: FolderOpen,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    title: '새 세션 생성',
    description: '이영희님이 "팀 회의 투표" 세션을 생성했습니다',
    time: '15분 전',
  },
  {
    id: '3',
    icon: CreditCard,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    title: 'Pro 구독 시작',
    description: '박민수님이 Pro 플랜을 시작했습니다',
    time: '1시간 전',
  },
];

const mockSystemStatus = [
  { label: 'API 서버', status: 'healthy' as const, value: '정상' },
  { label: '데이터베이스', status: 'healthy' as const, value: '정상' },
  { label: 'Realtime 서비스', status: 'healthy' as const, value: '정상' },
  { label: 'Storage', status: 'healthy' as const, value: '84% 사용 중' },
];
