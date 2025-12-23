/**
 * Personality Test 타입 정의
 * 공유 컴포넌트용 - audience-engage와 독립 앱에서 모두 사용
 */

// MBTI Dimension (E/I, S/N, T/F, J/P)
export type DimensionId = 'EI' | 'SN' | 'TF' | 'JP';

export interface PersonalityDimension {
  id: DimensionId;
  name: string;
  left: { code: string; label: string; description: string };
  right: { code: string; label: string; description: string };
}

// Test Question
export interface TestQuestion {
  id: string;
  dimension: DimensionId;
  text: string;
  optionLeft: string;   // E, S, T, J 방향
  optionRight: string;  // I, N, F, P 방향
}

// User Answer
export interface Answer {
  questionId: string;
  dimension: DimensionId;
  direction: 'left' | 'right';  // left = E/S/T/J, right = I/N/F/P
}

// Dimension Score
export interface DimensionScore {
  dimension: DimensionId;
  left: number;   // E, S, T, J 점수
  right: number;  // I, N, F, P 점수
  percentage: number; // 우세한 쪽 비율
  dominant: 'left' | 'right';
}

// Personality Type (16 types)
export type PersonalityCode =
  | 'ESTJ' | 'ESTP' | 'ESFJ' | 'ESFP'
  | 'ENTJ' | 'ENTP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISTP' | 'ISFJ' | 'ISFP'
  | 'INTJ' | 'INTP' | 'INFJ' | 'INFP';

export interface PersonalityType {
  code: PersonalityCode;
  name: string;
  emoji: string;
  shortDescription: string;
  longDescription: string;
  strengths: string[];
  weaknesses: string[];
  compatibility: {
    best: PersonalityCode[];
    good: PersonalityCode[];
    challenging: PersonalityCode[];
  };
  famousExamples: string[];
  careers: string[];
  color: string; // 배경색
}

// Test Result
export interface TestResult {
  code: PersonalityCode;
  scores: DimensionScore[];
  completedAt: string;
}

// Group Session (for multiplayer mode)
export interface GroupSession {
  id: string;
  code: string;
  status: 'waiting' | 'testing' | 'results';
  createdAt: string;
}

export interface Participant {
  id: string;
  sessionId: string;
  nickname: string;
  result?: PersonalityCode;
  scores?: DimensionScore[];
  completedAt?: string;
}

// Type Distribution for group results
export interface TypeDistribution {
  type: PersonalityCode;
  count: number;
  percentage: number;
}

export interface DimensionDistribution {
  dimension: DimensionId;
  left: number;
  right: number;
  leftPercentage: number;
  rightPercentage: number;
}
