'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'dajam_participant';
const SESSIONS_KEY = 'dajam_sessions';

interface ParticipantInfo {
  id: string;
  displayName?: string;
  createdAt: string;
}

interface SessionParticipation {
  sessionCode: string;
  sessionId: string;
  participantRecordId: string; // DB의 session_participants.id
  displayName: string;
  joinedAt: string;
  appType: string;
}

interface StoredSessions {
  [sessionCode: string]: SessionParticipation;
}

/**
 * useParticipantPersistence - 참여자 세션 퍼시스턴스 훅
 *
 * 브라우저를 닫아도 세션에 재참여할 수 있도록:
 * 1. 디바이스별 고유 참여자 ID 생성/저장
 * 2. 세션 참여 정보 로컬 스토리지에 저장
 * 3. 세션 재참여 시 기존 정보 복구
 *
 * @example
 * const {
 *   participantId,
 *   getSessionParticipation,
 *   saveSessionParticipation,
 *   clearSession
 * } = useParticipantPersistence();
 */
export function useParticipantPersistence() {
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [sessions, setSessions] = useState<StoredSessions>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기 로드 - localStorage에서 참여자 정보 읽기
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // 참여자 ID 로드 또는 생성
      const storedParticipant = localStorage.getItem(STORAGE_KEY);
      let participant: ParticipantInfo;

      if (storedParticipant) {
        participant = JSON.parse(storedParticipant);
      } else {
        // 새 참여자 ID 생성
        participant = {
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(participant));
      }
      setParticipantInfo(participant);

      // 세션 참여 정보 로드
      const storedSessions = localStorage.getItem(SESSIONS_KEY);
      if (storedSessions) {
        setSessions(JSON.parse(storedSessions));
      }

      setIsLoaded(true);
    } catch (error) {
      console.error('[ParticipantPersistence] Failed to load:', error);
      // 에러 시 새로 생성
      const participant: ParticipantInfo = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(participant));
      setParticipantInfo(participant);
      setIsLoaded(true);
    }
  }, []);

  // 세션 참여 정보 저장
  const saveSessionParticipation = useCallback((participation: SessionParticipation) => {
    if (typeof window === 'undefined') return;

    setSessions(prev => {
      const updated = {
        ...prev,
        [participation.sessionCode.toUpperCase()]: participation,
      };
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });

    // 참여자 이름도 업데이트
    if (participantInfo && participation.displayName) {
      const updatedParticipant = {
        ...participantInfo,
        displayName: participation.displayName,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedParticipant));
      setParticipantInfo(updatedParticipant);
    }
  }, [participantInfo]);

  // 특정 세션의 참여 정보 조회
  const getSessionParticipation = useCallback((sessionCode: string): SessionParticipation | null => {
    return sessions[sessionCode.toUpperCase()] || null;
  }, [sessions]);

  // 세션 참여 정보 삭제
  const clearSession = useCallback((sessionCode: string) => {
    if (typeof window === 'undefined') return;

    setSessions(prev => {
      const updated = { ...prev };
      delete updated[sessionCode.toUpperCase()];
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 모든 세션 정보 삭제
  const clearAllSessions = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSIONS_KEY);
    setSessions({});
  }, []);

  // 오래된 세션 정리 (24시간 이상)
  const cleanupOldSessions = useCallback(() => {
    if (typeof window === 'undefined') return;

    const now = new Date().getTime();
    const ONE_DAY = 24 * 60 * 60 * 1000;

    setSessions(prev => {
      const updated: StoredSessions = {};
      Object.entries(prev).forEach(([code, participation]) => {
        const joinedAt = new Date(participation.joinedAt).getTime();
        if (now - joinedAt < ONE_DAY) {
          updated[code] = participation;
        }
      });
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 마지막으로 사용한 이름 가져오기
  const getLastUsedName = useCallback((): string | null => {
    return participantInfo?.displayName || null;
  }, [participantInfo]);

  return {
    // 참여자 정보
    participantId: participantInfo?.id || null,
    participantInfo,
    isLoaded,

    // 세션 참여 관리
    sessions,
    getSessionParticipation,
    saveSessionParticipation,
    clearSession,
    clearAllSessions,
    cleanupOldSessions,

    // 유틸리티
    getLastUsedName,
  };
}

export type { ParticipantInfo, SessionParticipation };
