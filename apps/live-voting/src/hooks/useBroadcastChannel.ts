import { useEffect, useCallback } from 'react';
import type { Vote } from '@/types/poll';

export type BroadcastMessage =
  | { type: 'NEW_VOTE'; vote: Vote }
  | { type: 'POLL_CLOSED'; pollId: string }
  | { type: 'REFRESH_RESULTS' };

export function useBroadcastChannel(
  channelName: string,
  onMessage: (message: BroadcastMessage) => void
) {
  useEffect(() => {
    // BroadcastChannel 지원 여부 확인
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel(channelName);

    channel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
      onMessage(event.data);
    };

    return () => {
      channel.close();
    };
  }, [channelName, onMessage]);

  const broadcast = useCallback(
    (message: BroadcastMessage) => {
      if (typeof BroadcastChannel === 'undefined') {
        return;
      }

      const channel = new BroadcastChannel(channelName);
      channel.postMessage(message);
      channel.close();
    },
    [channelName]
  );

  return { broadcast };
}
