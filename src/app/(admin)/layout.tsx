'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/admin');
      return;
    }

    // Check if user is admin
    if (!loading && profile && !profile.is_admin) {
      router.push('/dashboard');
    }
  }, [loading, user, profile, router]);

  const handleLogout = async () => {
    await signOut();
    // signOut 내부에서 window.location.href로 리다이렉트 처리됨
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4" />
          <div className="text-muted-foreground">관리자 권한 확인 중...</div>
        </div>
      </div>
    );
  }

  // Not logged in - will redirect
  if (!user) {
    return null;
  }

  // Show access denied if not admin
  if (profile && !profile.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">접근 권한이 없습니다</h1>
          <p className="text-muted-foreground mb-6">
            관리자만 접근할 수 있는 페이지입니다.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            대시보드로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout userProfile={profile} onLogout={handleLogout}>
      {children}
    </AdminLayout>
  );
}
