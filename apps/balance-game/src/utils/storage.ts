import type { Question } from '../types';

const STORAGE_KEY = 'balance-game-votes';
const QUESTIONS_KEY = 'balance-game-questions';

// Vote record management
export const saveVote = (questionId: string, choice: 'A' | 'B'): void => {
  const votes = getVotes();
  votes[questionId] = choice;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
};

export const getVotes = (): Record<string, 'A' | 'B'> => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

export const hasVoted = (questionId: string): boolean => {
  const votes = getVotes();
  return questionId in votes;
};

// Question statistics (simulation for demo)
export const getQuestionStats = (questionId: string): { A: number; B: number } => {
  const statsKey = `stats-${questionId}`;
  const cached = localStorage.getItem(statsKey);

  if (cached) {
    return JSON.parse(cached);
  }

  // Initial random data for demo
  const randomStats = {
    A: Math.floor(Math.random() * 500) + 100,
    B: Math.floor(Math.random() * 500) + 100,
  };

  localStorage.setItem(statsKey, JSON.stringify(randomStats));
  return randomStats;
};

export const incrementVote = (questionId: string, choice: 'A' | 'B'): void => {
  const stats = getQuestionStats(questionId);
  stats[choice] += 1;
  localStorage.setItem(`stats-${questionId}`, JSON.stringify(stats));
};

// Custom question management
export const saveCustomQuestion = (question: Question): void => {
  const questions = getCustomQuestions();
  questions.push(question);
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
};

export const getCustomQuestions = (): Question[] => {
  const data = localStorage.getItem(QUESTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

export const getQuestionById = (id: string): Question | null => {
  const questions = getCustomQuestions();
  return questions.find((q) => q.id === id) || null;
};
