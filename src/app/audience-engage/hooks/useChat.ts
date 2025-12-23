'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAudienceEngageStore } from '../store/audienceEngageStore';
import type { ChatMessage } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * useChat - 채팅 실시간 관리 훅
 *
 * - 메시지 목록 로드 및 실시간 구독
 * - 메시지 전송 및 삭제
 */

interface UseChatOptions {
  sessionId: string;
  participantId?: string;
  participantName?: string;
  enabled?: boolean;
}

interface ChatMessageRow {
  id: string;
  session_id: string;
  participant_id: string | null;
  author_name: string;
  body: string;
  slide_position: number;
  created_at: string;
}

export function useChat({
  sessionId,
  participantId,
  participantName = '익명',
  enabled = true,
}: UseChatOptions) {
  const supabase = useSupabase();
  const { chatMessages, setChatMessages, addChatMessage } = useAudienceEngageStore();
  const [isLoading, setIsLoading] = useState(false);

  // 메시지 로드
  const loadMessages = useCallback(async () => {
    if (!supabase || !sessionId) return;

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(100); // 최근 100개만

      if (error) {
        console.error('Failed to load chat messages:', error);
        return;
      }

      const loadedMessages: ChatMessage[] = (data || []).map((row: ChatMessageRow) => ({
        id: row.id,
        sessionId: row.session_id,
        participantId: row.participant_id || undefined,
        authorName: row.author_name,
        body: row.body,
        slidePosition: row.slide_position,
        createdAt: row.created_at,
      }));

      setChatMessages(loadedMessages);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, sessionId, setChatMessages]);

  // 실시간 구독
  useEffect(() => {
    if (!enabled || !sessionId || !supabase) return;

    loadMessages();

    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      channel = supabase
        .channel(`chat:${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionId}`,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: any) => {
            const row = payload.new as ChatMessageRow;
            if (row) {
              const newMessage: ChatMessage = {
                id: row.id,
                sessionId: row.session_id,
                participantId: row.participant_id || undefined,
                authorName: row.author_name,
                body: row.body,
                slidePosition: row.slide_position,
                createdAt: row.created_at,
              };
              addChatMessage(newMessage);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_messages',
            filter: `session_id=eq.${sessionId}`,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: any) => {
            const oldRow = payload.old as { id?: string };
            if (oldRow?.id) {
              // Remove from store - need to get current messages
              const currentMessages = useAudienceEngageStore.getState().chatMessages;
              setChatMessages(currentMessages.filter((m) => m.id !== oldRow.id));
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, sessionId, supabase, loadMessages, addChatMessage, setChatMessages]);

  // 메시지 전송
  const sendMessage = useCallback(
    async (body: string, slidePosition = 1) => {
      if (!supabase || !sessionId) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('chat_messages').insert({
        session_id: sessionId,
        participant_id: participantId || null,
        author_name: participantName,
        body,
        slide_position: slidePosition,
      });

      if (error) {
        console.error('Failed to send message:', error);
      }
    },
    [supabase, sessionId, participantId, participantName]
  );

  // 메시지 삭제 (호스트)
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!supabase) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('chat_messages').delete().eq('id', messageId);
    },
    [supabase]
  );

  return {
    messages: chatMessages,
    isLoading,
    sendMessage,
    deleteMessage,
  };
}

export default useChat;
