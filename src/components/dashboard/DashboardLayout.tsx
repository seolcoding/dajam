'use client';

import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import type { Profile } from '@/types/database';

interface DashboardLayoutProps {
  children: ReactNode;
  userProfile?: Profile | null;
  headerTitle?: string;
}

export function DashboardLayout({
  children,
  userProfile,
  headerTitle,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar userProfile={userProfile} />

      <div className="flex-1 min-w-0">
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
