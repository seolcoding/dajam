/**
 * Quiz Interaction Feature
 * 퀴즈 관련 공유 컴포넌트 및 타입 re-export
 */

// 컴포넌트
export { QuizHost, type QuizHostProps } from './QuizHost';
export { QuizParticipant, type QuizParticipantProps } from './QuizParticipant';
export { QuizLeaderboard, type QuizLeaderboardProps } from './QuizLeaderboard';

// 타입
export type {
  QuestionType,
  QuizQuestion,
  QuizSettings,
  Quiz,
  GameState,
  ParticipantAnswer,
  LeaderboardEntry,
  ScoreCalculation,
  ParticipantState,
  HostEvent,
  ParticipantEvent,
  QuizSessionConfig,
  AnswerStats,
} from './types';

export { OPTION_STYLES } from './types';
