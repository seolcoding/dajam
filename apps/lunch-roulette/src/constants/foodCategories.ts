import type { FoodCategory } from '@/types/food';

/**
 * 음식 카테고리 목록
 * 카카오맵 Places API 카테고리 코드:
 * - FD6: 음식점 (일반)
 * - CE7: 카페/디저트
 */
export const FOOD_CATEGORIES: readonly FoodCategory[] = [
  {
    id: 'korean',
    name: '한식',
    emoji: '🍚',
    color: '#FF6B6B',
    kakaoCode: 'FD6'
  },
  {
    id: 'chinese',
    name: '중식',
    emoji: '🥟',
    color: '#FFD93D',
    kakaoCode: 'FD6'
  },
  {
    id: 'japanese',
    name: '일식',
    emoji: '🍣',
    color: '#FF8A80',
    kakaoCode: 'FD6'
  },
  {
    id: 'western',
    name: '양식',
    emoji: '🍝',
    color: '#A8E6CF',
    kakaoCode: 'FD6'
  },
  {
    id: 'chicken',
    name: '치킨',
    emoji: '🍗',
    color: '#FFAAA5',
    kakaoCode: 'FD6'
  },
  {
    id: 'pizza',
    name: '피자',
    emoji: '🍕',
    color: '#FF6B9D',
    kakaoCode: 'FD6'
  },
  {
    id: 'burger',
    name: '햄버거',
    emoji: '🍔',
    color: '#FFA07A',
    kakaoCode: 'FD6'
  },
  {
    id: 'cafe',
    name: '카페/디저트',
    emoji: '☕',
    color: '#D4A574',
    kakaoCode: 'CE7'
  },
  {
    id: 'snack',
    name: '분식',
    emoji: '🍜',
    color: '#FFB6C1',
    kakaoCode: 'FD6'
  },
  {
    id: 'meat',
    name: '고기/구이',
    emoji: '🥩',
    color: '#CD5C5C',
    kakaoCode: 'FD6'
  },
  {
    id: 'seafood',
    name: '해산물',
    emoji: '🦐',
    color: '#4FC3F7',
    kakaoCode: 'FD6'
  },
  {
    id: 'asian',
    name: '아시안',
    emoji: '🌮',
    color: '#BA68C8',
    kakaoCode: 'FD6'
  },
] as const;

// 기본 위치 (서울 시청)
export const DEFAULT_LOCATION = {
  latitude: 37.5666805,
  longitude: 126.9784147,
} as const;

// 검색 반경 옵션 (미터)
export const RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
] as const;
