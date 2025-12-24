'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { LoginButtons } from '@/components/auth/LoginButtons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-slate-500">로딩 중...</div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <Card className="border-slate-200 shadow-lg animate-slide-up">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">로그인</CardTitle>
        <CardDescription className="text-center">
          소셜 계정으로 간편하게 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <LoginButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">또는</span>
          </div>
        </div>

        <div className="text-center text-sm text-slate-600">
          계정이 없으신가요?{' '}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            회원가입
          </Link>
        </div>

        <div className="text-center text-xs text-slate-500 pt-4">
          로그인하시면{' '}
          <Link href="/terms" className="underline hover:text-slate-700">
            이용약관
          </Link>{' '}
          및{' '}
          <Link href="/privacy" className="underline hover:text-slate-700">
            개인정보처리방침
          </Link>
          에 동의하는 것으로 간주됩니다.
        </div>
      </CardContent>
    </Card>
  );
}
