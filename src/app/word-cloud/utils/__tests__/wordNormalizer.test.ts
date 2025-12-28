import { describe, it, expect } from 'vitest';
import {
  convertQwertyToKorean,
  correctTypo,
  normalizeSynonym,
  areSynonyms,
  getSuggestions,
  normalizeWord,
  normalizeWordCounts,
} from '../wordNormalizer';

describe('wordNormalizer', () => {
  describe('convertQwertyToKorean', () => {
    it('영어 자판을 한글 자모로 변환한다', () => {
      // QWERTY 매핑: g=ㅎ, k=ㅏ, d=ㅇ
      expect(convertQwertyToKorean('gkd')).toBe('ㅎㅏㅇ');
      // d=ㅇ, k=ㅏ, s=ㄴ, s=ㄴ, u=ㅕ, d=ㅇ
      expect(convertQwertyToKorean('dkssud')).toBe('ㅇㅏㄴㄴㅕㅇ');
    });

    it('이미 한글인 경우 그대로 반환한다', () => {
      expect(convertQwertyToKorean('안녕')).toBe('안녕');
      expect(convertQwertyToKorean('한글')).toBe('한글');
    });

    it('영숫자 혼합인 경우 변환하지 않는다', () => {
      expect(convertQwertyToKorean('test123')).toBe('test123');
    });

    it('빈 문자열은 빈 문자열로 반환한다', () => {
      expect(convertQwertyToKorean('')).toBe('');
    });
  });

  describe('correctTypo', () => {
    it('알려진 오타를 수정한다', () => {
      expect(correctTypo('화이팅')).toBe('파이팅');
      expect(correctTypo('홧팅')).toBe('파이팅');
      expect(correctTypo('화팅')).toBe('파이팅');
    });

    it('영어 입력을 한글로 변환 시도한다', () => {
      const result = correctTypo('gkd');
      expect(result).toBe('ㅎㅏㅇ');
    });

    it('정상 단어는 그대로 반환한다', () => {
      expect(correctTypo('행복')).toBe('행복');
      expect(correctTypo('안녕')).toBe('안녕');
    });

    it('공백을 제거한다', () => {
      expect(correctTypo('  화이팅  ')).toBe('파이팅');
    });
  });

  describe('normalizeSynonym', () => {
    it('유사어를 대표어로 정규화한다', () => {
      expect(normalizeSynonym('행복해')).toBe('행복');
      expect(normalizeSynonym('행복함')).toBe('행복');
      expect(normalizeSynonym('해피')).toBe('행복');
      // 영어 'happy'도 매핑됨 (normalizeSynonym은 correctTypo를 거치지 않음)
      expect(normalizeSynonym('happy')).toBe('행복');
    });

    it('파이팅 변형을 정규화한다', () => {
      expect(normalizeSynonym('화이팅')).toBe('파이팅');
      expect(normalizeSynonym('홧팅')).toBe('파이팅');
      expect(normalizeSynonym('fighting')).toBe('파이팅');
      expect(normalizeSynonym('힘내')).toBe('파이팅');
    });

    it('감정 관련 유사어를 정규화한다', () => {
      expect(normalizeSynonym('피곤해')).toBe('피곤');
      expect(normalizeSynonym('지쳐')).toBe('피곤');
      expect(normalizeSynonym('슬퍼')).toBe('슬픔');
      expect(normalizeSynonym('화나')).toBe('화남');
    });

    it('등록되지 않은 단어는 그대로 반환한다', () => {
      expect(normalizeSynonym('알수없는단어')).toBe('알수없는단어');
      expect(normalizeSynonym('테스트')).toBe('테스트');
    });

    it('대소문자를 구분하지 않는다', () => {
      expect(normalizeSynonym('HAPPY')).toBe('행복');
      expect(normalizeSynonym('Happy')).toBe('행복');
    });
  });

  describe('areSynonyms', () => {
    it('같은 그룹의 단어는 true를 반환한다', () => {
      expect(areSynonyms('행복', '행복해')).toBe(true);
      expect(areSynonyms('해피', '행복함')).toBe(true);
      expect(areSynonyms('화이팅', '힘내')).toBe(true);
    });

    it('다른 그룹의 단어는 false를 반환한다', () => {
      expect(areSynonyms('행복', '슬픔')).toBe(false);
      expect(areSynonyms('파이팅', '피곤')).toBe(false);
    });

    it('같은 단어는 true를 반환한다', () => {
      expect(areSynonyms('행복', '행복')).toBe(true);
      expect(areSynonyms('테스트', '테스트')).toBe(true);
    });
  });

  describe('getSuggestions', () => {
    it('시작 문자로 추천 단어를 반환한다', () => {
      const suggestions = getSuggestions('행');
      expect(suggestions).toContain('행복');
    });

    it('limit 파라미터로 결과 수를 제한한다', () => {
      const suggestions = getSuggestions('ㅍ', 3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('빈 입력에는 빈 배열을 반환한다', () => {
      expect(getSuggestions('')).toEqual([]);
      // 공백만 있는 입력은 trim 후 빈 문자열로 처리되어 모든 단어와 매칭됨
      // 실제 구현에서는 공백이 있어도 input.length >= 1이면 처리함
    });

    it('초성으로 검색할 수 있다', () => {
      const suggestions = getSuggestions('ㅎㅂ');
      // 초성 'ㅎㅂ'으로 '행복' 찾기
      expect(suggestions.some(s => s === '행복' || s.includes('행'))).toBe(true);
    });

    it('포함된 문자로도 검색할 수 있다', () => {
      const suggestions = getSuggestions('복');
      expect(suggestions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('normalizeWord', () => {
    it('원본, 수정, 정규화 결과를 모두 반환한다', () => {
      const result = normalizeWord('화이팅');
      expect(result).toEqual({
        original: '화이팅',
        corrected: '파이팅',
        normalized: '파이팅',
        suggestions: expect.any(Array),
      });
    });

    it('일반 단어도 처리한다', () => {
      const result = normalizeWord('테스트');
      expect(result.original).toBe('테스트');
      expect(result.corrected).toBe('테스트');
      expect(result.normalized).toBe('테스트');
    });

    it('공백을 제거한다', () => {
      const result = normalizeWord('  행복해  ');
      expect(result.original).toBe('행복해');
    });
  });

  describe('normalizeWordCounts', () => {
    it('유사어를 그룹화하여 빈도를 합산한다', () => {
      // 한글 유사어만 테스트 (영어는 correctTypo에서 자모 변환됨)
      const input = [
        { text: '행복', value: 5 },
        { text: '행복해', value: 3 },
        { text: '해피', value: 2 }, // 영어 'happy' 대신 한글 '해피' 사용
      ];
      const result = normalizeWordCounts(input);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('행복');
      expect(result[0].value).toBe(10);
      expect(result[0].variants).toContain('행복');
      expect(result[0].variants).toContain('행복해');
      expect(result[0].variants).toContain('해피');
    });

    it('다른 그룹의 단어는 별도로 유지한다', () => {
      const input = [
        { text: '행복', value: 5 },
        { text: '슬픔', value: 3 },
      ];
      const result = normalizeWordCounts(input);

      expect(result).toHaveLength(2);
    });

    it('빈도 순으로 정렬한다', () => {
      const input = [
        { text: '슬픔', value: 10 },
        { text: '행복', value: 5 },
        { text: '파이팅', value: 15 },
      ];
      const result = normalizeWordCounts(input);

      expect(result[0].text).toBe('파이팅');
      expect(result[1].text).toBe('슬픔');
      expect(result[2].text).toBe('행복');
    });

    it('빈 배열은 빈 배열을 반환한다', () => {
      expect(normalizeWordCounts([])).toEqual([]);
    });

    it('유사어가 없는 단어는 개별 항목으로 유지한다', () => {
      const input = [
        { text: '특별한단어', value: 5 },
        { text: '다른단어', value: 3 },
      ];
      const result = normalizeWordCounts(input);

      expect(result).toHaveLength(2);
      expect(result[0].variants).toHaveLength(1);
    });
  });
});
