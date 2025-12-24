'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useProfile } from '@/hooks/useProfile';
import { useSupabase } from '@/hooks/useSupabase';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = useSupabase();
  const { profile, isLoading } = useProfile();

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && !isLoading) {
        // Redirect to login page (would need to create this)
        router.push('/login?redirect=/dashboard');
      }
    };

    checkAuth();
  }, [supabase, isLoading, router]);

  const handleLogout = async () => {
    if (!supabase) return;

    await supabase.auth.signOut();
    router.push('/');
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout userProfile={profile} onLogout={handleLogout}>
      {children}
    </DashboardLayout>
  );
}
