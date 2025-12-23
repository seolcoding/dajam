/**
 * Interactions Feature Module
 * 모든 인터랙션 컴포넌트 및 타입을 통합 re-export
 *
 * 사용 예시:
 * import { QuizHost, ThisOrThatParticipant, ReactionBar } from '@/features/interactions';
 */

// Quiz
export {
  QuizHost,
  QuizParticipant,
  QuizLeaderboard,
  type QuizHostProps,
  type QuizParticipantProps,
  type QuizLeaderboardProps,
  type QuestionType,
  type QuizQuestion,
  type QuizSettings,
  type Quiz,
  type GameState,
  type ParticipantAnswer,
  type LeaderboardEntry as QuizLeaderboardEntry,
  type ScoreCalculation,
  type ParticipantState as QuizParticipantState,
  type HostEvent,
  type ParticipantEvent,
  type QuizSessionConfig,
  type AnswerStats,
  OPTION_STYLES,
} from './quiz';

// This or That
export {
  ThisOrThatHost,
  ThisOrThatParticipant,
  type ThisOrThatHostProps,
  type ThisOrThatParticipantProps,
  type QuestionStatus,
  type ThisOrThatQuestion,
  type Vote as ThisOrThatVote,
  type ThisOrThatConfig,
  type VoteCount,
  type ThisOrThatParticipantType,
} from './this-or-that';

// Word Cloud
export {
  WordCloudVisualization,
  WordCloudStats,
  type WordCloudVisualizationProps,
  type WordCloudStatsProps,
  type WordCloudSession,
  type WordCloudSettings,
  type WordEntry,
  type WordCount,
  type ColorScheme,
  type WordValidationResult,
  DEFAULT_SETTINGS as WORD_CLOUD_DEFAULT_SETTINGS,
  COLOR_PALETTES,
} from './word-cloud';

// Personality Test
export {
  type DimensionId,
  type PersonalityDimension,
  type TestQuestion,
  type Answer as PersonalityAnswer,
  type DimensionScore,
  type PersonalityCode,
  type PersonalityType,
  type TestResult,
  type GroupSession as PersonalityGroupSession,
  type Participant as PersonalityParticipant,
  type TypeDistribution,
  type DimensionDistribution,
} from './personality';

// Human Bingo
export {
  type TraitCategory,
  type TraitDifficulty,
  type Trait,
  type WinCondition,
  type GridSize,
  type SessionSettings as BingoSessionSettings,
  type HumanBingoConfig,
  type BingoCell,
  type BingoLine,
  type ParticipantCard,
  type LeaderboardEntry as BingoLeaderboardEntry,
  type ViewMode as BingoViewMode,
} from './bingo';

// Common Components
export {
  ReactionBar,
  ParticipantCount,
  ConnectionStatus,
  QAPanel,
  ChatPanel,
  type ReactionBarProps,
  type Reaction,
  type ParticipantCountProps,
  type ConnectionStatusProps,
  type ConnectionState,
  type QAPanelProps,
  type QAQuestion,
  type ChatPanelProps,
  type ChatMessageType,
} from './common';
