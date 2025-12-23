'use client';

import { useMemo } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export { isSupabaseConfigured };

export function useSupabase() {
  const supabase = useMemo(() => createClient(), []);
  return supabase;
}
