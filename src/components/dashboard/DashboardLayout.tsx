'use client';

import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import type { Profile } from '@/types/database';

interface DashboardLayoutProps {
  children: ReactNode;
  userProfile?: Profile | null;
  headerTitle?: string;
  onLogout?: () => void;
}

export function DashboardLayout({
  children,
  userProfile,
  headerTitle,
  onLogout,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardSidebar userProfile={userProfile} onLogout={onLogout} />

      <div className="lg:pl-64">
        <DashboardHeader
          title={headerTitle}
          userProfile={userProfile}
          onLogout={onLogout}
        />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
