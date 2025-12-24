'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Supabase 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Type alias for the Supabase client
export type TypedSupabaseClient = SupabaseClient<Database>;

// Singleton client instance for browser
let browserClient: SupabaseClient<Database> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): any {
  if (!isSupabaseConfigured) {
    return null;
  }

  // Return existing singleton if available
  if (browserClient) {
    return browserClient;
  }

  // Create client with default localStorage persistence
  browserClient = createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      storageKey: 'supabase-auth',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });

  return browserClient;
}

// Non-null version for use after null check
export function getTypedClient(client: TypedSupabaseClient | null): client is TypedSupabaseClient {
  return client !== null;
}
