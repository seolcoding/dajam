'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useRealtimeSession } from '@/lib/realtime/hooks/useRealtimeSession';
import { useLiveVotingStore, type PollStatus } from '../store/liveVotingStore';
import type { Poll, Vote, PollType } from '../types/poll';
import type { Json, Session, SessionParticipant } from '@/types/database';

interface PollConfig {
  type: PollType;
  options: string[];
  allowAnonymous: boolean;
  status?: PollStatus;
}

interface VoteRow {
  id: string;
  session_id: string;
  participant_id: string | null;
  user_id: string | null;
  selection: { value: number | number[] };
  created_at: string;
}

interface UseLiveVotingOptions {
  sessionCode: string;
  enabled?: boolean;
  isHost?: boolean;
}

/**
 * Live Voting 전용 훅
 * - useRealtimeSession을 래핑하여 live-voting에 특화된 기능 제공
 * - Zustand 스토어와 자동 동기화
 * - 투표 제출, 중복 방지, 호스트 액션 지원
 */
export function useLiveVoting({ sessionCode, enabled = true, isHost = false }: UseLiveVotingOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const store = useLiveVotingStore();

  // Config 변환: Supabase config JSON → PollConfig
  const transformConfig = useCallback((config: Json): PollConfig => {
    const c = config as Record<string, unknown>;
    return {
      type: (c.type as PollType) || 'single',
      options: (c.options as string[]) || [],
      allowAnonymous: (c.allowAnonymous as boolean) ?? true,
      status: (c.status as PollStatus) || 'active',
    };
  }, []);

  // 투표 데이터 변환: VoteRow[] → Vote[]
  const transformData = useCallback(
    (rows: unknown[]): Vote[] => {
      return (rows as VoteRow[]).map((v) => ({
        id: v.id,
        pollId: sessionCode,
        selection: v.selection?.value ?? v.selection,
        timestamp: new Date(v.created_at),
      }));
    },
    [sessionCode]
  );

  // 세션 로드 시 스토어 업데이트
  const onSessionLoaded = useCallback(
    (session: Session) => {
      const config = transformConfig(session.config);

      const poll: Poll = {
        id: session.code,
        title: session.title,
        type: config.type,
        options: config.options,
        createdAt: new Date(session.created_at),
        expiresAt: session.expires_at ? new Date(session.expires_at) : undefined,
        allowAnonymous: config.allowAnonymous,
        isCloudMode: true,
      };

      store.initPoll(poll, { isHost, mode: 'cloud' });
      store.setSessionInfo(session.id, session.code);
      store.setStatus(config.status || 'active');
      store.setConnectionStatus('connected');
    },
    [transformConfig, store, isHost]
  );

  // 데이터 수신 시 스토어 업데이트
  const onDataReceived = useCallback(
    (votes: Vote[]) => {
      store.setVotes(votes);
    },
    [store]
  );

  // 연결 상태 변경 시 스토어 업데이트
  const onConnectionChange = useCallback(
    (status: 'connecting' | 'connected' | 'disconnected' | 'error') => {
      store.setConnectionStatus(status);
    },
    [store]
  );

  // useRealtimeSession 사용
  const {
    session,
    sessionId,
    config,
    participants,
    data: votes,
    isLoading,
    error,
    connectionStatus,
    isConnected,
    createSession,
    joinSession,
    closeSession,
    reload,
    loadData,
  } = useRealtimeSession<PollConfig, Vote>({
    appType: 'live-voting',
    sessionCode,
    enabled,
    dataTable: 'votes',
    dataEvent: 'INSERT',
    transformConfig,
    transformData,
    onSessionLoaded,
    onDataReceived,
    onConnectionChange,
  });

  // 스토어 동기화: 참여자
  useEffect(() => {
    store.setParticipants(participants);
  }, [participants, store]);

  // 스토어 동기화: 투표 데이터
  useEffect(() => {
    if (votes.length > 0) {
      store.setVotes(votes);
    }
  }, [votes, store]);

  // 스토어 동기화: 로딩/에러 상태
  useEffect(() => {
    store.setLoading(isLoading);
  }, [isLoading, store]);

  useEffect(() => {
    store.setError(error);
  }, [error, store]);

  // Cloud 세션 생성
  const createCloudSession = useCallback(
    async (poll: Poll): Promise<string | null> => {
      const code = await createSession({
        appType: 'live-voting',
        title: poll.title,
        config: {
          type: poll.type,
          options: poll.options,
          allowAnonymous: poll.allowAnonymous,
          status: 'active',
        },
        expiresAt: poll.expiresAt,
        isPublic: true,
      });

      if (code) {
        store.initPoll({ ...poll, id: code, isCloudMode: true }, { isHost: true, mode: 'cloud' });
      }

      return code;
    },
    [createSession, store]
  );

  // 투표 제출
  const submitVote = useCallback(
    async (selection: number | number[]): Promise<boolean> => {
      if (!sessionId) {
        console.error('[useLiveVoting] No session ID for voting');
        return false;
      }

      // 이미 투표했는지 확인
      if (store.hasVoted) {
        console.warn('[useLiveVoting] User already voted');
        return false;
      }

      try {
        const { data: userData } = await supabase.auth.getUser();

        const { error: voteError } = await supabase.from('votes').insert({
          session_id: sessionId,
          user_id: userData.user?.id || null,
          selection: { value: selection },
        });

        if (voteError) {
          // 중복 투표 에러 체크
          if (voteError.code === '23505') {
            // unique_violation
            store.setError('이미 투표하셨습니다.');
            return false;
          }
          throw voteError;
        }

        // 스토어에 투표 상태 저장
        store.setUserVoted(selection);
        return true;
      } catch (err) {
        console.error('[useLiveVoting] Vote submission failed:', err);
        store.setError(err instanceof Error ? err.message : '투표 실패');
        return false;
      }
    },
    [sessionId, supabase, store]
  );

  // 세션 참여 (익명 참여자 등록)
  const joinAsParticipant = useCallback(
    async (displayName: string): Promise<SessionParticipant | null> => {
      const participant = await joinSession({ displayName });

      if (participant) {
        store.setParticipantId(participant.id);
        store.addParticipant(participant);
      }

      return participant;
    },
    [joinSession, store]
  );

  // 호스트 액션: 투표 종료
  const closePoll = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !isHost) return false;

    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          config: {
            ...config,
            status: 'closed',
          },
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      store.setStatus('closed');
      return true;
    } catch (err) {
      console.error('[useLiveVoting] Failed to close poll:', err);
      return false;
    }
  }, [sessionId, isHost, config, supabase, store]);

  // 호스트 액션: 결과 잠금
  const lockResults = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !isHost) return false;

    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          config: {
            ...config,
            status: 'results_locked',
          },
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      store.setStatus('results_locked');
      return true;
    } catch (err) {
      console.error('[useLiveVoting] Failed to lock results:', err);
      return false;
    }
  }, [sessionId, isHost, config, supabase, store]);

  // 호스트 액션: 투표 재개
  const reopenPoll = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !isHost) return false;

    try {
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          config: {
            ...config,
            status: 'active',
          },
        })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      store.setStatus('active');
      return true;
    } catch (err) {
      console.error('[useLiveVoting] Failed to reopen poll:', err);
      return false;
    }
  }, [sessionId, isHost, config, supabase, store]);

  // 호스트 액션: 세션 종료
  const endSession = useCallback(async (): Promise<boolean> => {
    if (!isHost) return false;

    const success = await closeSession();
    if (success) {
      store.reset();
    }
    return success;
  }, [isHost, closeSession, store]);

  return {
    // 세션 정보
    session,
    sessionId,
    sessionCode: session?.code || sessionCode,
    config,

    // 데이터
    poll: store.poll,
    votes: store.votes,
    results: store.results,
    participants: store.participants,

    // 상태
    status: store.status,
    isLoading,
    error: store.error,
    connectionStatus,
    isConnected,
    hasVoted: store.hasVoted,
    isHost: store.isHost,
    mode: store.mode,

    // 액션
    createCloudSession,
    submitVote,
    joinAsParticipant,
    reload,
    loadData,

    // 호스트 액션
    closePoll,
    lockResults,
    reopenPoll,
    endSession,
  };
}
