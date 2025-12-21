import type { ThemePreset } from '@/types/bingo.types';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'numbers-25',
    name: '숫자 1-25',
    gridSize: 5,
    items: Array.from({ length: 25 }, (_, i) => String(i + 1)),
  },
  {
    id: 'numbers-16',
    name: '숫자 1-16',
    gridSize: 4,
    items: Array.from({ length: 16 }, (_, i) => String(i + 1)),
  },
  {
    id: 'animals',
    name: '동물',
    gridSize: 5,
    items: [
      '사자', '호랑이', '곰', '코끼리', '기린',
      '원숭이', '팬더', '캥거루', '코알라', '펭귄',
      '돌고래', '고래', '상어', '독수리', '부엉이',
      '앵무새', '토끼', '다람쥐', '여우', '늑대',
      '사슴', '얼룩말', '하마', '악어', '거북이',
    ],
  },
  {
    id: 'fruits',
    name: '과일',
    gridSize: 4,
    items: [
      '사과', '바나나', '딸기', '수박',
      '포도', '오렌지', '복숭아', '자두',
      '망고', '파인애플', '키위', '체리',
      '레몬', '배', '감', '귤',
    ],
  },
  {
    id: 'countries',
    name: '국가',
    gridSize: 5,
    items: [
      '한국', '미국', '일본', '중국', '영국',
      '프랑스', '독일', '이탈리아', '스페인', '캐나다',
      '호주', '브라질', '멕시코', '인도', '러시아',
      '태국', '베트남', '필리핀', '싱가포르', '말레이시아',
      '인도네시아', '터키', '이집트', '남아공', '아르헨티나',
    ],
  },
  {
    id: 'colors',
    name: '색깔',
    gridSize: 3,
    items: [
      '빨강', '주황', '노랑',
      '초록', '파랑', '남색',
      '보라', '분홍', '검정',
    ],
  },
  {
    id: 'kpop',
    name: 'K-POP',
    gridSize: 4,
    items: [
      'BTS', 'Blackpink', 'NewJeans', 'IVE',
      'aespa', 'Twice', 'Seventeen', 'Stray Kids',
      'TXT', 'ITZY', 'Le Sserafim', 'NCT',
      'Red Velvet', '(G)I-DLE', 'Enhypen', 'Ateez',
    ],
  },
  {
    id: 'sports',
    name: '스포츠',
    gridSize: 4,
    items: [
      '축구', '야구', '농구', '배구',
      '테니스', '탁구', '배드민턴', '골프',
      '수영', '육상', '체조', '스키',
      '스케이트', '권투', '태권도', '유도',
    ],
  },
  {
    id: 'foods',
    name: '음식',
    gridSize: 5,
    items: [
      '피자', '햄버거', '치킨', '스파게티', '스테이크',
      '초밥', '라면', '김치', '비빔밥', '불고기',
      '떡볶이', '순대', '튀김', '만두', '칼국수',
      '삼겹살', '갈비', '냉면', '삼계탕', '설렁탕',
      '짜장면', '짬뽕', '탕수육', '볶음밥', '돈까스',
    ],
  },
];

/**
 * 테마 프리셋 가져오기
 */
export function getThemePreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find(preset => preset.id === id);
}

/**
 * 그리드 크기별 테마 필터링
 */
export function getThemesByGridSize(gridSize: number): ThemePreset[] {
  return THEME_PRESETS.filter(preset => preset.gridSize === gridSize);
}
