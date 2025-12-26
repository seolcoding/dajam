'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { ElementResponse, ElementResponseInsert, Json } from '@/types/database';
import type { ConnectionStatus } from '../types';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type { ResponseType, CreateResponseInput } from '@/lib/elements/types';

// ============================================
// Types
// ============================================

export interface UseElementResponsesOptions<TData = Json> {
  elementId: string | null;
  sessionId: string | null;
  enabled?: boolean;
  responseType?: ResponseType;
  /** 현재 참여자 ID (중복 체크용) */
  participantId?: string | null;
  /** 현재 사용자 ID (중복 체크용) */
  userId?: string | null;
  /** 익명 ID (비로그인 사용자용) */
  anonymousId?: string | null;
  /** 응답 데이터 변환 함수 */
  transformResponse?: (data: Json) => TData;
  /** 새 응답 수신 시 콜백 */
  onNewResponse?: (response: ElementResponse) => void;
}

export interface UseElementResponsesReturn<TData = Json> {
  // State
  responses: ElementResponse[];
  myResponse: ElementResponse | null;
  hasResponded: boolean;
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;

  // Actions
  submitResponse: (
    data: TData,
    options?: {
      displayName?: string;
      score?: number;
      isCorrect?: boolean;
    }
  ) => Promise<ElementResponse | null>;
  updateResponse: (id: string, data: TData) => Promise<boolean>;
  deleteResponse: (id: string) => Promise<boolean>;

  // Utilities
  reload: () => Promise<void>;
  getResponsesByParticipant: (participantId: string) => ElementResponse[];
  getTotalCount: () => number;
}

// ============================================
// Hook Implementation
// ============================================

/**
 * Element Responses 관리 훅
 *
 * element_responses 테이블의 CRUD 및 실시간 동기화를 처리합니다.
 * 중복 응답 방지 및 참여자별 응답 추적 기능을 포함합니다.
 *
 * @example
 * const {
 *   responses,
 *   hasResponded,
 *   submitResponse,
 * } = useElementResponses<PollResponseData>({
 *   elementId,
 *   sessionId,
 *   participantId,
 *   responseType: 'vote',
 * });
 *
 * // 응답 제출
 * if (!hasResponded) {
 *   await submitResponse({ selectedOption: 'option1' });
 * }
 */
export function useElementResponses<TData = Json>({
  elementId,
  sessionId,
  enabled = true,
  responseType = 'vote',
  participantId,
  userId,
  anonymousId,
  transformResponse,
  onNewResponse,
}: UseElementResponsesOptions<TData>): UseElementResponsesReturn<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;

  const [responses, setResponses] = useState<ElementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable refs for callbacks
  const transformResponseRef = useRef(transformResponse);
  const onNewResponseRef = useRef(onNewResponse);
  const elementIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Update refs
  useEffect(() => {
    transformResponseRef.current = transformResponse;
    onNewResponseRef.current = onNewResponse;
    elementIdRef.current = elementId;
    sessionIdRef.current = sessionId;
  });

  // ============================================
  // Derived State
  // ============================================

  const myResponse = useMemo(() => {
    if (!responses.length) return null;

    // 우선순위: participantId > userId > anonymousId
    return responses.find((r) => {
      if (participantId && r.participant_id === participantId) return true;
      if (userId && r.user_id === userId) return true;
      if (anonymousId && r.anonymous_id === anonymousId) return true;
      return false;
    }) || null;
  }, [responses, participantId, userId, anonymousId]);

  const hasResponded = myResponse !== null;

  // ============================================
  // Load Responses
  // ============================================

  const loadResponses = useCallback(async () => {
    const currentElementId = elementIdRef.current;
    if (!currentElementId || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('element_responses')
        .select('*')
        .eq('element_id', currentElementId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setResponses((data || []) as ElementResponse[]);
    } catch (err) {
      console.error('[useElementResponses] Load failed:', err);
      setError(err instanceof Error ? err.message : '응답을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, supabase]);

  // ============================================
  // Realtime Subscription
  // ============================================

  const { connectionStatus, isConnected } = useRealtimeSubscription({
    sessionId,
    channelName: `responses:${elementId}`,
    enabled: enabled && !!elementId && !!sessionId,
    subscriptions: [
      {
        tableName: 'element_responses',
        event: '*',
        filter: `element_id=eq.${elementId}`,
      },
    ],
    onData: (_tableName, payload) => {
      console.log('[useElementResponses] Realtime event:', payload);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventPayload = payload as any;

      if (eventPayload.eventType === 'INSERT' && eventPayload.new) {
        const newResponse = eventPayload.new as ElementResponse;

        // 중복 체크 후 추가
        setResponses((prev) => {
          if (prev.some((r) => r.id === newResponse.id)) {
            return prev;
          }
          return [...prev, newResponse];
        });

        onNewResponseRef.current?.(newResponse);
      } else if (eventPayload.eventType === 'UPDATE' && eventPayload.new) {
        const updatedResponse = eventPayload.new as ElementResponse;
        setResponses((prev) =>
          prev.map((r) => (r.id === updatedResponse.id ? updatedResponse : r))
        );
      } else if (eventPayload.eventType === 'DELETE' && eventPayload.old) {
        const deletedId = eventPayload.old.id;
        setResponses((prev) => prev.filter((r) => r.id !== deletedId));
      } else {
        // Fallback: reload all
        loadResponses();
      }
    },
  });

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    if (enabled && elementId) {
      loadResponses();
    } else if (!elementId || !enabled) {
      setResponses([]);
      setIsLoading(false);
    }
  }, [elementId, enabled, loadResponses]);

  // ============================================
  // Actions
  // ============================================

  const submitResponse = useCallback(
    async (
      data: TData,
      options?: {
        displayName?: string;
        score?: number;
        isCorrect?: boolean;
      }
    ): Promise<ElementResponse | null> => {
      const currentElementId = elementIdRef.current;
      const currentSessionId = sessionIdRef.current;

      if (!currentElementId || !currentSessionId) {
        console.error('[useElementResponses] Cannot submit: missing elementId or sessionId');
        return null;
      }

      // 중복 응답 체크 (클라이언트 측)
      if (hasResponded) {
        console.warn('[useElementResponses] Already responded');
        setError('이미 응답하셨습니다.');
        return null;
      }

      try {
        const insertData: ElementResponseInsert = {
          element_id: currentElementId,
          session_id: currentSessionId,
          response_type: responseType,
          data: data as Json,
          participant_id: participantId || null,
          user_id: userId || null,
          anonymous_id: anonymousId || null,
          display_name: options?.displayName || null,
          score: options?.score ?? null,
          is_correct: options?.isCorrect ?? null,
        };

        const { data: responseData, error: insertError } = await supabase
          .from('element_responses')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          // 중복 응답 에러 (unique constraint)
          if (insertError.code === '23505') {
            setError('이미 응답하셨습니다.');
            return null;
          }
          throw insertError;
        }

        const newResponse = responseData as ElementResponse;

        // 로컬 상태 업데이트 (optimistic)
        setResponses((prev) => [...prev, newResponse]);

        return newResponse;
      } catch (err) {
        console.error('[useElementResponses] Submit failed:', err);
        setError(err instanceof Error ? err.message : '응답 제출에 실패했습니다.');
        return null;
      }
    },
    [hasResponded, responseType, participantId, userId, anonymousId, supabase]
  );

  const updateResponse = useCallback(
    async (id: string, data: TData): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('element_responses')
          .update({
            data: data as Json,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (updateError) throw updateError;

        // 로컬 상태 업데이트
        setResponses((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, data: data as Json, updated_at: new Date().toISOString() }
              : r
          )
        );

        return true;
      } catch (err) {
        console.error('[useElementResponses] Update failed:', err);
        setError(err instanceof Error ? err.message : '응답 수정에 실패했습니다.');
        return false;
      }
    },
    [supabase]
  );

  const deleteResponse = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from('element_responses')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        // 로컬 상태 업데이트
        setResponses((prev) => prev.filter((r) => r.id !== id));

        return true;
      } catch (err) {
        console.error('[useElementResponses] Delete failed:', err);
        setError(err instanceof Error ? err.message : '응답 삭제에 실패했습니다.');
        return false;
      }
    },
    [supabase]
  );

  // ============================================
  // Utilities
  // ============================================

  const getResponsesByParticipant = useCallback(
    (targetParticipantId: string): ElementResponse[] => {
      return responses.filter((r) => r.participant_id === targetParticipantId);
    },
    [responses]
  );

  const getTotalCount = useCallback(() => responses.length, [responses]);

  // ============================================
  // Return
  // ============================================

  return {
    // State
    responses,
    myResponse,
    hasResponded,
    isLoading,
    error,
    connectionStatus,
    isConnected,

    // Actions
    submitResponse,
    updateResponse,
    deleteResponse,

    // Utilities
    reload: loadResponses,
    getResponsesByParticipant,
    getTotalCount,
  };
}
