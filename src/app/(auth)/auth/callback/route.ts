import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth 콜백 핸들러
 *
 * 수정 이력:
 * - 2024-12-24: x-forwarded-host 헤더 처리 추가 (Step 1)
 *   - 프로덕션 환경에서 로드밸런서/프록시 뒤의 실제 도메인으로 리다이렉트
 *   - next 파라미터 지원 추가
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // next 파라미터가 있으면 사용, 없으면 /dashboard로 기본값
  let next = requestUrl.searchParams.get('next') ?? '/dashboard';

  // next가 상대 경로가 아니면 기본값 사용 (보안)
  if (!next.startsWith('/')) {
    next = '/dashboard';
  }

  const origin = requestUrl.origin;

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(`${origin}/login?error=auth_unavailable`);
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    console.log('[OAuth Callback] Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[OAuth Callback] Error:', error);
      return NextResponse.redirect(`${origin}/login?error=${error.message}`);
    }

    console.log('[OAuth Callback] Session created for:', data.session?.user?.email);

    // Step 1: x-forwarded-host 헤더 처리
    // 프로덕션 환경에서 로드밸런서/Vercel 프록시 뒤의 실제 도메인 사용
    const forwardedHost = request.headers.get('x-forwarded-host');
    const isLocalEnv = process.env.NODE_ENV === 'development';

    if (isLocalEnv) {
      // 개발 환경: 로드밸런서 없으므로 origin 그대로 사용
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      // 프로덕션: x-forwarded-host가 있으면 실제 도메인으로 리다이렉트
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      // 프로덕션: x-forwarded-host가 없으면 origin 사용
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
