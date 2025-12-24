'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function LoginButtons() {
  const [loading, setLoading] = useState<'google' | 'kakao' | null>(null);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'google' | 'kakao') => {
    if (!supabase) {
      alert('인증 서비스를 사용할 수 없습니다. 환경 변수를 확인해주세요.');
      return;
    }

    setLoading(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        alert(`로그인 실패: ${error.message}`);
        setLoading(null);
      }
      // On success, browser redirects to OAuth provider
    } catch (error) {
      console.error(`${provider} login error:`, error);
      alert('로그인 중 오류가 발생했습니다.');
      setLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* Kakao Login */}
      <Button
        onClick={() => handleOAuthLogin('kakao')}
        disabled={loading !== null}
        className="w-full h-12 bg-[#FEE500] hover:bg-[#FDD835] text-[#000000] font-semibold flex items-center justify-center gap-2"
      >
        {loading === 'kakao' ? (
          <LoadingSpinner />
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C6.477 3 2 6.477 2 10.5C2 13.13 3.766 15.385 6.323 16.586L5.438 20.062C5.39 20.256 5.586 20.413 5.76 20.313L9.823 17.677C10.536 17.777 11.263 17.827 12 17.827C17.523 17.827 22 14.35 22 10.327C22 6.304 17.523 3 12 3Z"
                fill="currentColor"
              />
            </svg>
            카카오로 시작하기
          </>
        )}
      </Button>

      {/* Google Login */}
      <Button
        onClick={() => handleOAuthLogin('google')}
        disabled={loading !== null}
        variant="outline"
        className="w-full h-12 bg-white hover:bg-slate-50 text-slate-700 font-semibold border-slate-300 flex items-center justify-center gap-2"
      >
        {loading === 'google' ? (
          <LoadingSpinner />
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 시작하기
          </>
        )}
      </Button>
    </div>
  );
}
