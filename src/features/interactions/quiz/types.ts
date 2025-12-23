/**
 * Realtime Quiz 타입 정의
 * 공유 컴포넌트용 - audience-engage와 독립 앱에서 모두 사용
 */

// 질문 타입
export type QuestionType = 'multiple' | 'truefalse';

// 퀴즈 질문
export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctIndex: number;
  timeLimit: number; // 초
  points: number;
  imageUrl?: string;
}

// 퀴즈 설정
export interface QuizSettings {
  showLeaderboardAfterEach: boolean;
  randomizeQuestionOrder: boolean;
  randomizeOptionOrder: boolean;
  speedBonus: boolean;
  streakBonus: boolean;
}

// 퀴즈 템플릿
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings: QuizSettings;
  createdAt: string;
  createdBy: string;
}

// 게임 상태
export type GameState =
  | 'waiting' // 대기 중
  | 'countdown' // 3-2-1 카운트다운
  | 'question' // 질문 표시 중
  | 'revealing' // 정답 공개
  | 'leaderboard' // 리더보드 표시
  | 'finished'; // 게임 종료

// 참가자 답변
export interface ParticipantAnswer {
  participantId: string;
  questionId: string;
  answerIndex: number;
  timeLeft: number;
  isCorrect: boolean;
  pointsEarned: number;
  submittedAt: string;
}

// 리더보드 엔트리
export interface LeaderboardEntry {
  participantId: string;
  nickname: string;
  score: number;
  rank: number;
  correctCount: number;
  streak: number;
  avatarColor?: string;
}

// 점수 계산 결과
export interface ScoreCalculation {
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  totalPoints: number;
}

// 참가자 상태
export interface ParticipantState {
  id: string;
  nickname: string;
  totalScore: number;
  correctCount: number;
  currentStreak: number;
  answers: Record<string, ParticipantAnswer>; // questionId -> answer
  isReady: boolean;
  joinedAt: string;
}

// 호스트 이벤트 (호스트 → 참가자)
export type HostEvent =
  | { type: 'game_start' }
  | { type: 'countdown'; count: number }
  | { type: 'question_show'; question: QuizQuestion; questionNumber: number; totalQuestions: number }
  | { type: 'timer_sync'; timeLeft: number }
  | { type: 'question_end' }
  | { type: 'answer_reveal'; correctIndex: number; correctOption: string }
  | { type: 'leaderboard_show'; leaderboard: LeaderboardEntry[] }
  | { type: 'game_end'; finalLeaderboard: LeaderboardEntry[] };

// 참가자 이벤트 (참가자 → 호스트)
export type ParticipantEvent =
  | { type: 'answer_submit'; participantId: string; questionId: string; answerIndex: number; timeLeft: number }
  | { type: 'player_ready'; participantId: string }
  | { type: 'player_join'; participantId: string; nickname: string }
  | { type: 'player_leave'; participantId: string };

// 세션 설정
export interface QuizSessionConfig {
  quizId: string;
  quiz: Quiz;
  hostName: string;
}

// 답변 통계 (호스트용)
export interface AnswerStats {
  questionId: string;
  optionCounts: number[]; // 각 선택지별 응답 수
  correctCount: number;
  totalAnswers: number;
  averageTimeLeft: number;
}

// 선택지 색상/모양 (Kahoot 스타일)
export const OPTION_STYLES = [
  { color: 'bg-red-500', hoverColor: 'hover:bg-red-600', textColor: 'text-white', shape: '▲', label: '빨강 삼각형' },
  { color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600', textColor: 'text-white', shape: '◆', label: '파랑 다이아몬드' },
  { color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-600', textColor: 'text-white', shape: '●', label: '노랑 원' },
  { color: 'bg-green-500', hoverColor: 'hover:bg-green-600', textColor: 'text-white', shape: '■', label: '초록 사각형' },
] as const;
