'use client';

/**
 * 이상형 월드컵 세션 기반 멀티플레이어 훅
 * - 호스트가 세션 생성 → 참여자들이 QR/코드로 참여
 * - 실시간으로 참여자들의 토너먼트 진행상황 확인
 * - 완료 후 결과 집계 및 비교
 */

import { useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useRealtimeSession } from '@/lib/realtime';
import type { Candidate, Tournament } from '../types';
import type { SessionParticipant, Json } from '@/types/database';

// 세션 설정
export interface WorldcupSessionConfig {
  tournament: Tournament;
  hostName: string;
}

// 참여자 메타데이터
export interface ParticipantMetadata {
  currentRound: number;
  currentMatchIndex: number;
  selections: Record<string, string>; // matchId -> candidateId (winner)
  completedAt: string | null;
  winner?: Candidate;
  runnerUp?: Candidate;
}

// 참여자 상태 (SessionParticipant와 별도 타입으로 정의)
export interface WorldcupParticipant {
  id: string;
  session_id: string;
  user_id: string | null;
  display_name: string;
  role: 'host' | 'participant';
  is_banned: boolean;
  joined_at: string;
  metadata: ParticipantMetadata;
}

interface UseWorldcupSessionOptions {
  sessionCode?: string;
  enabled?: boolean;
}

// 세션 생성 옵션
export interface CreateWorldcupSessionOptions {
  tournament: Tournament;
  hostName: string;
  maxParticipants?: number;
}

export function useWorldcupSession({ sessionCode, enabled = true }: UseWorldcupSessionOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;

  // 제네릭 세션 훅 사용
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
    createSession: createRealtimeSession,
    joinSession: joinRealtimeSession,
    closeSession,
    reload,
    loadData,
  } = useRealtimeSession<WorldcupSessionConfig, never>({
    appType: 'ideal-worldcup',
    sessionCode: sessionCode || '',
    enabled: enabled && !!sessionCode,
    dataTable: 'session_participants',
    dataEvent: '*',
    transformConfig: (raw) => raw as unknown as WorldcupSessionConfig,
  });

  // 타입 안전한 참여자 목록 (unknown을 거쳐서 변환)
  const typedParticipants = participants as unknown as WorldcupParticipant[];

  // 세션 생성
  const createWorldcupSession = useCallback(
    async (options: CreateWorldcupSessionOptions): Promise<string | null> => {
      const code = await createRealtimeSession({
        appType: 'ideal-worldcup',
        title: options.tournament.title,
        config: {
          tournament: options.tournament,
          hostName: options.hostName,
        },
        maxParticipants: options.maxParticipants,
        isPublic: true,
      });

      return code;
    },
    [createRealtimeSession]
  );

  // 세션 참여
  const joinWorldcupSession = useCallback(
    async (displayName: string): Promise<WorldcupParticipant | null> => {
      if (!config?.tournament) return null;

      const metadata: ParticipantMetadata = {
        currentRound: config.tournament.totalRounds,
        currentMatchIndex: 0,
        selections: {},
        completedAt: null,
      };

      const participant = await joinRealtimeSession({
        displayName,
        metadata: metadata as unknown as Json,
      });

      return participant as WorldcupParticipant | null;
    },
    [config, joinRealtimeSession]
  );

  // 선택 제출 (승자 선택)
  const submitSelection = useCallback(
    async (
      participantId: string,
      matchId: string,
      winnerId: string,
      nextRound: number,
      nextMatchIndex: number,
      isComplete: boolean,
      winner?: Candidate,
      runnerUp?: Candidate
    ): Promise<boolean> => {
      if (!sessionId) return false;

      try {
        const participant = typedParticipants.find((p) => p.id === participantId);
        if (!participant) return false;

        const newSelections = { ...participant.metadata.selections, [matchId]: winnerId };
        const completedAt = isComplete ? new Date().toISOString() : null;

        const updatedMetadata: ParticipantMetadata = {
          currentRound: nextRound,
          currentMatchIndex: nextMatchIndex,
          selections: newSelections,
          completedAt,
          winner,
          runnerUp,
        };

        // Supabase에 직접 업데이트
        const { error: updateError } = await supabase
          .from('session_participants')
          .update({
            metadata: updatedMetadata as unknown as Json,
          })
          .eq('id', participantId);

        if (updateError) throw updateError;

        // 데이터 새로고침
        await loadData();

        return true;
      } catch (err) {
        console.error('Failed to submit selection:', err);
        return false;
      }
    },
    [sessionId, typedParticipants, loadData, supabase]
  );

  // 완료된 참여자 수
  const completedCount = typedParticipants.filter(
    (p) => p.metadata?.completedAt
  ).length;

  // 우승자 통계 (집계)
  const winnerStats = typedParticipants
    .filter((p) => p.metadata?.winner)
    .reduce((acc, p) => {
      const winnerId = p.metadata.winner!.id;
      if (!acc[winnerId]) {
        acc[winnerId] = {
          candidate: p.metadata.winner!,
          count: 0,
          participants: [],
        };
      }
      acc[winnerId].count++;
      acc[winnerId].participants.push(p.display_name);
      return acc;
    }, {} as Record<string, { candidate: Candidate; count: number; participants: string[] }>);

  return {
    // State
    session,
    sessionId,
    tournament: config?.tournament || null,
    hostName: config?.hostName || '',
    participants: typedParticipants,
    isLoading,
    error,
    isCloudMode,
    connectionStatus,
    isConnected,
    completedCount,
    winnerStats: Object.values(winnerStats).sort((a, b) => b.count - a.count),

    // Actions
    createSession: createWorldcupSession,
    joinSession: joinWorldcupSession,
    submitSelection,
    closeSession,
    reload,
  };
}
