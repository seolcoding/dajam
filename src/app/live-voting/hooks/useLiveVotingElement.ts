'use client';

import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useRealtimeSession } from '@/lib/realtime/hooks/useRealtimeSession';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import { useLiveVotingStore, type PollStatus } from '../store/liveVotingStore';
import { calculateResults } from '../utils/pollCalculator';
import type { Poll, Vote, PollResult, PollType } from '../types/poll';
import type { Json, Session, SessionParticipant, SessionElement } from '@/types/database';
import type { PollElementConfig, PollOption } from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface UseLiveVotingElementOptions {
  sessionCode: string;
  enabled?: boolean;
  isHost?: boolean;
}

interface VoteResponseData {
  selection: number | number[];
}

// ============================================
// Helper Functions
// ============================================

/**
 * SessionElement의 PollElementConfig를 Poll 타입으로 변환
 */
function elementToPoll(element: SessionElement, sessionCode: string): Poll {
  const config = element.config as unknown as PollElementConfig;

  return {
    id: sessionCode,
    title: element.title || '투표', // default title if null
    type: config.type as PollType,
    options: config.options.map((opt: PollOption) => opt.text),
    createdAt: new Date(element.created_at),
    allowAnonymous: config.allowAnonymous,
    isCloudMode: true,
  };
}

/**
 * Poll 타입을 PollElementConfig로 변환
 */
function pollToElementConfig(poll: Poll): PollElementConfig {
  return {
    type: poll.type,
    options: poll.options.map((text, index) => ({
      id: `option-${index}`,
      text,
      color: getOptionColor(index),
    })),
    allowAnonymous: poll.allowAnonymous,
    showResultsLive: true,
  };
}

/**
 * Element Aggregates를 PollResult[]로 변환
 */
function aggregatesToResults(
  aggregates: { aggregate_key: string; count: number }[],
  options: string[],
  pollType: PollType
): PollResult[] {
  const totalVotes = aggregates.reduce((sum, a) => sum + a.count, 0);

  // 각 옵션에 대한 결과 계산
  const results: PollResult[] = options.map((option, index) => {
    const aggregate = aggregates.find((a) => a.aggregate_key === String(index));
    const count = aggregate?.count || 0;
    const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

    return {
      option,
      count,
      percentage,
    };
  });

  // 순위 투표인 경우 점수 기반 정렬
  if (pollType === 'ranking') {
    // Borda count 점수 계산은 이미 aggregate에서 처리됨
    const sorted = [...results].sort((a, b) => b.count - a.count);
    sorted.forEach((result, index) => {
      result.rank = index + 1;
      result.score = result.count;
    });
    return sorted;
  }

  return results;
}

/**
 * 옵션 색상 가져오기
 */
function getOptionColor(index: number): string {
  const colors = [
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#22C55E', // green
    '#F97316', // orange
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#6366F1', // indigo
    '#14B8A6', // teal
  ];
  return colors[index % colors.length];
}

// ============================================
// Hook
// ============================================

/**
 * Live Voting Element Hook
 *
 * 새로운 element_responses 시스템을 사용하는 live-voting 훅.
 * 기존 useLiveVoting과 동일한 API를 제공하여 점진적 마이그레이션 지원.
 *
 * @example
 * const {
 *   poll,
 *   votes,
 *   results,
 *   submitVote,
 *   closePoll,
 * } = useLiveVotingElement({
 *   sessionCode: 'ABC123',
 *   isHost: true,
 * });
 */
export function useLiveVotingElement({
  sessionCode,
  enabled = true,
  isHost = false,
}: UseLiveVotingElementOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const store = useLiveVotingStore();
  const elementIdRef = useRef<string | null>(null);

  // ============================================
  // Session Management (기존 방식 유지)
  // ============================================

  const {
    session,
    sessionId,
    participants,
    isLoading: sessionLoading,
    error: sessionError,
    connectionStatus,
    isConnected,
    createSession,
    joinSession,
    closeSession,
    reload,
  } = useRealtimeSession<Record<string, unknown>, never>({
    appType: 'live-voting',
    sessionCode,
    enabled,
    dataTable: 'element_responses', // 새 테이블 사용
    transformConfig: (c) => c as Record<string, unknown>,
    transformData: () => [],
    onConnectionChange: (status) => store.setConnectionStatus(status),
  });

  // ============================================
  // Element Management
  // ============================================

  const {
    elements,
    activeElement,
    createElement,
    updateElement,
    setActiveElement,
    updateElementState,
    isLoading: elementsLoading,
  } = useSessionElements({
    sessionId: sessionId ?? null,
    enabled: enabled && !!sessionId,
  });

  // Poll element 찾기/사용
  const pollElement = useMemo(() => {
    // activeElement가 poll이면 사용
    if (activeElement?.element_type === 'poll') {
      return activeElement;
    }
    // 아니면 첫 번째 poll element 찾기
    return elements.find((e) => e.element_type === 'poll') || null;
  }, [elements, activeElement]);

  // elementId ref 업데이트
  useEffect(() => {
    elementIdRef.current = pollElement?.id || null;
  }, [pollElement?.id]);

  // ============================================
  // Responses & Aggregates
  // ============================================

  const {
    responses,
    myResponse,
    hasResponded,
    submitResponse,
    isLoading: responsesLoading,
  } = useElementResponses<VoteResponseData>({
    sessionId: sessionId ?? null,
    elementId: pollElement?.id ?? null,
    enabled: enabled && !!sessionId && !!pollElement?.id,
  });

  const {
    aggregates,
    totalCount,
    isLoading: aggregatesLoading,
  } = useElementAggregates({
    elementId: pollElement?.id ?? null,
    enabled: enabled && !!sessionId && !!pollElement?.id,
  });

  // ============================================
  // Derived State
  // ============================================

  // Poll 데이터
  const poll = useMemo((): Poll | null => {
    if (!pollElement) return null;
    return elementToPoll(pollElement, sessionCode);
  }, [pollElement, sessionCode]);

  // Poll 상태
  const status = useMemo((): PollStatus => {
    if (!pollElement?.state) return 'active';
    const state = pollElement.state as { status?: PollStatus };
    return state.status || 'active';
  }, [pollElement?.state]);

  // 투표 데이터 (responses → votes 변환)
  const votes = useMemo((): Vote[] => {
    return responses.map((r) => ({
      id: r.id,
      pollId: sessionCode,
      selection: (r.data as unknown as VoteResponseData)?.selection ?? 0,
      timestamp: new Date(r.created_at),
    }));
  }, [responses, sessionCode]);

  // 결과 데이터 (aggregates → results 변환)
  const results = useMemo((): PollResult[] => {
    if (!poll) return [];
    return aggregatesToResults(aggregates, poll.options, poll.type);
  }, [aggregates, poll]);

  // 로딩 상태
  const isLoading = sessionLoading || elementsLoading || responsesLoading || aggregatesLoading;
  const error = sessionError;

  // ============================================
  // Store Sync
  // ============================================

  useEffect(() => {
    if (poll) {
      store.initPoll(poll, { isHost, mode: 'cloud' });
      store.setSessionInfo(sessionId || '', sessionCode);
    }
  }, [poll, sessionId, sessionCode, isHost, store]);

  useEffect(() => {
    store.setStatus(status);
  }, [status, store]);

  useEffect(() => {
    store.setParticipants(participants);
  }, [participants, store]);

  useEffect(() => {
    store.setVotes(votes);
  }, [votes, store]);

  useEffect(() => {
    if (hasResponded && myResponse) {
      const responseData = myResponse.data as unknown as VoteResponseData;
      store.setUserVoted(responseData.selection);
    }
  }, [hasResponded, myResponse, store]);

  useEffect(() => {
    store.setLoading(isLoading);
  }, [isLoading, store]);

  useEffect(() => {
    store.setError(error);
  }, [error, store]);

  // ============================================
  // Actions
  // ============================================

  /**
   * 클라우드 세션 생성 및 Poll Element 자동 생성
   */
  const createCloudSession = useCallback(
    async (pollData: Poll): Promise<string | null> => {
      // 1. 세션 생성
      const code = await createSession({
        appType: 'live-voting',
        title: pollData.title,
        config: {},
        expiresAt: pollData.expiresAt,
        isPublic: true,
      });

      if (!code) return null;

      // 세션 ID 가져오기 (약간의 딜레이 필요)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 2. Poll Element 생성
      const newSessionId = sessionId;
      if (!newSessionId) {
        console.error('[useLiveVotingElement] Session ID not available after creation');
        return code;
      }

      const elementConfig = pollToElementConfig(pollData);
      const element = await createElement({
        session_id: newSessionId,
        element_type: 'poll',
        title: pollData.title,
        config: elementConfig as unknown as Json,
      });

      if (element) {
        // 생성된 element를 active로 설정하고 state 초기화
        await setActiveElement(element.id);
        await updateElementState(element.id, { status: 'active' } as unknown as Json);
        elementIdRef.current = element.id;
      }

      store.initPoll({ ...pollData, id: code, isCloudMode: true }, { isHost: true, mode: 'cloud' });
      return code;
    },
    [createSession, sessionId, createElement, setActiveElement, store]
  );

  /**
   * 투표 제출 (element_responses 사용)
   */
  const submitVote = useCallback(
    async (selection: number | number[]): Promise<boolean> => {
      if (!pollElement?.id) {
        console.error('[useLiveVotingElement] No poll element for voting');
        return false;
      }

      if (hasResponded) {
        console.warn('[useLiveVotingElement] User already voted');
        store.setError('이미 투표하셨습니다.');
        return false;
      }

      if (status !== 'active') {
        store.setError(status === 'closed' ? '투표가 종료되었습니다.' : '결과가 잠겨 있습니다.');
        return false;
      }

      // Note: aggregateKey를 위해서는 DB 트리거 또는 별도 로직이 필요
      // 현재는 response 제출만 처리하고, aggregate는 별도로 관리
      const response = await submitResponse({ selection });

      if (response) {
        store.setUserVoted(selection);
        return true;
      }

      store.setError('투표 전송에 실패했습니다.');
      return false;
    },
    [pollElement?.id, hasResponded, status, poll?.type, submitResponse, store]
  );

  /**
   * 세션 참여
   */
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

  /**
   * 투표 종료
   */
  const closePoll = useCallback(async (): Promise<boolean> => {
    if (!pollElement?.id || !isHost) return false;

    const success = await updateElementState(pollElement.id, { status: 'closed' } as unknown as Json);
    if (success) {
      store.setStatus('closed');
    }
    return success;
  }, [pollElement?.id, isHost, updateElementState, store]);

  /**
   * 결과 잠금
   */
  const lockResults = useCallback(async (): Promise<boolean> => {
    if (!pollElement?.id || !isHost) return false;

    const success = await updateElementState(pollElement.id, { status: 'results_locked' } as unknown as Json);
    if (success) {
      store.setStatus('results_locked');
    }
    return success;
  }, [pollElement?.id, isHost, updateElementState, store]);

  /**
   * 투표 재개
   */
  const reopenPoll = useCallback(async (): Promise<boolean> => {
    if (!pollElement?.id || !isHost) return false;

    const success = await updateElementState(pollElement.id, { status: 'active' } as unknown as Json);
    if (success) {
      store.setStatus('active');
    }
    return success;
  }, [pollElement?.id, isHost, updateElementState, store]);

  /**
   * 세션 종료
   */
  const endSession = useCallback(async (): Promise<boolean> => {
    if (!isHost) return false;

    const success = await closeSession();
    if (success) {
      store.reset();
    }
    return success;
  }, [isHost, closeSession, store]);

  // ============================================
  // Return
  // ============================================

  return {
    // 세션 정보
    session,
    sessionId,
    sessionCode: session?.code || sessionCode,
    config: pollElement?.config || null,

    // Element 정보
    pollElement,
    elements,

    // 데이터
    poll: store.poll || poll,
    votes: store.votes.length > 0 ? store.votes : votes,
    results: store.results.length > 0 ? store.results : results,
    participants: store.participants,
    totalVotes: totalCount,

    // 상태
    status: store.status,
    isLoading,
    error: store.error || error,
    connectionStatus,
    isConnected,
    hasVoted: hasResponded || store.hasVoted,
    isHost: store.isHost || isHost,
    mode: 'cloud' as const,

    // 액션
    createCloudSession,
    submitVote,
    joinAsParticipant,
    reload,

    // 호스트 액션
    closePoll,
    lockResults,
    reopenPoll,
    endSession,
  };
}

export default useLiveVotingElement;
