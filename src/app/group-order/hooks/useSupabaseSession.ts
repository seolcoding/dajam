'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';
import type { GroupOrderConfig, MenuItem, OrderItem } from '@/types/database';

// 로컬 세션 타입 (기존 호환)
export interface LocalSession {
  id: string;
  restaurantName: string;
  hostName: string;
  mode: 'fixed' | 'free';
  menus: MenuItem[];
  deadline: string | null;
  orders: LocalOrder[];
}

export interface LocalOrder {
  id: string;
  name: string;
  menuName: string;
  quantity: number;
  price: number;
  timestamp: string;
}

// Supabase 세션 타입
interface SessionRow {
  id: string;
  code: string;
  app_type: string;
  title: string;
  host_id: string | null;
  config: GroupOrderConfig;
  is_active: boolean;
  is_public: boolean;
  max_participants: number | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderRow {
  id: string;
  session_id: string;
  participant_id: string | null;
  user_id: string | null;
  participant_name: string;
  items: OrderItem[];
  special_request: string | null;
  created_at: string;
  updated_at: string;
}

interface UseSupabaseSessionOptions {
  sessionCode: string;
  enabled?: boolean;
}

interface SupabaseSessionState {
  session: LocalSession | null;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null; // Supabase UUID
  isCloudMode: boolean;
}

/**
 * group-order Supabase 세션 관리 훅
 * - 세션 생성/로드
 * - 주문 실시간 구독
 * - 로컬/클라우드 모드 지원
 */
export function useSupabaseSession({ sessionCode, enabled = true }: UseSupabaseSessionOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as SupabaseClient<any, 'public', any>;
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [state, setState] = useState<SupabaseSessionState>({
    session: null,
    isLoading: true,
    error: null,
    sessionId: null,
    isCloudMode: false,
  });

  // 세션 로드 (코드로 검색)
  const loadSession = useCallback(async () => {
    if (!enabled || !sessionCode) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      // Supabase에서 세션 검색
      const { data, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', sessionCode.toUpperCase())
        .eq('app_type', 'group-order')
        .eq('is_active', true)
        .single();

      if (sessionError || !data) {
        // 클라우드 세션이 없으면 로컬 스토리지 확인
        const localData = localStorage.getItem(`group-order-${sessionCode}`);
        if (localData) {
          const localSession = JSON.parse(localData) as LocalSession;
          setState({
            session: localSession,
            isLoading: false,
            error: null,
            sessionId: null,
            isCloudMode: false,
          });
          return;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: '주문방을 찾을 수 없습니다.',
        }));
        return;
      }

      const sessionRow = data as SessionRow;
      const config = sessionRow.config;

      // 주문 데이터 로드
      const orders = await loadOrders(sessionRow.id);

      // LocalSession 형태로 변환
      const session: LocalSession = {
        id: sessionRow.code,
        restaurantName: config.restaurantName,
        hostName: sessionRow.title, // title을 hostName으로 사용
        mode: config.mode,
        menus: config.menus || [],
        deadline: config.deadline || null,
        orders,
      };

      setState({
        session,
        isLoading: false,
        error: null,
        sessionId: sessionRow.id,
        isCloudMode: true,
      });
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : '알 수 없는 오류',
      }));
    }
  }, [sessionCode, enabled, supabase]);

  // 주문 데이터 로드
  const loadOrders = useCallback(async (sessionId: string): Promise<LocalOrder[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Failed to load orders:', error);
      return [];
    }

    // OrderRow를 LocalOrder로 변환
    return (data as OrderRow[]).flatMap(orderRow => {
      const items = orderRow.items as OrderItem[];
      return items.map(item => ({
        id: item.id,
        name: orderRow.participant_name,
        menuName: item.menuName,
        quantity: item.quantity,
        price: item.price,
        timestamp: orderRow.created_at,
      }));
    });
  }, [supabase]);

  // 클라우드 세션 생성
  const createCloudSession = useCallback(async (params: {
    restaurantName: string;
    hostName: string;
    mode: 'fixed' | 'free';
    menus: MenuItem[];
    deadline: string | null;
  }): Promise<string | null> => {
    try {
      const { data: userData } = await supabase.auth.getUser();

      // 8자리 세션 코드 생성
      const code = generateSessionCode();

      const config: GroupOrderConfig = {
        mode: params.mode,
        restaurantName: params.restaurantName,
        menus: params.mode === 'fixed' ? params.menus : [],
        deadline: params.deadline || undefined,
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          code: code.toUpperCase(),
          app_type: 'group-order',
          title: params.hostName, // hostName을 title로 저장
          host_id: userData.user?.id || null,
          config,
          is_active: true,
          is_public: true,
          expires_at: params.deadline || null,
        })
        .select()
        .single();

      if (error || !data) {
        console.error('Failed to create cloud session:', error);
        return null;
      }

      const sessionRow = data as SessionRow;

      const session: LocalSession = {
        id: code,
        restaurantName: params.restaurantName,
        hostName: params.hostName,
        mode: params.mode,
        menus: params.menus,
        deadline: params.deadline,
        orders: [],
      };

      setState({
        session,
        isLoading: false,
        error: null,
        sessionId: sessionRow.id,
        isCloudMode: true,
      });

      return code;
    } catch (err) {
      console.error('Failed to create cloud session:', err);
      return null;
    }
  }, [supabase]);

  // 주문 제출
  const submitOrder = useCallback(async (order: {
    name: string;
    menuName: string;
    quantity: number;
    price: number;
  }): Promise<boolean> => {
    if (!state.sessionId) {
      // 클라우드 모드가 아니면 로컬 저장
      if (state.session) {
        const newOrder: LocalOrder = {
          id: generateOrderId(),
          name: order.name,
          menuName: order.menuName,
          quantity: order.quantity,
          price: order.price,
          timestamp: new Date().toISOString(),
        };

        const updatedSession = {
          ...state.session,
          orders: [...state.session.orders, newOrder],
        };

        localStorage.setItem(`group-order-${state.session.id}`, JSON.stringify(updatedSession));
        setState(prev => ({ ...prev, session: updatedSession }));
        return true;
      }
      return false;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();

      const orderItem: OrderItem = {
        id: generateOrderId(),
        menuName: order.menuName,
        price: order.price,
        quantity: order.quantity,
      };

      const { error } = await supabase.from('orders').insert({
        session_id: state.sessionId,
        user_id: userData.user?.id || null,
        participant_name: order.name,
        items: [orderItem],
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to submit order:', err);
      return false;
    }
  }, [state.sessionId, state.session, supabase]);

  // 세션 종료 (호스트용)
  const closeSession = useCallback(async (): Promise<boolean> => {
    if (!state.sessionId) return false;

    try {
      const { error } = await supabase
        .from('sessions')
        .update({ is_active: false })
        .eq('id', state.sessionId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to close session:', err);
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
        .channel(`group-order:${state.sessionId}`, {
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
            table: 'orders',
            filter: `session_id=eq.${state.sessionId}`,
          },
          async (payload) => {
            console.log('[Realtime] New order received:', payload);
            // 새 주문이 들어오면 전체 주문 데이터 다시 로드
            const orders = await loadOrders(state.sessionId!);
            setState(prev => {
              if (!prev.session) return prev;
              return {
                ...prev,
                session: { ...prev.session, orders },
              };
            });
          }
        )
        .subscribe((status, err) => {
          console.log('[Realtime] group-order subscription status:', status, err || '');

          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] Successfully subscribed to group-order:', state.sessionId);
            retryCount = 0;
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('[Realtime] group-order channel error/timeout:', err);
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
      console.log('[Realtime] Cleaning up group-order subscription:', state.sessionId);
      channel.unsubscribe();
    };
  }, [enabled, state.sessionId, supabase, loadOrders]);

  // 초기 로드
  useEffect(() => {
    if (enabled && sessionCode) {
      loadSession();
    }
  }, [loadSession, enabled, sessionCode]);

  return {
    ...state,
    createCloudSession,
    submitOrder,
    closeSession,
    reload: loadSession,
  };
}

// 유틸리티 함수
function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateOrderId(): string {
  return Math.random().toString(36).substring(2, 10);
}
