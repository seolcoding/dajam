'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { EmojiType } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * useReactions - 이모지 리액션 실시간 브로드캐스트
 *
 * - 참여자가 이모지를 클릭하면 전체에게 브로드캐스트
 * - 호스트 화면에 이모지 애니메이션 표시
 * - 짧은 시간 내 중복 전송 방지 (throttle)
 */

interface UseReactionsOptions {
  sessionId: string;
  participantId?: string;
  enabled?: boolean;
}

interface ReactionEvent {
  type: EmojiType;
  participantId: string;
  timestamp: string;
  id: string; // Unique ID for animation key
}

interface ReactionPayload {
  type: 'reaction';
  emoji: EmojiType;
  participantId: string;
  timestamp: string;
  id: string;
}

const THROTTLE_MS = 500; // Minimum time between reactions

export function useReactions({
  sessionId,
  participantId,
  enabled = true,
}: UseReactionsOptions) {
  const supabase = useSupabase();
  const [recentReactions, setRecentReactions] = useState<ReactionEvent[]>([]);
  const lastReactionTime = useRef<Record<EmojiType, number>>({
    thumbsUp: 0,
    heart: 0,
    laugh: 0,
    clap: 0,
    party: 0,
  });
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Subscribe to reactions
  useEffect(() => {
    if (!enabled || !sessionId || !supabase) return;

    const setupSubscription = () => {
      channelRef.current = supabase
        .channel(`reactions:${sessionId}`)
        .on('broadcast', { event: 'reaction' }, (payload) => {
          const data = payload.payload as ReactionPayload;
          if (data.type === 'reaction') {
            const reactionEvent: ReactionEvent = {
              type: data.emoji,
              participantId: data.participantId,
              timestamp: data.timestamp,
              id: data.id,
            };

            setRecentReactions((prev) => {
              // Keep only recent reactions (last 20)
              const updated = [...prev, reactionEvent].slice(-20);
              return updated;
            });

            // Auto-remove after animation
            setTimeout(() => {
              setRecentReactions((prev) =>
                prev.filter((r) => r.id !== reactionEvent.id)
              );
            }, 2000);
          }
        })
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, sessionId, supabase]);

  // Send reaction
  const sendReaction = useCallback(
    async (emoji: EmojiType) => {
      if (!supabase || !participantId || !sessionId) return;

      // Throttle check
      const now = Date.now();
      if (now - lastReactionTime.current[emoji] < THROTTLE_MS) {
        return; // Too soon
      }
      lastReactionTime.current[emoji] = now;

      const id = `${participantId}-${now}`;
      const payload: ReactionPayload = {
        type: 'reaction',
        emoji,
        participantId,
        timestamp: new Date().toISOString(),
        id,
      };

      // Use existing channel or create new one
      const channel = channelRef.current || supabase.channel(`reactions:${sessionId}`);

      await channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload,
      });
    },
    [supabase, sessionId, participantId]
  );

  // Get reaction counts for the last N seconds
  const getReactionCounts = useCallback(() => {
    const counts: Record<EmojiType, number> = {
      thumbsUp: 0,
      heart: 0,
      laugh: 0,
      clap: 0,
      party: 0,
    };

    recentReactions.forEach((r) => {
      counts[r.type]++;
    });

    return counts;
  }, [recentReactions]);

  return {
    recentReactions,
    sendReaction,
    getReactionCounts,
  };
}

export default useReactions;
