/**
 * 투표 유형
 */
export type PollType = 'single' | 'multiple' | 'ranking';

/**
 * 투표 (Poll)
 */
export interface Poll {
  id: string; // nanoid (8자리)
  title: string; // 투표 질문
  type: PollType; // 투표 유형
  options: string[]; // 선택지 배열
  createdAt: Date; // 생성 시간
  expiresAt?: Date; // 선택적 만료 시간
  allowAnonymous: boolean; // 익명 투표 허용 (기본 true)
  isCloudMode?: boolean; // Supabase 클라우드 모드 (크로스 디바이스 지원)
}

/**
 * 투표 응답 (Vote)
 */
export interface Vote {
  id: string; // nanoid
  pollId: string; // 투표 ID
  selection: number | number[]; // 선택 인덱스 (단일/복수/순위)
  timestamp: Date; // 투표 시간
  participantId?: string; // 참가자 ID (취소 시 필요)
  isCancelled?: boolean; // 취소 여부
}

/**
 * 투표 결과 (집계)
 */
export interface PollResult {
  option: string; // 선택지
  count: number; // 득표수
  percentage: number; // 비율 (%)
  rank?: number; // 순위 (순위 투표 시)
  score?: number; // 점수 (순위 투표 시)
}

/**
 * 호스트 상태
 */
export interface HostState {
  poll: Poll;
  votes: Vote[];
  results: PollResult[];
  totalVotes: number;
  isActive: boolean;
}

/**
 * 투표 리포트 (통합 분석)
 */
export interface PollReport {
  pollId: string;
  title: string;
  type: PollType;
  options: string[];
  createdAt: Date;
  closedAt?: Date;
  totalVotes: number;
  cancelledVotes: number;
  uniqueParticipants: number;
  results: PollResult[];
  timeline: Array<{
    timestamp: Date;
    cumulativeVotes: number;
    optionBreakdown: Record<number, number>;
  }>;
  demographics?: {
    anonymousVotes: number;
    identifiedVotes: number;
  };
}
