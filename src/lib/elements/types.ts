/**
 * Element Types and Schemas for V2 Content Layer
 *
 * 이 파일은 session_elements, element_responses, element_aggregates 테이블과
 * 상호작용하는 모든 타입 정의를 포함합니다.
 */

import type { Json, SessionElement, ElementResponse, ElementAggregate } from '@/types/database';

// ============================================
// Element Types (19 types)
// ============================================

export type ElementType =
  | 'poll'
  | 'quiz'
  | 'word_cloud'
  | 'balance_game'
  | 'ladder'
  | 'qna'
  | 'survey'
  | 'bingo'
  | 'ideal_worldcup'
  | 'team_divider'
  | 'personality_test'
  | 'this_or_that'
  | 'chosung_quiz'
  | 'realtime_quiz'
  | 'human_bingo'
  | 'reaction'
  | 'ranking'
  | 'open_ended'
  | 'lucky_draw';

export type ResponseType =
  | 'vote'
  | 'answer'
  | 'reaction'
  | 'submission'
  | 'choice'
  | 'multiple_choice'
  | 'ranking'
  | 'text';

// ============================================
// Poll Element
// ============================================

export interface PollOption {
  id: string;
  text: string;
  color?: string;
  imageUrl?: string;
}

export interface PollElementConfig {
  type: 'single' | 'multiple' | 'ranking';
  options: PollOption[];
  allowAnonymous: boolean;
  showResultsLive: boolean;
  timeLimit?: number; // seconds, optional
  maxSelections?: number; // for multiple type
}

export interface PollElementState {
  isOpen: boolean;
  totalResponses: number;
  closedAt?: string;
  revealedAt?: string;
}

export interface PollResponseData {
  selectedOption: string; // option id for single
  selectedOptions?: string[]; // for multiple
  ranking?: string[]; // for ranking type - ordered option ids
}

// ============================================
// Quiz Element
// ============================================

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | number;
  points: number;
  timeLimit?: number; // seconds per question
  imageUrl?: string;
  explanation?: string; // shown after answer
}

export interface QuizElementConfig {
  questions: QuizQuestion[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswer: boolean;
  showLeaderboard: boolean;
  speedBonus: boolean; // faster = more points
  passingScore?: number; // minimum score to pass
}

export interface QuizElementState {
  currentQuestionIndex: number;
  isQuestionActive: boolean;
  isRevealed: boolean;
  questionStartedAt?: string;
  completedParticipants: number;
}

export interface QuizResponseData {
  questionId: string;
  answer: string | number;
  answeredAt: number; // timestamp for speed bonus
}

export interface QuizLeaderboardEntry {
  participantId: string;
  displayName: string;
  score: number;
  correctCount: number;
  averageResponseTime: number;
}

// ============================================
// Word Cloud Element
// ============================================

export interface WordCloudElementConfig {
  prompt: string;
  maxWords: number; // max total words collected
  maxWordsPerPerson: number; // max words per participant
  minLength: number;
  maxLength: number;
  allowDuplicates: boolean;
  profanityFilter: boolean;
  caseSensitive: boolean;
}

export interface WordCloudElementState {
  isOpen: boolean;
  totalWords: number;
  uniqueWords: number;
}

export interface WordCloudResponseData {
  word: string;
}

export interface WordCloudResult {
  text: string;
  count: number;
  participants: string[]; // participant ids who submitted
}

// ============================================
// Balance Game Element
// ============================================

export interface BalanceGameQuestion {
  id: string;
  optionA: {
    text: string;
    imageUrl?: string;
    color?: string;
  };
  optionB: {
    text: string;
    imageUrl?: string;
    color?: string;
  };
}

export interface BalanceGameElementConfig {
  questions: BalanceGameQuestion[];
  showResultsAfterEach: boolean;
  allowChange: boolean; // can change answer
}

export interface BalanceGameElementState {
  currentQuestionIndex: number;
  isOpen: boolean;
  results: Record<string, { a: number; b: number }>; // questionId -> counts
}

export interface BalanceGameResponseData {
  questionId: string;
  choice: 'a' | 'b';
}

// ============================================
// Lucky Draw Element (Phase 6)
// ============================================

export interface LuckyDrawPrize {
  id: string;
  name: string;
  count: number;
  imageUrl?: string;
  description?: string;
}

export interface LuckyDrawElementConfig {
  prizes: LuckyDrawPrize[];
  animationType: 'slot' | 'wheel' | 'confetti';
  excludePreviousWinners: boolean;
  requireAttendance: boolean;
  eligibleParticipantIds?: string[]; // if specified, only these can win
}

export interface LuckyDrawElementState {
  isDrawing: boolean;
  drawnPrizes: Array<{
    prizeId: string;
    winnerId: string;
    winnerName: string;
    drawnAt: string;
  }>;
  remainingPrizes: Record<string, number>; // prizeId -> remaining count
}

export interface LuckyDrawResponseData {
  prizeId: string;
  isWinner: boolean;
}

// ============================================
// Type Guards
// ============================================

export function isPollConfig(config: unknown): config is PollElementConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  return (
    typeof c.type === 'string' &&
    ['single', 'multiple', 'ranking'].includes(c.type) &&
    Array.isArray(c.options)
  );
}

export function isQuizConfig(config: unknown): config is QuizElementConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  return Array.isArray(c.questions);
}

export function isWordCloudConfig(config: unknown): config is WordCloudElementConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  return typeof c.prompt === 'string' && typeof c.maxWords === 'number';
}

export function isBalanceGameConfig(config: unknown): config is BalanceGameElementConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  return Array.isArray(c.questions);
}

export function isLuckyDrawConfig(config: unknown): config is LuckyDrawElementConfig {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return false;
  const c = config as Record<string, unknown>;
  return (
    Array.isArray(c.prizes) &&
    typeof c.animationType === 'string' &&
    ['slot', 'wheel', 'confetti'].includes(c.animationType)
  );
}

// ============================================
// Helper Types
// ============================================

/** Typed SessionElement with specific config type */
export interface TypedSessionElement<TConfig, TState = Json> extends Omit<SessionElement, 'config' | 'state'> {
  config: TConfig;
  state: TState;
}

export type PollElement = TypedSessionElement<PollElementConfig, PollElementState>;
export type QuizElement = TypedSessionElement<QuizElementConfig, QuizElementState>;
export type WordCloudElement = TypedSessionElement<WordCloudElementConfig, WordCloudElementState>;
export type BalanceGameElement = TypedSessionElement<BalanceGameElementConfig, BalanceGameElementState>;
export type LuckyDrawElement = TypedSessionElement<LuckyDrawElementConfig, LuckyDrawElementState>;

/** Typed ElementResponse with specific data type */
export interface TypedElementResponse<TData> extends Omit<ElementResponse, 'data'> {
  data: TData;
}

export type PollResponse = TypedElementResponse<PollResponseData>;
export type QuizResponse = TypedElementResponse<QuizResponseData>;
export type WordCloudResponse = TypedElementResponse<WordCloudResponseData>;
export type BalanceGameResponse = TypedElementResponse<BalanceGameResponseData>;

// ============================================
// Create/Update Input Types
// ============================================

export interface CreateElementInput {
  session_id: string;
  element_type: ElementType;
  title: string;
  description?: string;
  config: Json;
  order_index?: number;
  starts_at?: string;
  ends_at?: string;
}

export interface UpdateElementInput {
  title?: string;
  description?: string;
  config?: Json;
  state?: Json;
  order_index?: number;
  is_active?: boolean;
  is_visible?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
}

export interface CreateResponseInput {
  element_id: string;
  session_id: string;
  response_type: ResponseType;
  data: Json;
  participant_id?: string;
  user_id?: string;
  anonymous_id?: string;
  display_name?: string;
  score?: number;
  is_correct?: boolean;
}

// ============================================
// Default Configs
// ============================================

export const DEFAULT_POLL_CONFIG: PollElementConfig = {
  type: 'single',
  options: [
    { id: '1', text: '옵션 1' },
    { id: '2', text: '옵션 2' },
  ],
  allowAnonymous: true,
  showResultsLive: true,
};

export const DEFAULT_POLL_STATE: PollElementState = {
  isOpen: true,
  totalResponses: 0,
};

export const DEFAULT_QUIZ_CONFIG: QuizElementConfig = {
  questions: [
    {
      id: '1',
      text: '질문을 입력하세요',
      type: 'multiple_choice',
      options: ['보기 1', '보기 2', '보기 3', '보기 4'],
      correctAnswer: 0,
      points: 10,
    },
  ],
  shuffleQuestions: false,
  shuffleOptions: false,
  showCorrectAnswer: true,
  showLeaderboard: true,
  speedBonus: true,
};

export const DEFAULT_QUIZ_STATE: QuizElementState = {
  currentQuestionIndex: 0,
  isQuestionActive: false,
  isRevealed: false,
  completedParticipants: 0,
};

export const DEFAULT_WORD_CLOUD_CONFIG: WordCloudElementConfig = {
  prompt: '한 단어로 표현해주세요',
  maxWords: 200,
  maxWordsPerPerson: 3,
  minLength: 1,
  maxLength: 20,
  allowDuplicates: true,
  profanityFilter: true,
  caseSensitive: false,
};

export const DEFAULT_WORD_CLOUD_STATE: WordCloudElementState = {
  isOpen: true,
  totalWords: 0,
  uniqueWords: 0,
};

// ============================================
// Aggregate Helpers
// ============================================

export interface AggregateMap {
  [key: string]: number;
}

export function aggregatesToMap(aggregates: ElementAggregate[]): AggregateMap {
  return aggregates.reduce((map, agg) => {
    map[agg.aggregate_key] = agg.count;
    return map;
  }, {} as AggregateMap);
}

export function getTotalFromAggregates(aggregates: ElementAggregate[]): number {
  return aggregates.reduce((sum, agg) => sum + agg.count, 0);
}

export function getPercentages(aggregates: ElementAggregate[]): Record<string, number> {
  const total = getTotalFromAggregates(aggregates);
  if (total === 0) return {};

  return aggregates.reduce((map, agg) => {
    map[agg.aggregate_key] = (agg.count / total) * 100;
    return map;
  }, {} as Record<string, number>);
}
