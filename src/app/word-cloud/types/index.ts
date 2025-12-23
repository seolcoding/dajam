/**
 * Word Cloud Types
 */

export interface WordCloudSession {
  id: string; // 6자리 코드
  hostId: string;
  title: string; // "오늘 기분을 한 단어로 표현하면?"
  settings: WordCloudSettings;
  status: 'collecting' | 'closed';
  createdAt: string;
  isCloudMode?: boolean;
}

export interface WordCloudSettings {
  maxWordsPerPerson: number; // 1인당 최대 단어 수 (1-5)
  allowDuplicates: boolean; // 같은 단어 중복 허용
  minWordLength: number; // 최소 단어 길이
  maxWordLength: number; // 최대 단어 길이
  colorScheme: ColorScheme; // 색상 테마
  fontFamily: string; // 폰트
  shape: 'circle' | 'rectangle' | 'heart'; // 구름 모양
}

export interface WordEntry {
  id: string;
  sessionId: string;
  word: string;
  participantId: string;
  participantName?: string;
  createdAt: string;
}

export interface WordCount {
  text: string;
  value: number; // 빈도
}

export type ColorScheme =
  | 'rainbow' // 무지개색
  | 'ocean' // 파랑 계열
  | 'sunset' // 주황/분홍 계열
  | 'forest' // 초록 계열
  | 'mono' // 단색
  | 'custom'; // 사용자 정의

export interface WordValidationResult {
  valid: boolean;
  error?: string;
}

// Default settings
export const DEFAULT_SETTINGS: WordCloudSettings = {
  maxWordsPerPerson: 3,
  allowDuplicates: true,
  minWordLength: 1,
  maxWordLength: 20,
  colorScheme: 'rainbow',
  fontFamily: 'Pretendard',
  shape: 'rectangle',
};
