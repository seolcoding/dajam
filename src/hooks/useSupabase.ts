'use client';

import { useMemo } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export { isSupabaseConfigured };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSupabase(): any {
  const supabase = useMemo(() => createClient(), []);
  return supabase;
}
