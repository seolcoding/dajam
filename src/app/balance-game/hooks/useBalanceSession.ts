'use client';

/**
 * 밸런스 게임 세션 기반 멀티플레이어 훅
 * - 호스트가 세션 생성 → 참여자들이 QR/코드로 참여
 * - 실시간으로 참여자들의 진행상황 확인
 * - 완료 후 답변 비교
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';
import type { Question } from '../types';

// 세션 설정
export interface BalanceSessionConfig {
  categoryId: string;
  questionIds: string[];
  hostName: string;
}

// 참여자 상태
export interface ParticipantState {
  id: string;
  name: string;
  currentQuestionIndex: number;
  answers: Record<string, 'A' | 'B'>; // questionId -> choice
  completedAt: string | null;
  joinedAt: string;
}

// 세션 상태
export interface BalanceSession {
  id: string;
  code: string;
  hostName: string;
  categoryId: string;
  questionIds: string[];
  participants: ParticipantState[];
  isActive: boolean;
  createdAt: string;
}

interface UseBalanceSessionOptions {
  sessionCode?: string;
  isHost?: boolean;
}

// Supabase row types
interface SessionRow {
  id: string;
  code: string;
  app_type: string;
  title: string;
  config: BalanceSessionConfig & { questionIds: string[] };
  is_active: boolean;
  created_at: string;
}

interface ParticipantRow {
  id: string;
  session_id: string;
  display_name: string;
  metadata: {
    answers?: Record<string, 'A' | 'B'>;
    current_index?: number;
    completed_at?: string | null;
  };
  joined_at: string;
}

export function useBalanceSession({ sessionCode, isHost = false }: UseBalanceSessionOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as SupabaseClient<any, 'public', any>;
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [session, setSession] = useState<BalanceSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myParticipant, setMyParticipant] = useState<ParticipantState | null>(null);

  // 세션 로드
  const loadSession = useCallback(async () => {
    if (!sessionCode) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', sessionCode.toUpperCase())
        .eq('app_type', 'balance-game')
        .eq('is_active', true)
        .single();

      if (sessionError || !data) {
        setError('세션을 찾을 수 없습니다.');
        setIsLoading(false);
        return;
      }

      const sessionRow = data as SessionRow;

      // 참여자 목록 로드
      const { data: participantsData } = await supabase
        .from('session_participants')
        .select('*')
        .eq('session_id', sessionRow.id)
        .order('joined_at', { ascending: true });

      const participants: ParticipantState[] = (participantsData as ParticipantRow[] || []).map(p => ({
        id: p.id,
        name: p.display_name,
        currentQuestionIndex: p.metadata?.current_index || 0,
        answers: p.metadata?.answers || {},
        completedAt: p.metadata?.completed_at || null,
        joinedAt: p.joined_at,
      }));

      setSession({
        id: sessionRow.id,
        code: sessionRow.code,
        hostName: sessionRow.title,
        categoryId: sessionRow.config.categoryId,
        questionIds: sessionRow.config.questionIds,
        participants,
        isActive: sessionRow.is_active,
        createdAt: sessionRow.created_at,
      });

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setIsLoading(false);
    }
  }, [sessionCode, supabase]);

  // 실시간 구독
  useEffect(() => {
    if (!session?.id || !isHost) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000;

    const setupChannel = () => {
      const channel = supabase
        .channel(`balance-session-${session.id}`, {
          config: {
            broadcast: { self: true },
            presence: { key: session.id },
          },
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'session_participants',
            filter: `session_id=eq.${session.id}`,
          },
          (payload) => {
            console.log('[Realtime] balance-game participant update:', payload);
            loadSession();
          }
        )
        .subscribe((status, err) => {
          console.log('[Realtime] balance-game subscription status:', status, err || '');

          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Successfully subscribed to balance-game:', session.id);
            retryCount = 0;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('[Realtime] balance-game channel error/timeout:', err);
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`[Realtime] Retrying subscription (${retryCount}/${maxRetries})...`);
              setTimeout(() => {
                channel.unsubscribe();
                setupChannel();
              }, retryDelay * retryCount);
            }
          }
        });

      channelRef.current = channel;
      return channel;
    };

    const channel = setupChannel();

    return () => {
      console.log('[Realtime] Cleaning up balance-game subscription:', session.id);
      channel.unsubscribe();
    };
  }, [session?.id, isHost, supabase, loadSession]);

  // 초기 로드
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // 세션 생성
  const createSession = useCallback(async (config: BalanceSessionConfig): Promise<string | null> => {
    try {
      const code = generateCode();

      const { data, error: insertError } = await supabase
        .from('sessions')
        .insert({
          code,
          app_type: 'balance-game',
          title: config.hostName,
          config: {
            categoryId: config.categoryId,
            questionIds: config.questionIds,
            hostName: config.hostName,
          },
          is_active: true,
          is_public: true,
        })
        .select()
        .single();

      if (insertError || !data) {
        throw new Error('세션 생성 실패');
      }

      return code;
    } catch (err) {
      setError(err instanceof Error ? err.message : '세션 생성 실패');
      return null;
    }
  }, [supabase]);

  // 참여자 등록
  const joinSession = useCallback(async (name: string): Promise<ParticipantState | null> => {
    if (!session) return null;

    try {
      const { data, error: insertError } = await supabase
        .from('session_participants')
        .insert({
          session_id: session.id,
          display_name: name,
          role: 'participant',
          metadata: {
            answers: {},
            current_index: 0,
            completed_at: null,
          },
        })
        .select()
        .single();

      if (insertError || !data) {
        throw new Error('참여 실패');
      }

      const participant: ParticipantState = {
        id: data.id,
        name: data.display_name,
        currentQuestionIndex: 0,
        answers: {},
        completedAt: null,
        joinedAt: data.joined_at,
      };

      setMyParticipant(participant);
      return participant;
    } catch (err) {
      setError(err instanceof Error ? err.message : '참여 실패');
      return null;
    }
  }, [session, supabase]);

  // 답변 제출
  const submitAnswer = useCallback(async (
    questionId: string,
    choice: 'A' | 'B',
    nextIndex: number,
    isComplete: boolean
  ): Promise<boolean> => {
    if (!myParticipant) return false;

    try {
      const newAnswers = { ...myParticipant.answers, [questionId]: choice };
      const completedAt = isComplete ? new Date().toISOString() : null;

      const { error: updateError } = await supabase
        .from('session_participants')
        .update({
          metadata: {
            answers: newAnswers,
            current_index: nextIndex,
            completed_at: completedAt,
          },
        })
        .eq('id', myParticipant.id);

      if (updateError) throw updateError;

      setMyParticipant(prev => prev ? {
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: nextIndex,
        completedAt,
      } : null);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '답변 제출 실패');
      return false;
    }
  }, [myParticipant, supabase]);

  // 세션 종료
  const closeSession = useCallback(async (): Promise<boolean> => {
    if (!session) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', session.id);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '세션 종료 실패');
      return false;
    }
  }, [session, supabase]);

  return {
    session,
    isLoading,
    error,
    myParticipant,
    createSession,
    joinSession,
    submitAnswer,
    closeSession,
    reload: loadSession,
  };
}

// 유틸리티
function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
