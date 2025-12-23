'use client';

import { useEffect, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload, SupabaseClient } from '@supabase/supabase-js';
import { useSupabase } from './useSupabase';

type PostgresChangesEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface SubscriptionConfig {
  channelName: string;
  table: string;
  schema?: string;
  filter?: string;
  event?: PostgresChangesEvent;
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export function useRealtimeSubscription({
  channelName,
  table,
  schema = 'public',
  filter,
  event = '*',
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: SubscriptionConfig) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as SupabaseClient<any, 'public', any>;
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel(channelName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (channel as any).on(
      'postgres_changes',
      {
        event,
        schema,
        table,
        filter,
      },
      (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        onChange?.(payload);

        switch (payload.eventType) {
          case 'INSERT':
            onInsert?.(payload);
            break;
          case 'UPDATE':
            onUpdate?.(payload);
            break;
          case 'DELETE':
            onDelete?.(payload);
            break;
        }
      }
    ).subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [channelName, table, schema, filter, event, supabase, onChange, onInsert, onUpdate, onDelete]);

  return channelRef.current;
}

// 여러 테이블 구독용
export function useMultiTableSubscription(
  channelName: string,
  configs: Array<{
    table: string;
    filter?: string;
    onPayload: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  }>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as SupabaseClient<any, 'public', any>;
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any = supabase.channel(channelName);

    configs.forEach(({ table, filter, onPayload }) => {
      channel = channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        onPayload
      );
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [channelName, configs, supabase]);

  return channelRef.current;
}
