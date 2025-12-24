'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Supabase 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Type alias for the Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): any {
  if (!isSupabaseConfigured) {
    // 환경 변수가 없으면 null 반환 (로컬 모드로 동작)
    return null;
  }
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}

// Non-null version for use after null check
export function getTypedClient(client: TypedSupabaseClient | null): client is TypedSupabaseClient {
  return client !== null;
}
