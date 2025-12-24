import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase 세션 갱신 미들웨어 유틸리티
 *
 * 수정 이력:
 * - 2024-12-24: Step 3 - 쿠키 설정 패턴 수정
 *   - supabaseResponse를 let으로 변경하여 재할당 가능하게 함
 *   - setAll에서 NextResponse.next() 재호출하여 쿠키가 확실히 반영되도록 함
 *   - Supabase 공식 패턴과 일치하도록 수정
 */

// Supabase 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export async function updateSession(request: NextRequest) {
  // Step 3: let으로 변경하여 재할당 가능하게 함
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Supabase가 설정되지 않으면 그냥 통과
  if (!isSupabaseConfigured) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Step 3: 공식 패턴 적용
        // 1. request에 쿠키 설정
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // 2. 변경된 request로 새 response 생성 (중요!)
        supabaseResponse = NextResponse.next({
          request,
        });
        // 3. response에도 쿠키 설정
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Auth 세션 갱신
  await supabase.auth.getUser();

  return supabaseResponse;
}
