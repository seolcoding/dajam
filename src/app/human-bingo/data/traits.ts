/**
 * Human Bingo 특성 템플릿
 */

import type { Trait, TraitCategory } from '../types';

export const TRAIT_TEMPLATES: Record<TraitCategory, Trait[]> = {
  travel: [
    { id: 't1', text: '해외여행 3개국 이상', category: 'travel', difficulty: 'medium' },
    { id: 't2', text: '비행기 타본 적 있음', category: 'travel', difficulty: 'easy' },
    { id: 't3', text: '혼자 여행 해본 적 있음', category: 'travel', difficulty: 'medium' },
    { id: 't4', text: '캠핑 좋아함', category: 'travel', difficulty: 'medium' },
    { id: 't5', text: '제주도 가봄', category: 'travel', difficulty: 'easy' },
    { id: 't6', text: '배낭여행 경험', category: 'travel', difficulty: 'medium' },
  ],
  hobby: [
    { id: 'h1', text: '악기 연주 가능', category: 'hobby', difficulty: 'medium' },
    { id: 'h2', text: '운동을 주 3회 이상', category: 'hobby', difficulty: 'medium' },
    { id: 'h3', text: '최근 책 완독함', category: 'hobby', difficulty: 'easy' },
    { id: 'h4', text: '게임 좋아함', category: 'hobby', difficulty: 'easy' },
    { id: 'h5', text: '요리 잘함', category: 'hobby', difficulty: 'medium' },
    { id: 'h6', text: '노래 부르기 좋아함', category: 'hobby', difficulty: 'easy' },
    { id: 'h7', text: '그림 그리기 취미', category: 'hobby', difficulty: 'medium' },
    { id: 'h8', text: '사진 찍기 좋아함', category: 'hobby', difficulty: 'easy' },
  ],
  experience: [
    { id: 'e1', text: '대학 동아리 활동 경험', category: 'experience', difficulty: 'easy' },
    { id: 'e2', text: '알바 경험 3개 이상', category: 'experience', difficulty: 'medium' },
    { id: 'e3', text: '봉사활동 경험 있음', category: 'experience', difficulty: 'easy' },
    { id: 'e4', text: '창업 경험 있음', category: 'experience', difficulty: 'hard' },
    { id: 'e5', text: '해외 교환학생', category: 'experience', difficulty: 'hard' },
    { id: 'e6', text: '공모전 수상 경험', category: 'experience', difficulty: 'hard' },
  ],
  personal: [
    { id: 'p1', text: '쌍둥이 있음', category: 'personal', difficulty: 'hard' },
    { id: 'p2', text: '반려동물 키움', category: 'personal', difficulty: 'easy' },
    { id: 'p3', text: '안경 착용', category: 'personal', difficulty: 'easy' },
    { id: 'p4', text: '막내임', category: 'personal', difficulty: 'medium' },
    { id: 'p5', text: '외동임', category: 'personal', difficulty: 'medium' },
    { id: 'p6', text: '형제자매 3명 이상', category: 'personal', difficulty: 'medium' },
    { id: 'p7', text: '혈액형 O형', category: 'personal', difficulty: 'easy' },
    { id: 'p8', text: '키 170cm 이상', category: 'personal', difficulty: 'easy' },
  ],
  work: [
    { id: 'w1', text: '재택근무 경험', category: 'work', difficulty: 'medium' },
    { id: 'w2', text: '이직 경험 있음', category: 'work', difficulty: 'medium' },
    { id: 'w3', text: '대학원 진학 경험', category: 'work', difficulty: 'hard' },
    { id: 'w4', text: '인턴십 경험', category: 'work', difficulty: 'medium' },
    { id: 'w5', text: '자격증 3개 이상', category: 'work', difficulty: 'medium' },
  ],
  food: [
    { id: 'f1', text: '매운 음식 잘 먹음', category: 'food', difficulty: 'easy' },
    { id: 'f2', text: '채식주의자', category: 'food', difficulty: 'hard' },
    { id: 'f3', text: '커피 하루 3잔 이상', category: 'food', difficulty: 'medium' },
    { id: 'f4', text: '회 좋아함', category: 'food', difficulty: 'easy' },
    { id: 'f5', text: '빵 좋아함', category: 'food', difficulty: 'easy' },
    { id: 'f6', text: '아침밥 꼭 먹음', category: 'food', difficulty: 'medium' },
  ],
  fun: [
    { id: 'fu1', text: '이름에 김/이/박 있음', category: 'fun', difficulty: 'easy' },
    { id: 'fu2', text: '올해 생일 지남', category: 'fun', difficulty: 'easy' },
    { id: 'fu3', text: '오늘 아침밥 먹음', category: 'fun', difficulty: 'easy' },
    { id: 'fu4', text: '운전면허 있음', category: 'fun', difficulty: 'easy' },
    { id: 'fu5', text: '왼손잡이', category: 'fun', difficulty: 'hard' },
    { id: 'fu6', text: '두 개 국어 가능', category: 'fun', difficulty: 'medium' },
    { id: 'fu7', text: '겨울 태생', category: 'fun', difficulty: 'easy' },
    { id: 'fu8', text: '서울 출신', category: 'fun', difficulty: 'easy' },
  ],
};

/**
 * 모든 특성을 하나의 배열로
 */
export const ALL_TRAITS: Trait[] = Object.values(TRAIT_TEMPLATES).flat();

/**
 * 카테고리별 이름
 */
export const CATEGORY_NAMES: Record<TraitCategory, string> = {
  travel: '여행',
  hobby: '취미',
  experience: '경험',
  personal: '개인 특성',
  work: '직장/학교',
  food: '음식',
  fun: '재미',
};

/**
 * 난이도별 이름
 */
export const DIFFICULTY_NAMES = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};
