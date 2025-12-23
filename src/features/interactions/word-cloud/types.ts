/**
 * Word Cloud 타입 정의
 * 공유 컴포넌트용 - audience-engage와 독립 앱에서 모두 사용
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

// Color palettes
export const COLOR_PALETTES: Record<ColorScheme, string[]> = {
  rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  ocean: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'],
  sunset: ['#FF6B6B', '#FF8E72', '#FFB347', '#FFD93D', '#FF69B4'],
  forest: ['#2D5016', '#4A7C23', '#6B8E23', '#9ACD32', '#98D8C8'],
  mono: ['#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080'],
  custom: ['#3B82F6', '#8B5CF6', '#EC4899'],
};
