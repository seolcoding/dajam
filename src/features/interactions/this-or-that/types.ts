/**
 * This or That 타입 정의
 * 공유 컴포넌트용 - audience-engage와 독립 앱에서 모두 사용
 */

export type QuestionStatus = 'waiting' | 'voting' | 'result';

export interface ThisOrThatQuestion {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  imageA?: string;
  imageB?: string;
  category?: string;
}

export interface Vote {
  participantId: string;
  participantName: string;
  choice: 'A' | 'B';
  timestamp: string;
}

export interface ThisOrThatConfig {
  title: string;
  questions: ThisOrThatQuestion[];
}

export interface VoteCount {
  A: number;
  B: number;
}

// Realtime session participant extension
export interface ThisOrThatParticipant {
  id: string;
  name: string;
  joinedAt: string;
  hasVoted: boolean;
}
