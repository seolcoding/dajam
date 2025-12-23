'use client';

import { useState, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from './useSupabase';
import type { Session, SessionParticipant, AppType, Json } from '@/types/database';

interface UseSessionOptions {
  appType: AppType;
}

interface CreateSessionParams {
  title: string;
  config?: Record<string, unknown>;
  isPublic?: boolean;
  maxParticipants?: number;
  expiresAt?: string;
}

interface JoinSessionParams {
  code: string;
  displayName: string;
}

export function useSession({ appType }: UseSessionOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as SupabaseClient<any, 'public', any>;
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 세션 생성
  const createSession = useCallback(
    async ({ title, config = {}, isPublic = true, maxParticipants, expiresAt }: CreateSessionParams) => {
      setLoading(true);
      setError(null);

      try {
        const { data: userData } = await supabase.auth.getUser();

        const sessionData = {
          app_type: appType,
          title,
          config: config as Json,
          is_public: isPublic,
          max_participants: maxParticipants || null,
          expires_at: expiresAt || null,
          host_id: userData.user?.id || null,
        };

        const { data, error: insertError } = await supabase
          .from('sessions')
          .insert(sessionData)
          .select()
          .single();

        if (insertError) throw insertError;

        setSession(data as Session);
        return { data: data as Session, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : '세션 생성 실패';
        setError(message);
        return { data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [supabase, appType]
  );

  // 세션 참여 (코드로)
  const joinSession = useCallback(
    async ({ code, displayName }: JoinSessionParams) => {
      setLoading(true);
      setError(null);

      try {
        // 세션 찾기
        const { data: sessionData, error: findError } = await supabase
          .from('sessions')
          .select()
          .eq('code', code.toUpperCase())
          .eq('app_type', appType)
          .eq('is_active', true)
          .single();

        if (findError || !sessionData) throw new Error('세션을 찾을 수 없습니다');

        const { data: userData } = await supabase.auth.getUser();

        // 참여자로 추가
        const { error: joinError } = await supabase.from('session_participants').insert({
          session_id: (sessionData as Session).id,
          user_id: userData.user?.id || null,
          display_name: displayName,
          role: 'participant',
        });

        if (joinError) {
          if (joinError.code === '23505') {
            // 이미 참여 중
          } else {
            throw joinError;
          }
        }

        const typedSessionData = sessionData as Session;
        setSession(typedSessionData);
        return { data: typedSessionData, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : '세션 참여 실패';
        setError(message);
        return { data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [supabase, appType]
  );

  // 세션 조회 (ID로)
  const fetchSession = useCallback(
    async (sessionId: string) => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('sessions')
          .select()
          .eq('id', sessionId)
          .single();

        if (fetchError) throw fetchError;

        const typedData = data as Session;
        setSession(typedData);
        return { data: typedData, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : '세션 조회 실패';
        setError(message);
        return { data: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  // 참여자 목록 조회
  const fetchParticipants = useCallback(
    async (sessionId: string) => {
      try {
        const { data, error: fetchError } = await supabase
          .from('session_participants')
          .select()
          .eq('session_id', sessionId)
          .eq('is_banned', false)
          .order('joined_at', { ascending: true });

        if (fetchError) throw fetchError;

        const typedData = (data || []) as SessionParticipant[];
        setParticipants(typedData);
        return { data: typedData, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : '참여자 조회 실패';
        return { data: null, error: message };
      }
    },
    [supabase]
  );

  // 세션 종료
  const endSession = useCallback(
    async (sessionId: string) => {
      try {
        const { error: updateError } = await supabase
          .from('sessions')
          .update({ is_active: false } as Record<string, unknown>)
          .eq('id', sessionId);

        if (updateError) throw updateError;

        setSession((prev) => (prev ? { ...prev, is_active: false } : null));
        return { error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : '세션 종료 실패';
        return { error: message };
      }
    },
    [supabase]
  );

  return {
    session,
    participants,
    loading,
    error,
    createSession,
    joinSession,
    fetchSession,
    fetchParticipants,
    endSession,
    setSession,
    setParticipants,
  };
}
