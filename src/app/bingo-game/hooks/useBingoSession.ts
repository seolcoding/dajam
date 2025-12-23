'use client';

import { useRealtimeSession } from '@/lib/realtime/hooks/useRealtimeSession';
import type { BingoConfig } from '../types/bingo.types';
import type { Json } from '@/types/database';

/**
 * Bingo 게임용 실시간 세션 훅
 * @/lib/realtime의 useRealtimeSession을 감싸서 bingo 앱에 특화된 인터페이스 제공
 */

interface BingoSessionConfig {
  type: 'number' | 'word' | 'theme';
  gridSize: 3 | 4 | 5;
  items: string[];
  winConditions: string[];
  centerFree: boolean;
}

export interface UseBingoSessionOptions {
  gameCode: string | null;
  enabled?: boolean;
  onSessionLoaded?: () => void;
  onConnectionChange?: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
}

/**
 * Bingo 게임을 위한 실시간 세션 관리
 * - 세션 생성/로드
 * - 참여자 실시간 동기화
 * - 클라우드/로컬 모드 전환
 */
export function useBingoSession({
  gameCode,
  enabled = true,
  onSessionLoaded,
  onConnectionChange,
}: UseBingoSessionOptions) {
  // Transform Supabase config to BingoConfig
  const transformConfig = (config: Json): BingoConfig => {
    const bingoConfig = config as unknown as BingoSessionConfig;
    return {
      type: bingoConfig.type,
      gridSize: bingoConfig.gridSize,
      items: bingoConfig.items,
      winConditions: bingoConfig.winConditions as ('single-line' | 'double-line' | 'triple-line' | 'four-corners' | 'full-house')[],
      centerFree: bingoConfig.centerFree,
    };
  };

  // useRealtimeSession을 사용하여 세션 관리
  const {
    session,
    sessionId,
    config,
    participants,
    isLoading,
    error,
    isCloudMode,
    connectionStatus,
    isConnected,
    createSession,
    joinSession,
    closeSession,
    reload,
  } = useRealtimeSession<BingoConfig>({
    appType: 'bingo-game',
    sessionCode: gameCode || '',
    enabled: enabled && !!gameCode,
    dataTable: 'session_participants',
    transformConfig,
    onSessionLoaded,
    onConnectionChange,
  });

  // 세션 생성 헬퍼
  const createBingoSession = async (
    title: string,
    bingoConfig: BingoConfig
  ): Promise<string | null> => {
    const code = await createSession({
      appType: 'bingo-game',
      title,
      config: bingoConfig, // BingoConfig is TConfig here
      isPublic: true,
    });
    return code;
  };

  // 세션 참여 헬퍼
  const joinBingoSession = async (displayName: string) => {
    return await joinSession({ displayName });
  };

  return {
    // 세션 상태
    session,
    sessionId,
    config,
    participants,
    participantCount: participants.length,

    // 로딩/에러 상태
    isLoading,
    error,

    // 모드 상태
    isCloudMode,
    connectionStatus,
    isConnected,

    // 액션
    createBingoSession,
    joinBingoSession,
    closeSession,
    reload,
  };
}
