/**
 * Word Cloud - 단어 정규화 및 유사어 처리 유틸리티
 *
 * 기능:
 * 1. 오타 수정 (자주 사용되는 오타 패턴)
 * 2. 유사어 묶기 (동의어, 비슷한 표현)
 * 3. 단어 추천 (자동완성)
 */

import { getChoseong } from 'es-hangul';

// ============================================================
// 1. 오타 수정 (Typo Correction)
// ============================================================

// 자주 발생하는 한글 오타 패턴
const TYPO_CORRECTIONS: Record<string, string> = {
  // ㅔ/ㅐ 혼동
  '데이터': '데이터',
  '웹사이트': '웹사이트',
  // 쌍자음 오타
  '짜증': '짜증',
  '빠름': '빠름',
  // 받침 오타
  '좋아': '좋아',
  '싫어': '싫어',
  // 일반적인 오타
  '화이팅': '파이팅',
  '홧팅': '파이팅',
  '화팅': '파이팅',
  '행복해': '행복해',
  '즐거워': '즐거워',
};

// 영한 오타 (영어 키보드에서 한글 입력)
const QWERTY_TO_KOREAN: Record<string, string> = {
  'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
  'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
  'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
  'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
  'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ',
  'n': 'ㅜ', 'm': 'ㅡ',
};

/**
 * 영어 → 한글 자판 변환
 */
export function convertQwertyToKorean(input: string): string {
  // 영어만 있는 경우 변환 시도
  if (!/^[a-zA-Z]+$/.test(input)) return input;

  let result = '';
  for (const char of input.toLowerCase()) {
    result += QWERTY_TO_KOREAN[char] || char;
  }
  return result;
}

/**
 * 알려진 오타 수정
 */
export function correctTypo(word: string): string {
  const normalized = word.trim().toLowerCase();

  // 직접 매핑된 오타 수정
  if (TYPO_CORRECTIONS[normalized]) {
    return TYPO_CORRECTIONS[normalized];
  }

  // 영한 변환 체크
  const converted = convertQwertyToKorean(normalized);
  if (converted !== normalized) {
    return converted;
  }

  return word;
}

// ============================================================
// 2. 유사어 묶기 (Synonym Grouping)
// ============================================================

// 유사어/동의어 그룹 (대표어: [변형들])
const SYNONYM_GROUPS: Record<string, string[]> = {
  // 감정 - 긍정
  '행복': ['행복해', '행복함', '해피', 'happy', '기쁨', '기뻐', '기뻐요'],
  '즐거움': ['즐거워', '즐거워요', '재밌어', '재미있어', '재밌다', '재미'],
  '좋음': ['좋아', '좋아요', '굿', 'good', '최고', '짱', '짱이야'],
  '사랑': ['사랑해', '러브', 'love', '좋아해', '❤️', '♥'],
  '감사': ['고마워', '고마워요', '땡큐', 'thanks', 'thank you', '감사해요'],

  // 감정 - 부정
  '피곤': ['피곤해', '피곤함', '지침', '지쳐', '졸려', '졸림'],
  '슬픔': ['슬퍼', '슬퍼요', '우울', '우울해', '우울함', 'sad'],
  '화남': ['화나', '화나요', '짜증', '짜증나', '화남', '분노'],
  '힘듦': ['힘들어', '힘들다', '어려워', '어렵다', '고됨'],
  '걱정': ['걱정돼', '걱정됨', '불안', '불안해', '초조'],

  // 날씨/상태
  '맑음': ['맑아', '화창', '좋은날씨', '쾌청'],
  '흐림': ['흐려', '구름', '우중충'],
  '비': ['비와', '비옴', '비내림', '장마'],
  '더움': ['더워', '덥다', '무더위', '폭염'],
  '추움': ['추워', '춥다', '한파', '쌀쌀'],

  // 음식
  '맛있음': ['맛있어', '맛있다', '존맛', '맛점', 'yummy', '굿맛'],
  '배고픔': ['배고파', '배고프다', '허기', '굶주림'],
  '배부름': ['배불러', '배부르다', '든든'],

  // 일/업무
  '바쁨': ['바빠', '바쁘다', '정신없어', '분주'],
  '집중': ['집중중', '몰입', '열중', '몰두'],
  '휴식': ['쉼', '쉬는중', '휴식중', '릴렉스', 'relax'],

  // 응원
  '파이팅': ['화이팅', '홧팅', '화팅', 'fighting', '힘내', '힘내요', '응원'],
};

// 역 인덱스 생성: 변형 → 대표어
const synonymIndex = new Map<string, string>();
for (const [canonical, variants] of Object.entries(SYNONYM_GROUPS)) {
  synonymIndex.set(canonical.toLowerCase(), canonical);
  for (const variant of variants) {
    synonymIndex.set(variant.toLowerCase(), canonical);
  }
}

/**
 * 유사어를 대표어로 정규화
 */
export function normalizeSynonym(word: string): string {
  const normalized = word.trim().toLowerCase();
  return synonymIndex.get(normalized) || word;
}

/**
 * 두 단어가 같은 의미인지 확인
 */
export function areSynonyms(word1: string, word2: string): boolean {
  const norm1 = normalizeSynonym(word1);
  const norm2 = normalizeSynonym(word2);
  return norm1.toLowerCase() === norm2.toLowerCase();
}

// ============================================================
// 3. 단어 추천 (Word Suggestions)
// ============================================================

// 자주 사용되는 단어 목록 (카테고리별)
const COMMON_WORDS: Record<string, string[]> = {
  '감정': ['행복', '즐거움', '슬픔', '피곤', '화남', '설렘', '감사', '사랑', '희망', '평화'],
  '날씨': ['맑음', '흐림', '비', '눈', '더움', '추움', '바람', '습함'],
  '음식': ['맛있음', '배고픔', '배부름', '달달', '짭짤', '매콤', '시원'],
  '업무': ['바쁨', '여유', '집중', '휴식', '성취', '도전', '성장', '배움'],
  '기타': ['파이팅', '최고', '감사', '축하', '응원', '힘내', '화이팅'],
};

// 모든 추천 단어 목록
const ALL_SUGGESTIONS = Object.values(COMMON_WORDS).flat();

/**
 * 입력에 맞는 단어 추천
 */
export function getSuggestions(input: string, limit: number = 5): string[] {
  if (!input || input.length < 1) return [];

  const normalizedInput = input.trim().toLowerCase();
  const inputChosung = getChoseong(normalizedInput);

  const suggestions: Array<{ word: string; score: number }> = [];

  for (const word of ALL_SUGGESTIONS) {
    const wordLower = word.toLowerCase();
    const wordChosung = getChoseong(word);

    let score = 0;

    // 1. 정확히 시작하는 경우 (가장 높은 점수)
    if (wordLower.startsWith(normalizedInput)) {
      score = 100 - (word.length - normalizedInput.length);
    }
    // 2. 초성이 일치하는 경우
    else if (wordChosung.startsWith(inputChosung)) {
      score = 50 - (wordChosung.length - inputChosung.length);
    }
    // 3. 포함하는 경우
    else if (wordLower.includes(normalizedInput)) {
      score = 30;
    }

    if (score > 0) {
      suggestions.push({ word, score });
    }
  }

  // 점수 내림차순 정렬
  suggestions.sort((a, b) => b.score - a.score);

  return suggestions.slice(0, limit).map((s) => s.word);
}

// ============================================================
// 4. 통합 정규화
// ============================================================

export interface NormalizedWord {
  original: string; // 원본
  corrected: string; // 오타 수정
  normalized: string; // 유사어 정규화
  suggestions: string[]; // 추천 단어
}

/**
 * 단어를 완전히 정규화
 */
export function normalizeWord(word: string): NormalizedWord {
  const original = word.trim();
  const corrected = correctTypo(original);
  const normalized = normalizeSynonym(corrected);
  const suggestions = getSuggestions(original, 3);

  return {
    original,
    corrected,
    normalized,
    suggestions,
  };
}

/**
 * 단어 목록을 정규화하고 빈도 계산
 */
export interface NormalizedWordCount {
  text: string; // 대표 단어
  value: number; // 빈도
  variants: string[]; // 포함된 변형들
}

export function normalizeWordCounts(
  words: Array<{ text: string; value: number }>
): NormalizedWordCount[] {
  const groupedWords = new Map<string, { total: number; variants: Set<string> }>();

  for (const { text, value } of words) {
    const { normalized } = normalizeWord(text);
    const key = normalized.toLowerCase();

    if (!groupedWords.has(key)) {
      groupedWords.set(key, { total: 0, variants: new Set() });
    }

    const group = groupedWords.get(key)!;
    group.total += value;
    group.variants.add(text);
  }

  return Array.from(groupedWords.entries())
    .map(([key, { total, variants }]) => ({
      text: normalizeSynonym(key) || key,
      value: total,
      variants: Array.from(variants),
    }))
    .sort((a, b) => b.value - a.value);
}
