'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { ActiveScene, SceneType } from '../types';

interface UseSlideSyncOptions {
  sessionId: string;
  isHost: boolean;
  enabled?: boolean;
}

interface SlideSyncState {
  currentScene: ActiveScene;
  isPresenting: boolean;
  lastUpdated: string | null;
}

/**
 * useSlideSync - 호스트와 참여자 간 슬라이드/Scene 동기화 훅
 *
 * 호스트:
 * - 슬라이드/Scene 변경 시 브로드캐스트
 * - 프레젠테이션 상태 관리
 *
 * 참여자:
 * - 호스트의 슬라이드/Scene 변경 수신
 * - 실시간 동기화
 */
export function useSlideSync({
  sessionId,
  isHost,
  enabled = true,
}: UseSlideSyncOptions) {
  const supabase = useSupabase();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const [state, setState] = useState<SlideSyncState>({
    currentScene: {
      type: 'slides',
      itemIndex: 0,
      slideIndex: 0,
    },
    isPresenting: false,
    lastUpdated: null,
  });

  // 채널 설정
  useEffect(() => {
    if (!enabled || !sessionId || !supabase) return;

    const channel = supabase
      .channel(`slide-sync:${sessionId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on('broadcast', { event: 'scene-change' }, (payload) => {
        const data = payload.payload as {
          scene: ActiveScene;
          isPresenting: boolean;
          timestamp: string;
        };

        // 호스트가 아닐 때만 상태 업데이트
        if (!isHost) {
          setState({
            currentScene: data.scene,
            isPresenting: data.isPresenting,
            lastUpdated: data.timestamp,
          });
        }
      })
      .subscribe((status) => {
        console.log(`[SlideSync] ${sessionId} status:`, status);
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [enabled, sessionId, supabase, isHost]);

  // 초기 상태 로드
  useEffect(() => {
    if (!enabled || !sessionId || !supabase) return;

    const loadInitialState = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('presentation_states')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (data && !error) {
        setState({
          currentScene: {
            type: 'slides',
            itemIndex: 0,
            slideIndex: data.current_slide || 0,
          },
          isPresenting: data.is_presenting || false,
          lastUpdated: data.updated_at,
        });
      }
    };

    loadInitialState();
  }, [enabled, sessionId, supabase]);

  // Scene 변경 (호스트만)
  const changeScene = useCallback(
    async (scene: ActiveScene) => {
      if (!isHost || !channelRef.current) return;

      const timestamp = new Date().toISOString();

      // 로컬 상태 업데이트
      setState((prev) => ({
        ...prev,
        currentScene: scene,
        lastUpdated: timestamp,
      }));

      // 브로드캐스트
      await channelRef.current.send({
        type: 'broadcast',
        event: 'scene-change',
        payload: {
          scene,
          isPresenting: state.isPresenting,
          timestamp,
        },
      });

      // DB 저장
      if (supabase) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('presentation_states')
          .upsert({
            session_id: sessionId,
            current_slide: scene.slideIndex || 0,
            is_presenting: state.isPresenting,
            updated_at: timestamp,
          });
      }
    },
    [isHost, sessionId, supabase, state.isPresenting]
  );

  // 슬라이드 이동 (호스트만)
  const goToSlide = useCallback(
    (slideIndex: number) => {
      changeScene({
        ...state.currentScene,
        type: 'slides',
        slideIndex,
      });
    },
    [changeScene, state.currentScene]
  );

  // 다음/이전 슬라이드
  const nextSlide = useCallback(() => {
    const currentIndex = state.currentScene.slideIndex || 0;
    goToSlide(currentIndex + 1);
  }, [goToSlide, state.currentScene.slideIndex]);

  const previousSlide = useCallback(() => {
    const currentIndex = state.currentScene.slideIndex || 0;
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }, [goToSlide, state.currentScene.slideIndex]);

  // Scene 타입 변경 (호스트만)
  const switchToScene = useCallback(
    (type: SceneType, linkedSessionCode?: string) => {
      changeScene({
        type,
        itemIndex: state.currentScene.itemIndex,
        linkedSessionCode,
      });
    },
    [changeScene, state.currentScene.itemIndex]
  );

  // 프레젠테이션 시작/종료 (호스트만)
  const togglePresenting = useCallback(async () => {
    if (!isHost) return;

    const newIsPresenting = !state.isPresenting;
    const timestamp = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      isPresenting: newIsPresenting,
      lastUpdated: timestamp,
    }));

    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'scene-change',
        payload: {
          scene: state.currentScene,
          isPresenting: newIsPresenting,
          timestamp,
        },
      });
    }

    if (supabase) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('presentation_states')
        .upsert({
          session_id: sessionId,
          current_slide: state.currentScene.slideIndex || 0,
          is_presenting: newIsPresenting,
          updated_at: timestamp,
        });
    }
  }, [isHost, state, sessionId, supabase]);

  return {
    ...state,
    changeScene,
    goToSlide,
    nextSlide,
    previousSlide,
    switchToScene,
    togglePresenting,
  };
}

export default useSlideSync;
