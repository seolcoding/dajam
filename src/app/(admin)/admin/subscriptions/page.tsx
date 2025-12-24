'use client';

import { SubscriptionTable } from '@/components/admin/SubscriptionTable';

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">구독 관리</h2>
        <p className="text-muted-foreground">모든 구독 정보를 관리하세요</p>
      </div>

      {/* Subscriptions Table */}
      <SubscriptionTable />
    </div>
  );
}
