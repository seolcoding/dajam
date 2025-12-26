'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/components/auth/AuthProvider';

// 개발/테스트 환경에서 로그인 체크 우회
// development 또는 test 모드에서는 인증 우회
const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
const DEV_USER_ID = process.env.NEXT_PUBLIC_DEV_USER_ID ?? 'dev-user-local';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  // 개발/테스트 환경에서 로그인 체크 우회
  // - 개발 모드에서는 항상 우회
  // - localhost에서도 우회 (E2E 테스트)
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const bypassAuth = isDev || isLocalhost;

  useEffect(() => {
    if (!bypassAuth && !loading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [loading, user, router, bypassAuth]);

  // Show loading state while checking auth (개발 환경 우회 시 스킵)
  if (!bypassAuth && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <div className="text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  // Not logged in - will redirect (개발 환경 우회 시 스킵)
  if (!bypassAuth && !user) {
    return null;
  }

  // 개발/테스트 환경 mock profile
  const effectiveProfile = profile ?? (bypassAuth ? {
    id: DEV_USER_ID ?? 'e2e-test-user',
    nickname: isLocalhost ? 'E2E 테스트' : '개발자 (테스트)',
    email: 'dev@test.com',
    avatar_url: null,
    provider: null,
    is_admin: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } : null);

  return (
    <DashboardLayout userProfile={effectiveProfile}>
      {children}
    </DashboardLayout>
  );
}
