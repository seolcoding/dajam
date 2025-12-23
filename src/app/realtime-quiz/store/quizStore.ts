import { create } from 'zustand';
import type {
  Quiz,
  QuizQuestion,
  GameState,
  ParticipantState,
  LeaderboardEntry,
  ParticipantAnswer,
} from '../types';

interface QuizStore {
  // 세션 정보
  sessionId: string | null;
  sessionCode: string | null;
  isHost: boolean;

  // 퀴즈 정보
  quiz: Quiz | null;
  currentQuestionIndex: number;
  currentQuestion: QuizQuestion | null;

  // 게임 상태
  gameState: GameState;
  timeLeft: number;
  countdownValue: number;

  // 참가자 정보
  participants: ParticipantState[];
  myParticipantId: string | null;

  // 답변 및 점수
  currentAnswers: Map<string, ParticipantAnswer>; // participantId -> answer
  leaderboard: LeaderboardEntry[];

  // Actions
  setSession: (sessionId: string, sessionCode: string, isHost: boolean) => void;
  setQuiz: (quiz: Quiz) => void;
  setGameState: (state: GameState) => void;
  setTimeLeft: (time: number) => void;
  setCountdownValue: (value: number) => void;

  // 질문 관련
  startQuestion: (index: number) => void;
  nextQuestion: () => void;

  // 참가자 관련
  addParticipant: (participant: ParticipantState) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (participantId: string, updates: Partial<ParticipantState>) => void;
  setMyParticipantId: (id: string) => void;

  // 답변 관련
  submitAnswer: (participantId: string, answer: ParticipantAnswer) => void;
  clearCurrentAnswers: () => void;

  // 리더보드
  updateLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  calculateLeaderboard: () => void;

  // 초기화
  reset: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  // 초기 상태
  sessionId: null,
  sessionCode: null,
  isHost: false,
  quiz: null,
  currentQuestionIndex: -1,
  currentQuestion: null,
  gameState: 'waiting',
  timeLeft: 0,
  countdownValue: 3,
  participants: [],
  myParticipantId: null,
  currentAnswers: new Map(),
  leaderboard: [],

  // Actions
  setSession: (sessionId, sessionCode, isHost) => {
    set({ sessionId, sessionCode, isHost });
  },

  setQuiz: (quiz) => {
    set({ quiz });
  },

  setGameState: (gameState) => {
    set({ gameState });
  },

  setTimeLeft: (timeLeft) => {
    set({ timeLeft });
  },

  setCountdownValue: (countdownValue) => {
    set({ countdownValue });
  },

  startQuestion: (index) => {
    const { quiz } = get();
    if (!quiz || index >= quiz.questions.length) return;

    const currentQuestion = quiz.questions[index];
    set({
      currentQuestionIndex: index,
      currentQuestion,
      timeLeft: currentQuestion.timeLimit,
      gameState: 'question',
      currentAnswers: new Map(),
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, quiz } = get();
    if (!quiz) return;

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= quiz.questions.length) {
      // 게임 종료
      set({ gameState: 'finished' });
      get().calculateLeaderboard();
    } else {
      // 다음 질문
      get().startQuestion(nextIndex);
    }
  },

  addParticipant: (participant) => {
    set((state) => ({
      participants: [...state.participants, participant],
    }));
  },

  removeParticipant: (participantId) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    }));
  },

  updateParticipant: (participantId, updates) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === participantId ? { ...p, ...updates } : p
      ),
    }));
  },

  setMyParticipantId: (id) => {
    set({ myParticipantId: id });
  },

  submitAnswer: (participantId, answer) => {
    set((state) => {
      const newAnswers = new Map(state.currentAnswers);
      newAnswers.set(participantId, answer);
      return { currentAnswers: newAnswers };
    });

    // 참가자 상태 업데이트
    const { participants, quiz } = get();
    const participant = participants.find((p) => p.id === participantId);
    if (!participant || !quiz) return;

    const newAnswers = { ...participant.answers, [answer.questionId]: answer };
    const newCorrectCount = participant.correctCount + (answer.isCorrect ? 1 : 0);
    const newStreak = answer.isCorrect ? participant.currentStreak + 1 : 0;
    const newScore = participant.totalScore + answer.pointsEarned;

    get().updateParticipant(participantId, {
      answers: newAnswers,
      correctCount: newCorrectCount,
      currentStreak: newStreak,
      totalScore: newScore,
    });
  },

  clearCurrentAnswers: () => {
    set({ currentAnswers: new Map() });
  },

  updateLeaderboard: (leaderboard) => {
    set({ leaderboard });
  },

  calculateLeaderboard: () => {
    const { participants } = get();

    // 점수 순으로 정렬
    const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);

    // 순위 계산
    const leaderboard: LeaderboardEntry[] = sorted.map((participant, index) => ({
      participantId: participant.id,
      nickname: participant.nickname,
      score: participant.totalScore,
      rank: index + 1,
      correctCount: participant.correctCount,
      streak: participant.currentStreak,
    }));

    set({ leaderboard });
  },

  reset: () => {
    set({
      sessionId: null,
      sessionCode: null,
      isHost: false,
      quiz: null,
      currentQuestionIndex: -1,
      currentQuestion: null,
      gameState: 'waiting',
      timeLeft: 0,
      countdownValue: 3,
      participants: [],
      myParticipantId: null,
      currentAnswers: new Map(),
      leaderboard: [],
    });
  },
}));
