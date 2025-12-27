'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { SessionElement, SessionElementInsert, Json } from '@/types/database';
import type { ConnectionStatus } from '../types';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import type {
  ElementType,
  CreateElementInput,
  UpdateElementInput,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

export interface UseSessionElementsOptions {
  sessionId: string | null;
  enabled?: boolean;
  autoLoadOnMount?: boolean;
}

export interface UseSessionElementsReturn {
  // State
  elements: SessionElement[];
  activeElement: SessionElement | null;
  isLoading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;

  // CRUD Operations
  createElement: (input: CreateElementInput) => Promise<SessionElement | null>;
  updateElement: (id: string, updates: UpdateElementInput) => Promise<boolean>;
  deleteElement: (id: string) => Promise<boolean>;
  reorderElements: (elementIds: string[]) => Promise<boolean>;

  // State Management
  setActiveElement: (id: string | null) => Promise<boolean>;
  updateElementState: (id: string, state: Json) => Promise<boolean>;
  updateElementConfig: (id: string, config: Json) => Promise<boolean>;

  // Utilities
  reload: () => Promise<void>;
  getElementByType: (type: ElementType) => SessionElement | undefined;
  getElementsByType: (type: ElementType) => SessionElement[];
}

// ============================================
// Hook Implementation
// ============================================

/**
 * Session Elements 관리 훅
 *
 * session_elements 테이블의 CRUD 및 실시간 동기화를 처리합니다.
 *
 * @example
 * const {
 *   elements,
 *   activeElement,
 *   createElement,
 *   setActiveElement,
 * } = useSessionElements({ sessionId });
 *
 * // 새 요소 생성
 * await createElement({
 *   session_id: sessionId,
 *   element_type: 'poll',
 *   title: '점심 메뉴 투표',
 *   config: { type: 'single', options: [...] },
 * });
 *
 * // 요소 활성화
 * await setActiveElement(elementId);
 */
export function useSessionElements({
  sessionId,
  enabled = true,
  autoLoadOnMount = true,
}: UseSessionElementsOptions): UseSessionElementsReturn {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;

  const [elements, setElements] = useState<SessionElement[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoadOnMount);
  const [error, setError] = useState<string | null>(null);

  // 데이터 무결성을 위한 Refs
  const sessionIdRef = useRef<string | null>(null);
  const elementsRef = useRef<SessionElement[]>([]);
  const lastUpdateRef = useRef<number>(0);

  // Sync ref with state
  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // ============================================
  // Load Elements
  // ============================================

  const loadElements = useCallback(async (isBackground = false) => {
    const currentSessionId = sessionIdRef.current;
    if (!currentSessionId || !enabled) {
      if (!isBackground) setIsLoading(false);
      return;
    }

    const requestTime = Date.now();

    try {
      if (!isBackground) setIsLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('session_elements')
        .select('*')
        .eq('session_id', currentSessionId)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      // 더 최신 로컬 업데이트가 있었다면 이 데이터는 무시 (Race condition 방지)
      if (requestTime < lastUpdateRef.current) return;

      setElements((data || []) as SessionElement[]);
    } catch (err) {
      console.error('[useSessionElements] Load failed:', err);
      if (!isBackground) {
        setError(err instanceof Error ? err.message : '요소를 불러오는데 실패했습니다.');
      }
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  }, [enabled, supabase]);

  // ============================================
  // Realtime Subscription
  // ============================================

  const { connectionStatus, isConnected } = useRealtimeSubscription({
    sessionId,
    channelName: `elements:${sessionId}`,
    enabled: enabled && !!sessionId,
    subscriptions: [
      {
        tableName: 'session_elements',
        event: '*',
      },
    ],
    onData: (_tableName, payload) => {
      console.log('[useSessionElements] Realtime event:', payload);
      // 실시간 이벤트는 백그라운드에서 조용히 업데이트 (로딩 바 표시 X)
      loadElements(true);
    },
  });

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    if (enabled && sessionId && autoLoadOnMount) {
      loadElements();
    } else if (!sessionId || !enabled) {
      setElements([]);
      setIsLoading(false);
    }
  }, [sessionId, enabled, autoLoadOnMount, loadElements]);

  // ============================================
  // Derived State
  // ============================================

  const activeElement = useMemo(() => {
    if (!Array.isArray(elements)) return null;
    // 명시적으로 true인 요소를 찾음 (null/undefined 방어)
    return elements.find((el) => el.is_active === true) || null;
  }, [elements]);

  // ============================================
  // CRUD Operations
  // ============================================

  const createElement = useCallback(
    async (input: CreateElementInput): Promise<SessionElement | null> => {
      const currentSessionId = sessionIdRef.current;
      if (!currentSessionId) {
        console.error('[useSessionElements] Cannot create element: no sessionId');
        return null;
      }

      try {
        // 마지막 order_index 계산
        const maxOrderIndex = elements.length > 0
          ? Math.max(...elements.map((el) => el.order_index))
          : -1;

        const insertData: SessionElementInsert = {
          session_id: input.session_id || currentSessionId,
          element_type: input.element_type,
          title: input.title,
          description: input.description || null,
          config: input.config,
          state: {},
          order_index: input.order_index ?? maxOrderIndex + 1,
          is_active: input.is_active ?? false,
          is_visible: true,
          starts_at: input.starts_at || null,
          ends_at: input.ends_at || null,
        };

        const { data, error: insertError } = await supabase
          .from('session_elements')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }

        const newElement = data as SessionElement;

        // 로컬 상태 업데이트 (optimistic)
        setElements((prev) => [...prev, newElement].sort((a, b) => a.order_index - b.order_index));

        return newElement;
      } catch (err) {
        console.error('[useSessionElements] Create failed:', err);
        setError(err instanceof Error ? err.message : '요소 생성에 실패했습니다.');
        return null;
      }
    },
    [elements, supabase]
  );

  const updateElement = useCallback(
    async (id: string, updates: UpdateElementInput): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('session_elements')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (updateError) {
          throw updateError;
        }

        // 로컬 상태 업데이트 (optimistic)
        setElements((prev) =>
          prev.map((el) =>
            el.id === id ? { ...el, ...updates, updated_at: new Date().toISOString() } : el
          )
        );

        return true;
      } catch (err) {
        console.error('[useSessionElements] Update failed:', err);
        setError(err instanceof Error ? err.message : '요소 수정에 실패했습니다.');
        return false;
      }
    },
    [supabase]
  );

  const deleteElement = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { error: deleteError } = await supabase
          .from('session_elements')
          .delete()
          .eq('id', id);

        if (deleteError) {
          throw deleteError;
        }

        // 로컬 상태 업데이트 (optimistic)
        setElements((prev) => prev.filter((el) => el.id !== id));

        return true;
      } catch (err) {
        console.error('[useSessionElements] Delete failed:', err);
        setError(err instanceof Error ? err.message : '요소 삭제에 실패했습니다.');
        return false;
      }
    },
    [supabase]
  );

  const reorderElements = useCallback(
    async (elementIds: string[]): Promise<boolean> => {
      const currentSessionId = sessionIdRef.current;
      if (!currentSessionId) return false;

      try {
        // 배치 업데이트를 위해 각 요소의 order_index를 업데이트
        const updates = elementIds.map((id, index) => ({
          id,
          order_index: index,
        }));

        // Supabase는 batch update를 지원하지 않으므로 개별 업데이트
        // 트랜잭션이 필요하면 RPC 함수로 전환 권장
        for (const update of updates) {
          const { error } = await supabase
            .from('session_elements')
            .update({ order_index: update.order_index })
            .eq('id', update.id);

          if (error) throw error;
        }

        // 로컬 상태 업데이트
        setElements((prev) => {
          const elementMap = new Map(prev.map((el) => [el.id, el]));
          return elementIds
            .map((id, index) => {
              const el = elementMap.get(id);
              return el ? { ...el, order_index: index } : null;
            })
            .filter((el): el is SessionElement => el !== null);
        });

        return true;
      } catch (err) {
        console.error('[useSessionElements] Reorder failed:', err);
        setError(err instanceof Error ? err.message : '순서 변경에 실패했습니다.');
        return false;
      }
    },
    [supabase]
  );

  // ============================================
  // State Management
  // ============================================

  const setActiveElement = useCallback(
    async (id: string | null): Promise<boolean> => {
      const currentSessionId = sessionIdRef.current;
      if (!currentSessionId) return false;

      // Optimistic Update: Update local state immediately
      lastUpdateRef.current = Date.now();
      const previousElements = [...elements]; // Backup for rollback
      setElements((prev) =>
        prev.map((el) => ({
          ...el,
          is_active: el.id === id,
        }))
      );

      try {
        // 먼저 모든 요소 비활성화
        const { error: deactivateError } = await supabase
          .from('session_elements')
          .update({ is_active: false })
          .eq('session_id', currentSessionId);

        if (deactivateError) throw deactivateError;

        // 특정 요소 활성화 (id가 null이 아닌 경우)
        if (id) {
          const { error: activateError } = await supabase
            .from('session_elements')
            .update({ is_active: true })
            .eq('id', id);

          if (activateError) throw activateError;
        }

        return true;
      } catch (err) {
        console.error('[useSessionElements] SetActive failed:', err);
        setError(err instanceof Error ? err.message : '요소 활성화에 실패했습니다.');
        
        // Rollback on error
        setElements(previousElements);
        return false;
      }
    },
    [elements, supabase]
  );

  const updateElementState = useCallback(
    async (id: string, state: Json): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('session_elements')
          .update({
            state,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (updateError) throw updateError;

        // 로컬 상태 업데이트 (optimistic)
        setElements((prev) =>
          prev.map((el) =>
            el.id === id ? { ...el, state, updated_at: new Date().toISOString() } : el
          )
        );

        return true;
      } catch (err) {
        console.error('[useSessionElements] UpdateState failed:', err);
        return false;
      }
    },
    [supabase]
  );

  const updateElementConfig = useCallback(
    async (id: string, config: Json): Promise<boolean> => {
      try {
        const { error: updateError } = await supabase
          .from('session_elements')
          .update({
            config,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (updateError) throw updateError;

        // 로컬 상태 업데이트 (optimistic)
        setElements((prev) =>
          prev.map((el) =>
            el.id === id ? { ...el, config, updated_at: new Date().toISOString() } : el
          )
        );

        return true;
      } catch (err) {
        console.error('[useSessionElements] UpdateConfig failed:', err);
        return false;
      }
    },
    [supabase]
  );

  // ============================================
  // Utilities
  // ============================================

  const getElementByType = useCallback(
    (type: ElementType): SessionElement | undefined => {
      return elements.find((el) => el.element_type === type);
    },
    [elements]
  );

  const getElementsByType = useCallback(
    (type: ElementType): SessionElement[] => {
      return elements.filter((el) => el.element_type === type);
    },
    [elements]
  );

  // ============================================
  // Return
  // ============================================

  return {
    // State
    elements,
    activeElement,
    isLoading,
    error,
    connectionStatus,
    isConnected,

    // CRUD
    createElement,
    updateElement,
    deleteElement,
    reorderElements,

    // State Management
    setActiveElement,
    updateElementState,
    updateElementConfig,

    // Utilities
    reload: loadElements,
    getElementByType,
    getElementsByType,
  };
}
