/**
 * 이상형 월드컵 프리빌트 템플릿
 * - 대중적인 주제들을 미리 제공
 * - 이미지는 Unsplash 무료 이미지 또는 placeholder 사용
 */

import type { Candidate } from '../types';

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  candidates: Omit<Candidate, 'id'>[];
  totalRounds: 8 | 16;
}

// 플레이스홀더 이미지 생성 (이름 기반)
function placeholder(name: string, color: string = '4F46E5'): string {
  return `https://placehold.co/400x400/${color}/white?text=${encodeURIComponent(name)}`;
}

export const TEMPLATE_CATEGORIES = [
  { id: 'food', label: '음식', emoji: '🍔' },
  { id: 'beverage', label: '음료', emoji: '☕' },
  { id: 'travel', label: '여행', emoji: '✈️' },
  { id: 'entertainment', label: '엔터', emoji: '🎬' },
] as const;

export const TEMPLATES: Template[] = [
  {
    id: 'ramen',
    title: '라면 월드컵',
    description: '최고의 라면을 골라보세요',
    category: 'food',
    thumbnail: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    totalRounds: 8,
    candidates: [
      { name: '신라면', imageUrl: placeholder('신라면', 'DC2626') },
      { name: '진라면', imageUrl: placeholder('진라면', 'EA580C') },
      { name: '불닭볶음면', imageUrl: placeholder('불닭볶음면', 'B91C1C') },
      { name: '짜파게티', imageUrl: placeholder('짜파게티', '1E3A8A') },
      { name: '너구리', imageUrl: placeholder('너구리', '0D9488') },
      { name: '짜왕', imageUrl: placeholder('짜왕', '7C3AED') },
      { name: '안성탕면', imageUrl: placeholder('안성탕면', 'D97706') },
      { name: '삼양라면', imageUrl: placeholder('삼양라면', 'E11D48') },
    ],
  },
  {
    id: 'chicken',
    title: '치킨 브랜드 월드컵',
    description: '나의 최애 치킨 브랜드는?',
    category: 'food',
    thumbnail: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop',
    totalRounds: 8,
    candidates: [
      { name: '교촌치킨', imageUrl: placeholder('교촌치킨', 'F59E0B') },
      { name: 'BBQ', imageUrl: placeholder('BBQ', 'EF4444') },
      { name: '굽네치킨', imageUrl: placeholder('굽네치킨', 'F97316') },
      { name: 'BHC', imageUrl: placeholder('BHC', 'DC2626') },
      { name: '네네치킨', imageUrl: placeholder('네네치킨', 'FBBF24') },
      { name: '페리카나', imageUrl: placeholder('페리카나', 'FB923C') },
      { name: '호식이두마리', imageUrl: placeholder('호식이', 'EA580C') },
      { name: '푸라닭', imageUrl: placeholder('푸라닭', 'D97706') },
    ],
  },
  {
    id: 'coffee',
    title: '커피 브랜드 월드컵',
    description: '내 취향 커피는?',
    category: 'beverage',
    thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
    totalRounds: 8,
    candidates: [
      { name: '스타벅스', imageUrl: placeholder('스타벅스', '047857') },
      { name: '이디야', imageUrl: placeholder('이디야', '1D4ED8') },
      { name: '투썸플레이스', imageUrl: placeholder('투썸', '7C3AED') },
      { name: '메가커피', imageUrl: placeholder('메가커피', 'FACC15') },
      { name: '폴바셋', imageUrl: placeholder('폴바셋', '991B1B') },
      { name: '블루보틀', imageUrl: placeholder('블루보틀', '0EA5E9') },
      { name: '빽다방', imageUrl: placeholder('빽다방', 'F97316') },
      { name: '컴포즈커피', imageUrl: placeholder('컴포즈', '8B5CF6') },
    ],
  },
  {
    id: 'convenience-food',
    title: '편의점 음식 월드컵',
    description: '최고의 편의점 간식은?',
    category: 'food',
    thumbnail: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&h=300&fit=crop',
    totalRounds: 8,
    candidates: [
      { name: '삼각김밥', imageUrl: placeholder('삼각김밥', '059669') },
      { name: '도시락', imageUrl: placeholder('도시락', '0891B2') },
      { name: '컵라면', imageUrl: placeholder('컵라면', 'DC2626') },
      { name: '핫도그', imageUrl: placeholder('핫도그', 'CA8A04') },
      { name: '샌드위치', imageUrl: placeholder('샌드위치', '65A30D') },
      { name: '떡볶이', imageUrl: placeholder('떡볶이', 'E11D48') },
      { name: '치킨너겟', imageUrl: placeholder('치킨너겟', 'D97706') },
      { name: '김밥', imageUrl: placeholder('김밥', '0D9488') },
    ],
  },
  {
    id: 'travel-korea',
    title: '국내 여행지 월드컵',
    description: '가고 싶은 국내 여행지는?',
    category: 'travel',
    thumbnail: 'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=400&h=300&fit=crop',
    totalRounds: 8,
    candidates: [
      { name: '제주도', imageUrl: placeholder('제주도', '0EA5E9') },
      { name: '부산', imageUrl: placeholder('부산', '2563EB') },
      { name: '강릉', imageUrl: placeholder('강릉', '0891B2') },
      { name: '경주', imageUrl: placeholder('경주', '7C3AED') },
      { name: '여수', imageUrl: placeholder('여수', '0D9488') },
      { name: '전주', imageUrl: placeholder('전주', 'C026D3') },
      { name: '속초', imageUrl: placeholder('속초', '059669') },
      { name: '양양', imageUrl: placeholder('양양', '2DD4BF') },
    ],
  },
  {
    id: 'movies-korean',
    title: '한국 영화 월드컵',
    description: '최고의 한국 영화는?',
    category: 'entertainment',
    thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
    totalRounds: 8,
    candidates: [
      { name: '기생충', imageUrl: placeholder('기생충', '1E3A8A') },
      { name: '올드보이', imageUrl: placeholder('올드보이', '7F1D1D') },
      { name: '타짜', imageUrl: placeholder('타짜', '047857') },
      { name: '범죄도시', imageUrl: placeholder('범죄도시', '1E40AF') },
      { name: '신세계', imageUrl: placeholder('신세계', '1F2937') },
      { name: '부산행', imageUrl: placeholder('부산행', '991B1B') },
      { name: '베테랑', imageUrl: placeholder('베테랑', '4338CA') },
      { name: '극한직업', imageUrl: placeholder('극한직업', 'CA8A04') },
    ],
  },
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return TEMPLATES.filter(t => t.category === category);
}
