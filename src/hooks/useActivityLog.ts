'use client';

import { useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from './useSupabase';
import type { AppType } from '@/types/database';

type ActionType =
  | 'calculate'
  | 'save'
  | 'share'
  | 'export'
  | 'complete'
  | 'vote'
  | 'join'
  | 'create'
  | 'view';

interface LogActivityParams {
  appType: AppType;
  actionType: ActionType;
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export function useActivityLog() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as SupabaseClient<any, 'public', any>;

  const logActivity = useCallback(
    async ({ appType, actionType, metadata = {}, sessionId }: LogActivityParams) => {
      try {
        const { data: userData } = await supabase.auth.getUser();

        // 비로그인 사용자는 기록하지 않음
        if (!userData.user) return { error: null };

        const { error } = await supabase.from('activity_logs').insert({
          user_id: userData.user.id,
          app_type: appType,
          action_type: actionType,
          session_id: sessionId || null,
          metadata,
        } as Record<string, unknown>);

        if (error) throw error;

        return { error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : '활동 기록 실패';
        console.error('Activity log error:', message);
        return { error: message };
      }
    },
    [supabase]
  );

  return { logActivity };
}
