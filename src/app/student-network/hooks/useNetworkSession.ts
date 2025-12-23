'use client';

import { useCallback } from 'react';
import { useRealtimeSession } from '@/lib/realtime';
import type { Json, SessionParticipant } from '@/types/database';
import type { Profile } from '../types';

/**
 * student-network 세션 설정
 * session.config에 저장될 데이터 구조
 */
export interface StudentNetworkConfig {
  roomName: string;
  createdBy: string; // Profile ID
  description?: string;
}

/**
 * 참여자 메타데이터
 * session_participants.metadata에 저장될 프로필 정보
 */
export interface ParticipantMetadata {
  name: string;
  tagline: string;
  field: string;
  interests: string[];
  contacts: {
    email?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
  avatarUrl?: string;
}

/**
 * student-network 전용 세션 훅
 * - 교실(Room) 생성/참여
 * - 참여자 프로필 실시간 동기화
 * - 로컬/클라우드 모드 지원
 */
export function useNetworkSession(sessionCode: string, enabled = true) {
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
  } = useRealtimeSession<StudentNetworkConfig>({
    appType: 'student-network',
    sessionCode,
    enabled,
    transformConfig: (rawConfig: Json) => {
      // JSON에서 StudentNetworkConfig로 안전하게 변환
      const config = rawConfig as Record<string, unknown>;
      return {
        roomName: (config.roomName as string) || '',
        createdBy: (config.createdBy as string) || '',
        description: config.description as string | undefined,
      };
    },
  });

  /**
   * 교실 생성
   */
  const createRoom = useCallback(
    async (params: {
      roomName: string;
      createdBy: string;
      description?: string;
      hostProfile: Profile;
    }): Promise<string | null> => {
      const sessionConfig: StudentNetworkConfig = {
        roomName: params.roomName,
        createdBy: params.createdBy,
        description: params.description,
      };

      const code = await createSession({
        appType: 'student-network',
        title: params.roomName,
        config: sessionConfig,
        isPublic: true,
      });

      if (!code) return null;

      // 호스트 자동 참여 (프로필 정보를 메타데이터로 저장)
      const metadata: ParticipantMetadata = {
        name: params.hostProfile.name,
        tagline: params.hostProfile.tagline,
        field: params.hostProfile.field,
        interests: params.hostProfile.interests,
        contacts: params.hostProfile.contacts,
        avatarUrl: params.hostProfile.avatarUrl,
      };

      await joinSession({
        displayName: params.hostProfile.name,
        metadata: metadata as unknown as Json,
      });

      return code;
    },
    [createSession, joinSession]
  );

  /**
   * 교실 참여
   */
  const joinRoom = useCallback(
    async (profile: Profile): Promise<SessionParticipant | null> => {
      const metadata: ParticipantMetadata = {
        name: profile.name,
        tagline: profile.tagline,
        field: profile.field,
        interests: profile.interests,
        contacts: profile.contacts,
        avatarUrl: profile.avatarUrl,
      };

      return await joinSession({
        displayName: profile.name,
        metadata: metadata as unknown as Json,
      });
    },
    [joinSession]
  );

  /**
   * 참여자를 Profile 형태로 변환
   */
  const getProfiles = useCallback((): Profile[] => {
    return participants.map((p) => {
      const meta = p.metadata as unknown as ParticipantMetadata;
      return {
        id: p.id, // participant ID를 profile ID로 사용
        name: meta.name,
        tagline: meta.tagline,
        field: meta.field,
        interests: meta.interests,
        contacts: meta.contacts,
        avatarUrl: meta.avatarUrl,
        createdAt: p.joined_at,
      };
    });
  }, [participants]);

  /**
   * 특정 참여자를 Profile로 변환
   */
  const getProfileById = useCallback(
    (participantId: string): Profile | null => {
      const participant = participants.find((p) => p.id === participantId);
      if (!participant) return null;

      const meta = participant.metadata as unknown as ParticipantMetadata;
      return {
        id: participant.id,
        name: meta.name,
        tagline: meta.tagline,
        field: meta.field,
        interests: meta.interests,
        contacts: meta.contacts,
        avatarUrl: meta.avatarUrl,
        createdAt: participant.joined_at,
      };
    },
    [participants]
  );

  return {
    // 세션 정보
    session,
    sessionId,
    roomName: config?.roomName || null,
    description: config?.description || null,

    // 참여자
    participants,
    profiles: getProfiles(),
    getProfileById,
    participantCount: participants.length,

    // 상태
    isLoading,
    error,
    isCloudMode,
    connectionStatus,
    isConnected,

    // 액션
    createRoom,
    joinRoom,
    closeSession,
    reload,
  };
}
