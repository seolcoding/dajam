'use client';

import { useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAudienceEngageStore } from '../store/audienceEngageStore';
import type { ActiveScene, PresentationState } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * useSceneSync - 호스트와 참여자 간 Scene 동기화
 *
 * 호스트가 Scene을 변경하면 모든 참여자에게 브로드캐스트
 * 참여자는 Scene 변경을 수신하여 store 업데이트
 */

interface UseSceneSyncOptions {
  sessionId: string;
  isHost: boolean;
  enabled?: boolean;
}

interface SceneChangePayload {
  type: 'scene_change';
  scene: ActiveScene;
  timestamp: string;
}

interface SettingsChangePayload {
  type: 'settings_change';
  settings: Partial<PresentationState>;
  timestamp: string;
}

type BroadcastPayload = SceneChangePayload | SettingsChangePayload;

export function useSceneSync({ sessionId, isHost, enabled = true }: UseSceneSyncOptions) {
  const supabase = useSupabase();
  const { activeScene, setActiveScene, setPresentationState, presentationState } = useAudienceEngageStore();

  // Broadcast scene change (host only)
  const broadcastSceneChange = useCallback(
    async (scene: ActiveScene) => {
      if (!isHost || !sessionId || !supabase) return;

      const channel = supabase.channel(`audience-engage:${sessionId}`);

      const payload: SceneChangePayload = {
        type: 'scene_change',
        scene,
        timestamp: new Date().toISOString(),
      };

      await channel.send({
        type: 'broadcast',
        event: 'sync',
        payload,
      });
    },
    [isHost, sessionId, supabase]
  );

  // Broadcast settings change (host only)
  const broadcastSettingsChange = useCallback(
    async (settings: Partial<PresentationState>) => {
      if (!isHost || !sessionId || !supabase) return;

      const channel = supabase.channel(`audience-engage:${sessionId}`);

      const payload: SettingsChangePayload = {
        type: 'settings_change',
        settings,
        timestamp: new Date().toISOString(),
      };

      await channel.send({
        type: 'broadcast',
        event: 'sync',
        payload,
      });
    },
    [isHost, sessionId, supabase]
  );

  // Subscribe to scene changes (participants)
  useEffect(() => {
    if (!enabled || !sessionId || !supabase || isHost) return;

    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      channel = supabase.channel(`audience-engage:${sessionId}`);

      channel!
        .on('broadcast', { event: 'sync' }, (payload: { payload: BroadcastPayload }) => {
          const data = payload.payload as BroadcastPayload;

          if (data.type === 'scene_change') {
            setActiveScene(data.scene);
          } else if (data.type === 'settings_change') {
            if (presentationState) {
              setPresentationState({
                ...presentationState,
                ...data.settings,
                updatedAt: data.timestamp,
              });
            }
          }
        })
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, sessionId, supabase, isHost, setActiveScene, setPresentationState, presentationState]);

  // Host: broadcast when scene changes
  useEffect(() => {
    if (!isHost || !enabled) return;

    // Debounce to avoid too many broadcasts
    const timer = setTimeout(() => {
      broadcastSceneChange(activeScene);
    }, 100);

    return () => clearTimeout(timer);
  }, [activeScene, isHost, enabled, broadcastSceneChange]);

  return {
    broadcastSceneChange,
    broadcastSettingsChange,
  };
}

export default useSceneSync;
