import { create } from 'zustand';
import type { GameState, GameConfig, AnswerRecord, GamePhase } from '../types';
import { getRandomQuiz } from '../data';
import { validateAnswer, calculateScore } from '../utils/hangul';

interface GameStore extends GameState {
  gamePhase: GamePhase;
  gameConfig: GameConfig | null;

  // Actions
  startGame: (config: GameConfig) => void;
  submitAnswer: (userAnswer: string, timeRemaining: number) => void;
  useHint: (level: number) => void;
  skipQuestion: () => void;
  resetGame: () => void;
  goToSettings: () => void;
}

const initialState: GameState = {
  currentQuestionIndex: 0,
  questions: [],
  score: 0,
  correctCount: 0,
  usedHints: [],
  startTime: 0,
  isFinished: false,
  answers: []
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  gamePhase: 'settings',
  gameConfig: null,

  startGame: (config: GameConfig) => {
    const questions = getRandomQuiz(config.category, config.questionCount);
    set({
      ...initialState,
      questions,
      startTime: Date.now(),
      gamePhase: 'playing',
      gameConfig: config
    });
  },

  submitAnswer: (userAnswer: string, timeRemaining: number) => {
    const state = get();
    const currentQuestion = state.questions[state.currentQuestionIndex];
    const isCorrect = validateAnswer(userAnswer, currentQuestion.word);
    const timeSpent = (state.gameConfig?.timeLimit || 30) - timeRemaining;

    let scoreEarned = 0;
    if (isCorrect) {
      scoreEarned = calculateScore(
        timeRemaining,
        state.gameConfig?.timeLimit || 30,
        state.usedHints.length
      );
    }

    const answerRecord: AnswerRecord = {
      question: currentQuestion,
      userAnswer,
      isCorrect,
      timeSpent,
      hintsUsed: state.usedHints.length,
      scoreEarned
    };

    const newAnswers = [...state.answers, answerRecord];
    const newScore = state.score + scoreEarned;
    const newCorrectCount = state.correctCount + (isCorrect ? 1 : 0);

    // Move to next question or finish
    if (state.currentQuestionIndex >= state.questions.length - 1) {
      set({
        answers: newAnswers,
        score: newScore,
        correctCount: newCorrectCount,
        isFinished: true,
        gamePhase: 'result'
      });
    } else {
      set({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        answers: newAnswers,
        score: newScore,
        correctCount: newCorrectCount,
        usedHints: []
      });
    }
  },

  useHint: (level: number) => {
    const state = get();
    if (!state.usedHints.includes(level)) {
      set({
        usedHints: [...state.usedHints, level]
      });
    }
  },

  skipQuestion: () => {
    const state = get();
    const currentQuestion = state.questions[state.currentQuestionIndex];

    const answerRecord: AnswerRecord = {
      question: currentQuestion,
      userAnswer: '',
      isCorrect: false,
      timeSpent: 0,
      hintsUsed: state.usedHints.length,
      scoreEarned: 0
    };

    const newAnswers = [...state.answers, answerRecord];

    if (state.currentQuestionIndex >= state.questions.length - 1) {
      set({
        answers: newAnswers,
        isFinished: true,
        gamePhase: 'result'
      });
    } else {
      set({
        currentQuestionIndex: state.currentQuestionIndex + 1,
        answers: newAnswers,
        usedHints: []
      });
    }
  },

  resetGame: () => {
    const config = get().gameConfig;
    if (config) {
      get().startGame(config);
    }
  },

  goToSettings: () => {
    set({
      ...initialState,
      gamePhase: 'settings',
      gameConfig: null
    });
  }
}));
