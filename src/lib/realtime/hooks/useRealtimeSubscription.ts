'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSupabase } from '@/hooks/useSupabase';
import type { ConnectionStatus, RealtimeSubscriptionConfig } from '../types';
import { calculateRetryDelay } from '../utils';

interface UseRealtimeSubscriptionOptions {
  sessionId: string | null;
  channelName: string;
  subscriptions: RealtimeSubscriptionConfig[];
  enabled?: boolean;
  maxRetries?: number;
  onData?: (tableName: string, payload: unknown) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

/**
 * Supabase Realtime 구독 훅
 * - 자동 재연결
 * - 연결 상태 추적
 * - 다중 테이블 구독 지원
 */
export function useRealtimeSubscription({
  sessionId,
  channelName,
  subscriptions,
  enabled = true,
  maxRetries = 3,
  onData,
  onConnectionChange,
}: UseRealtimeSubscriptionOptions) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  const updateStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
    onConnectionChange?.(status);
  }, [onConnectionChange]);

  const setupChannel = useCallback(() => {
    if (!sessionId || !enabled) return null;

    updateStatus('connecting');

    let channel = supabase.channel(channelName, {
      config: {
        broadcast: { self: true },
        presence: { key: sessionId },
      },
    });

    // 모든 구독 등록
    subscriptions.forEach((sub) => {
      channel = channel.on(
        'postgres_changes',
        {
          event: sub.event,
          schema: 'public',
          table: sub.tableName,
          filter: sub.filter || `session_id=eq.${sessionId}`,
        },
        (payload: unknown) => {
          console.log(`[Realtime] ${sub.tableName} ${sub.event}:`, payload);
          onData?.(sub.tableName, payload);
        }
      );
    });

    channel.subscribe((status: string, err?: Error) => {
      console.log(`[Realtime] ${channelName} status:`, status, err || '');

      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Successfully subscribed to ${channelName}`);
        updateStatus('connected');
        retryCountRef.current = 0;
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`[Realtime] ${channelName} error:`, err);
        updateStatus('error');

        // 재연결 시도
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          const delay = calculateRetryDelay(retryCountRef.current);
          console.log(`[Realtime] Retrying in ${delay}ms (${retryCountRef.current}/${maxRetries})`);

          setTimeout(() => {
            channel.unsubscribe();
            const newChannel = setupChannel();
            if (newChannel) {
              channelRef.current = newChannel;
            }
          }, delay);
        }
      } else if (status === 'CLOSED') {
        updateStatus('disconnected');
      }
    });

    return channel;
  }, [sessionId, channelName, subscriptions, enabled, maxRetries, supabase, onData, updateStatus]);

  useEffect(() => {
    if (!enabled || !sessionId) {
      updateStatus('disconnected');
      return;
    }

    const channel = setupChannel();
    if (channel) {
      channelRef.current = channel;
    }

    return () => {
      if (channelRef.current) {
        console.log(`[Realtime] Cleaning up ${channelName}`);
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [enabled, sessionId, setupChannel, channelName, updateStatus]);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  };
}
