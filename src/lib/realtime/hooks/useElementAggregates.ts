'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { ElementAggregate, Json } from '@/types/database';
import type { ConnectionStatus } from '../types';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { aggregatesToMap, getTotalFromAggregates, getPercentages } from '@/lib/elements/types';

// ============================================
// Types
// ============================================

export interface UseElementAggregatesOptions {
  elementId: string | null;
  enabled?: boolean;
  /** 실시간 업데이트 활성화 여부 */
  realtime?: boolean;
}

export interface UseElementAggregatesReturn {
  // State
  aggregates: ElementAggregate[];
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;

  // Derived Data
  /** 총 응답 수 */
  totalCount: number;
  /** key -> count 맵 */
  countMap: Record<string, number>;
  /** key -> percentage 맵 */
  percentageMap: Record<string, number>;

  // Helpers
  getCountByKey: (key: string) => number;
  getPercentageByKey: (key: string) => number;
  getSortedByCount: (ascending?: boolean) => ElementAggregate[];
  getTopN: (n: number) => ElementAggregate[];

  // Actions
  reload: () => Promise<void>;
}

// ============================================
// Hook Implementation
// ============================================

/**
 * Element Aggregates 관리 훅
 *
 * element_aggregates 테이블의 실시간 집계 데이터를 구독합니다.
 * 데이터베이스 트리거에 의해 자동 업데이트되므로 별도의 CRUD는 제공하지 않습니다.
 *
 * @example
 * const {
 *   aggregates,
 *   totalCount,
 *   getPercentageByKey,
 *   getSortedByCount,
 * } = useElementAggregates({ elementId });
 *
 * // 결과 표시
 * <div>총 {totalCount}명 참여</div>
 * {getSortedByCount().map(agg => (
 *   <div key={agg.aggregate_key}>
 *     {agg.aggregate_key}: {agg.count}표 ({getPercentageByKey(agg.aggregate_key).toFixed(1)}%)
 *   </div>
 * ))}
 */
export function useElementAggregates({
  elementId,
  enabled = true,
  realtime = true,
}: UseElementAggregatesOptions): UseElementAggregatesReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;

  const [aggregates, setAggregates] = useState<ElementAggregate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for elementId to avoid stale closures
  const elementIdRef = useRef<string | null>(null);

  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // ============================================
  // Load Aggregates
  // ============================================

  const loadAggregates = useCallback(async () => {
    const currentElementId = elementIdRef.current;
    if (!currentElementId || !enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('element_aggregates')
        .select('*')
        .eq('element_id', currentElementId)
        .order('count', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setAggregates((data || []) as ElementAggregate[]);
    } catch (err) {
      console.error('[useElementAggregates] Load failed:', err);
      setError(err instanceof Error ? err.message : '집계 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, supabase]);

  // ============================================
  // Realtime Subscription
  // ============================================

  const { connectionStatus, isConnected } = useRealtimeSubscription({
    sessionId: elementId, // Using elementId as unique identifier for channel
    channelName: `aggregates:${elementId}`,
    enabled: enabled && realtime && !!elementId,
    subscriptions: [
      {
        tableName: 'element_aggregates',
        event: '*',
        filter: `element_id=eq.${elementId}`,
      },
    ],
    onData: (_tableName, payload) => {
      console.log('[useElementAggregates] Realtime event:', payload);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const eventPayload = payload as any;

      if (eventPayload.eventType === 'INSERT' && eventPayload.new) {
        const newAggregate = eventPayload.new as ElementAggregate;
        setAggregates((prev) => {
          // 중복 체크
          if (prev.some((a) => a.id === newAggregate.id)) {
            return prev;
          }
          return [...prev, newAggregate].sort((a, b) => b.count - a.count);
        });
      } else if (eventPayload.eventType === 'UPDATE' && eventPayload.new) {
        const updatedAggregate = eventPayload.new as ElementAggregate;
        setAggregates((prev) =>
          prev
            .map((a) => (a.id === updatedAggregate.id ? updatedAggregate : a))
            .sort((a, b) => b.count - a.count)
        );
      } else if (eventPayload.eventType === 'DELETE' && eventPayload.old) {
        const deletedId = eventPayload.old.id;
        setAggregates((prev) => prev.filter((a) => a.id !== deletedId));
      } else {
        // Fallback: reload all
        loadAggregates();
      }
    },
  });

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    if (enabled && elementId) {
      loadAggregates();
    } else if (!elementId || !enabled) {
      setAggregates([]);
      setIsLoading(false);
    }
  }, [elementId, enabled, loadAggregates]);

  // ============================================
  // Derived State (Memoized)
  // ============================================

  const totalCount = useMemo(() => getTotalFromAggregates(aggregates), [aggregates]);

  const countMap = useMemo(() => aggregatesToMap(aggregates), [aggregates]);

  const percentageMap = useMemo(() => getPercentages(aggregates), [aggregates]);

  // ============================================
  // Helpers
  // ============================================

  const getCountByKey = useCallback(
    (key: string): number => {
      return countMap[key] || 0;
    },
    [countMap]
  );

  const getPercentageByKey = useCallback(
    (key: string): number => {
      return percentageMap[key] || 0;
    },
    [percentageMap]
  );

  const getSortedByCount = useCallback(
    (ascending = false): ElementAggregate[] => {
      return [...aggregates].sort((a, b) =>
        ascending ? a.count - b.count : b.count - a.count
      );
    },
    [aggregates]
  );

  const getTopN = useCallback(
    (n: number): ElementAggregate[] => {
      return getSortedByCount(false).slice(0, n);
    },
    [getSortedByCount]
  );

  // ============================================
  // Return
  // ============================================

  return {
    // State
    aggregates,
    isLoading,
    error,
    connectionStatus,
    isConnected,

    // Derived Data
    totalCount,
    countMap,
    percentageMap,

    // Helpers
    getCountByKey,
    getPercentageByKey,
    getSortedByCount,
    getTopN,

    // Actions
    reload: loadAggregates,
  };
}
