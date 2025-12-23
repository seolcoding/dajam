import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      status: 'error',
      message: 'Supabase 환경변수 없음',
    }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // RLS 영향 없는 공개 테이블로 연결 테스트
    // nickname_adjectives는 RLS 미설정 (공개 데이터)
    const { data, error } = await supabase
      .from('nickname_adjectives')
      .select('id')
      .limit(1);

    if (error) {
      // 테이블 없음 또는 연결 오류
      return NextResponse.json({
        status: 'warning',
        message: 'Supabase 연결됨, 스키마 확인 필요',
        error: error.message,
        code: error.code,
      });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase 연결 성공',
      url: supabaseUrl.replace(/https:\/\/(.{8}).*/, 'https://$1...'),
      tables: {
        nickname_adjectives: data ? 'exists' : 'empty',
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    }, { status: 500 });
  }
}
