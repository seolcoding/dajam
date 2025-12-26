'use client';

import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentSessions } from '@/components/dashboard/RecentSessions';
import { UsageStats } from '@/components/dashboard/UsageStats';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { useAuth } from '@/components/auth/AuthProvider';

export default function DashboardPage() {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold mb-2">
          환영합니다, {profile?.nickname || '사용자'}님!
        </h2>
        <p className="text-muted-foreground">
          인터랙티브 세션을 만들고 관리하세요.
        </p>
      </div>

      {/* Usage Stats */}
      <UsageStats userId={user?.id ?? null} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentSessions />
        </div>

        {/* Sidebar - Subscription Card */}
        <div>
          <SubscriptionCard />
        </div>
      </div>
    </div>
  );
}
