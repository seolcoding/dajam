'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';
import type { Poll, Vote, PollResult } from '../types/poll';
import { calculateResults } from '../utils/pollCalculator';

// Supabase 테이블 타입 (실제 사용 시 supabase gen types로 생성 권장)
interface SessionRow {
  id: string;
  code: string;
  app_type: string;
  title: string;
  host_id: string | null;
  config: Record<string, unknown>;
  is_active: boolean;
  is_public: boolean;
  max_participants: number | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface VoteRow {
  id: string;
  session_id: string;
  participant_id: string | null;
  user_id: string | null;
  selection: Record<string, unknown>;
  created_at: string;
}

interface UseSupabasePollOptions {
  pollId: string;
  enabled?: boolean; // Cloud mode enabled
}

interface SupabasePollState {
  poll: Poll | null;
  votes: Vote[];
  results: PollResult[];
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
}

/**
 * Supabase를 사용한 실시간 투표 훅
 * - 크로스 디바이스 투표 지원
 * - Supabase Realtime으로 실시간 업데이트
 */
export function useSupabasePoll({ pollId, enabled = true }: UseSupabasePollOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as SupabaseClient<any, 'public', any>;
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [state, setState] = useState<SupabasePollState>({
    poll: null,
    votes: [],
    results: [],
    isLoading: true,
    error: null,
    sessionId: null,
  });

  // 세션(poll) 로드
  const loadSession = useCallback(async () => {
    if (!enabled) return;

    try {
      // sessions 테이블에서 code로 검색 (pollId = code)
      const { data, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', pollId.toUpperCase())
        .eq('app_type', 'live-voting')
        .single();

      if (sessionError || !data) {
        // 세션이 없으면 로컬 모드로 폴백
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Cloud 세션을 찾을 수 없습니다. 로컬 모드로 동작합니다.'
        }));
        return;
      }

      const session = data as SessionRow;

      // config에서 poll 정보 추출
      const config = session.config as {
        type: 'single' | 'multiple' | 'ranking';
        options: string[];
        allowAnonymous: boolean;
      };

      const poll: Poll = {
        id: session.code,
        title: session.title,
        type: config.type,
        options: config.options,
        createdAt: new Date(session.created_at),
        expiresAt: session.expires_at ? new Date(session.expires_at) : undefined,
        allowAnonymous: config.allowAnonymous ?? true,
        isCloudMode: true,
      };

      setState(prev => ({
        ...prev,
        poll,
        sessionId: session.id,
        isLoading: false,
      }));

      // 투표 데이터 로드
      await loadVotes(session.id);
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      }));
    }
  }, [pollId, enabled, supabase]);

  // 투표 데이터 로드
  const loadVotes = useCallback(async (sessionId: string) => {
    const { data, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (votesError) {
      console.error('Failed to load votes:', votesError);
      return;
    }

    const votesData = (data || []) as VoteRow[];
    const votes: Vote[] = votesData.map(v => ({
      id: v.id,
      pollId: pollId,
      selection: (v.selection as { value: number | number[] }).value,
      timestamp: new Date(v.created_at),
    }));

    setState(prev => {
      const results = prev.poll ? calculateResults(prev.poll, votes) : [];
      return { ...prev, votes, results };
    });
  }, [pollId, supabase]);

  // Supabase에 투표 생성
  const createCloudPoll = useCallback(async (poll: Poll): Promise<string | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          code: poll.id.toUpperCase(),
          app_type: 'live-voting',
          title: poll.title,
          host_id: userData.user?.id || null,
          config: {
            type: poll.type,
            options: poll.options,
            allowAnonymous: poll.allowAnonymous,
          },
          is_active: true,
          is_public: true,
          expires_at: poll.expiresAt?.toISOString() || null,
        })
        .select()
        .single();

      if (error || !data) throw error || new Error('Failed to create session');

      const session = data as SessionRow;

      setState(prev => ({
        ...prev,
        poll: { ...poll, isCloudMode: true },
        sessionId: session.id,
      }));

      return session.id;
    } catch (err) {
      console.error('Failed to create cloud poll:', err);
      return null;
    }
  }, [supabase]);

  // Supabase에 투표 제출
  const submitVote = useCallback(async (vote: Vote): Promise<boolean> => {
    if (!state.sessionId) {
      console.error('No session ID for cloud voting');
      return false;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from('votes').insert({
        session_id: state.sessionId,
        user_id: userData.user?.id || null,
        selection: { value: vote.selection },
      } as Record<string, unknown>);

      if (error) throw error;

      return true;
    } catch (err) {
      console.error('Failed to submit vote:', err);
      return false;
    }
  }, [state.sessionId, supabase]);

  // Realtime 구독 설정
  useEffect(() => {
    if (!enabled || !state.sessionId) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    const setupChannel = () => {
      const channel = supabase
        .channel(`poll:${state.sessionId}`, {
          config: {
            broadcast: { self: true },
            presence: { key: state.sessionId ?? undefined },
          },
        })
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'votes',
            filter: `session_id=eq.${state.sessionId}`,
          },
          (payload) => {
            console.log('[Realtime] New vote received:', payload);
            // 새 투표가 들어오면 전체 투표 데이터 다시 로드
            loadVotes(state.sessionId!);
          }
        )
        .subscribe((status, err) => {
          console.log('[Realtime] Subscription status:', status, err || '');

          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Successfully subscribed to poll:', state.sessionId);
            retryCount = 0; // Reset retry count on success
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[Realtime] Channel error:', err);
            // Retry on error
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`[Realtime] Retrying subscription (${retryCount}/${maxRetries})...`);
              setTimeout(() => {
                channel.unsubscribe();
                setupChannel();
              }, retryDelay * retryCount);
            }
          } else if (status === 'TIMED_OUT') {
            console.error('[Realtime] Subscription timed out');
            // Retry on timeout
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`[Realtime] Retrying after timeout (${retryCount}/${maxRetries})...`);
              setTimeout(() => {
                channel.unsubscribe();
                setupChannel();
              }, retryDelay * retryCount);
            }
          } else if (status === 'CLOSED') {
            console.log('[Realtime] Channel closed');
          }
        });

      channelRef.current = channel;
      return channel;
    };

    const channel = setupChannel();

    return () => {
      console.log('[Realtime] Cleaning up subscription for poll:', state.sessionId);
      channel.unsubscribe();
    };
  }, [enabled, state.sessionId, supabase, loadVotes]);

  // 초기 로드
  useEffect(() => {
    if (enabled) {
      loadSession();
    }
  }, [loadSession, enabled]);

  return {
    ...state,
    createCloudPoll,
    submitVote,
    reload: loadSession,
  };
}
