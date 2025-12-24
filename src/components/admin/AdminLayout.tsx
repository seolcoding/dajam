'use client';

import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import type { Profile } from '@/types/database';

interface AdminLayoutProps {
  children: ReactNode;
  userProfile?: Profile | null;
  headerTitle?: string;
}

export function AdminLayout({
  children,
  userProfile,
  headerTitle,
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar userProfile={userProfile} />

      <div className="lg:pl-64">
        <DashboardHeader
          title={headerTitle}
          userProfile={userProfile}
        />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
