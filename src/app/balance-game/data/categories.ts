import type { Category, CategoryMeta } from '../types';

export const categoryMetadata: Record<Category, CategoryMeta> = {
  general: {
    id: 'general',
    label: '일반',
    emoji: '💬',
    color: 'bg-gray-500',
  },
  food: {
    id: 'food',
    label: '음식',
    emoji: '🍕',
    color: 'bg-orange-500',
  },
  travel: {
    id: 'travel',
    label: '여행',
    emoji: '✈️',
    color: 'bg-blue-500',
  },
  values: {
    id: 'values',
    label: '가치관',
    emoji: '💭',
    color: 'bg-purple-500',
  },
  romance: {
    id: 'romance',
    label: '연애',
    emoji: '💖',
    color: 'bg-pink-500',
  },
  work: {
    id: 'work',
    label: '직장',
    emoji: '💼',
    color: 'bg-indigo-500',
  },
};
