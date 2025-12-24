import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=auth_unavailable`);
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=${error.message}`);
    }

    // Successfully exchanged code for session
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // No code provided
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
