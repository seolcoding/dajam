export interface QuizWord {
  id: string;
  word: string;
  chosung: string;
  category: Category;
  difficulty: Difficulty;
  hints: Hint[];
  relatedWords?: string[];
}

export interface Hint {
  level: 1 | 2 | 3;
  content: string;
}

export type Category =
  | 'movie'
  | 'food'
  | 'proverb'
  | 'kpop';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GameConfig {
  category: Category;
  difficulty?: Difficulty;
  questionCount: number;
  timeLimit: number;
}

export interface GameState {
  currentQuestionIndex: number;
  questions: QuizWord[];
  score: number;
  correctCount: number;
  usedHints: number[];
  startTime: number;
  isFinished: boolean;
  answers: AnswerRecord[];
}

export interface AnswerRecord {
  question: QuizWord;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
  scoreEarned: number;
}

export type GamePhase = 'settings' | 'playing' | 'result';
