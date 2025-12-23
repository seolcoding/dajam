import type { ThisOrThatQuestion } from '../types';

/**
 * This or That 기본 질문 템플릿
 * balance-game과 연동 가능한 구조
 */

export const questionTemplates = {
  icebreaker: [
    {
      id: 'ice-1',
      text: '나는...',
      optionA: '아침형 인간',
      optionB: '저녁형 인간',
      category: 'icebreaker',
    },
    {
      id: 'ice-2',
      text: '휴가를 간다면?',
      optionA: '바다',
      optionB: '산',
      category: 'icebreaker',
    },
    {
      id: 'ice-3',
      text: '더 좋아하는 것은?',
      optionA: '여름',
      optionB: '겨울',
      category: 'icebreaker',
    },
    {
      id: 'ice-4',
      text: '주말에 선호하는 것은?',
      optionA: '집콕',
      optionB: '외출',
      category: 'icebreaker',
    },
    {
      id: 'ice-5',
      text: '여가 시간에는?',
      optionA: '집에서 휴식',
      optionB: '밖에서 활동',
      category: 'icebreaker',
    },
  ],

  food: [
    {
      id: 'food-1',
      text: '평생 하나만?',
      optionA: '치킨',
      optionB: '피자',
      category: 'food',
    },
    {
      id: 'food-2',
      text: '오늘 점심은?',
      optionA: '한식',
      optionB: '양식',
      category: 'food',
    },
    {
      id: 'food-3',
      text: '디저트는?',
      optionA: '케이크',
      optionB: '아이스크림',
      category: 'food',
    },
    {
      id: 'food-4',
      text: '야식으로 먹는다면?',
      optionA: '라면',
      optionB: '치킨',
      category: 'food',
    },
    {
      id: 'food-5',
      text: '평생 마실 음료 하나만',
      optionA: '커피',
      optionB: '콜라',
      category: 'food',
    },
  ],

  values: [
    {
      id: 'values-1',
      text: '더 중요한 것은?',
      optionA: '돈',
      optionB: '사랑',
      category: 'values',
    },
    {
      id: 'values-2',
      text: '회사 선택 기준?',
      optionA: '높은 연봉',
      optionB: '워라밸',
      category: 'values',
    },
    {
      id: 'values-3',
      text: '초능력을 갖는다면?',
      optionA: '투명인간',
      optionB: '순간이동',
      category: 'values',
    },
    {
      id: 'values-4',
      text: '타임머신으로 간다면?',
      optionA: '과거',
      optionB: '미래',
      category: 'values',
    },
  ],

  fun: [
    {
      id: 'fun-1',
      text: '평생 사용한다면?',
      optionA: 'Netflix',
      optionB: 'YouTube',
      category: 'fun',
    },
    {
      id: 'fun-2',
      text: '반려동물을 키운다면?',
      optionA: '강아지',
      optionB: '고양이',
      category: 'fun',
    },
    {
      id: 'fun-3',
      text: '선호하는 계절은?',
      optionA: '봄/가을',
      optionB: '여름/겨울',
      category: 'fun',
    },
  ],
} as const;

export type QuestionCategory = keyof typeof questionTemplates;

// 카테고리별 메타데이터
export const categoryMetadata = {
  icebreaker: {
    label: '아이스브레이킹',
    emoji: '🎉',
    color: 'blue',
  },
  food: {
    label: '음식',
    emoji: '🍕',
    color: 'orange',
  },
  values: {
    label: '가치관',
    emoji: '💭',
    color: 'purple',
  },
  fun: {
    label: '재미',
    emoji: '🎮',
    color: 'green',
  },
} as const;

// 모든 질문 가져오기
export function getAllQuestions(): ThisOrThatQuestion[] {
  return Object.values(questionTemplates).flat() as ThisOrThatQuestion[];
}

// 카테고리별 질문 가져오기
export function getQuestionsByCategory(category: QuestionCategory): ThisOrThatQuestion[] {
  return [...(questionTemplates[category] || [])] as ThisOrThatQuestion[];
}
