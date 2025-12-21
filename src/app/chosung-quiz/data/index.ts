import { movieQuizData } from './movies';
import { foodQuizData } from './foods';
import { kpopQuizData } from './kpop';
import { proverbQuizData } from './proverbs';
import type { QuizWord, Category, Difficulty } from '../types';

export const quizDatabase = {
  movie: movieQuizData,
  food: foodQuizData,
  kpop: kpopQuizData,
  proverb: proverbQuizData
};

export function getQuizByCategory(category: Category): QuizWord[] {
  return quizDatabase[category] || [];
}

export function filterByDifficulty(
  data: QuizWord[],
  difficulty: Difficulty
): QuizWord[] {
  return data.filter(q => q.difficulty === difficulty);
}

export function getRandomQuiz(
  category: Category,
  count: number = 10
): QuizWord[] {
  const data = getQuizByCategory(category);
  const shuffled = [...data].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export const categoryLabels: Record<Category, string> = {
  movie: '영화',
  food: '음식',
  kpop: 'K-POP',
  proverb: '속담/사자성어'
};
