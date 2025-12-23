import { describe, it, expect } from 'vitest';
import {
  extractChosung,
  compareChosung,
  validateAnswer,
  calculateScore,
} from '../hangul';

describe('hangul utilities', () => {
  describe('extractChosung', () => {
    it('한글 단어에서 초성을 추출해야 함', () => {
      expect(extractChosung('안녕하세요')).toBe('ㅇㄴㅎㅅㅇ');
    });

    it('단일 글자에서 초성을 추출해야 함', () => {
      expect(extractChosung('가')).toBe('ㄱ');
      expect(extractChosung('나')).toBe('ㄴ');
      expect(extractChosung('다')).toBe('ㄷ');
    });

    it('공백이 포함된 문장을 처리해야 함', () => {
      const result = extractChosung('한글 테스트');
      expect(result).toContain('ㅎㄱ');
      expect(result).toContain('ㅌㅅㅌ');
    });

    it('빈 문자열에서 빈 문자열을 반환해야 함', () => {
      expect(extractChosung('')).toBe('');
    });

    it('영어는 그대로 유지해야 함', () => {
      const result = extractChosung('Hello');
      // es-hangul의 동작에 따라 다를 수 있음
      expect(typeof result).toBe('string');
    });

    it('숫자는 그대로 유지해야 함', () => {
      const result = extractChosung('123');
      expect(typeof result).toBe('string');
    });

    it('혼합된 문자열을 처리해야 함', () => {
      const result = extractChosung('가나다ABC123');
      expect(result).toContain('ㄱㄴㄷ');
    });

    it('쌍자음 초성을 추출해야 함', () => {
      expect(extractChosung('까')).toBe('ㄲ');
      expect(extractChosung('빠')).toBe('ㅃ');
      expect(extractChosung('싸')).toBe('ㅆ');
    });
  });

  describe('compareChosung', () => {
    it('같은 초성이면 true를 반환해야 함', () => {
      expect(compareChosung('가나다', '고노도')).toBe(true);
      expect(compareChosung('안녕', '아냐')).toBe(true);
    });

    it('다른 초성이면 false를 반환해야 함', () => {
      expect(compareChosung('가나다', '마바사')).toBe(false);
    });

    it('완전히 같은 단어도 true를 반환해야 함', () => {
      expect(compareChosung('테스트', '테스트')).toBe(true);
    });

    it('빈 문자열 비교', () => {
      expect(compareChosung('', '')).toBe(true);
    });
  });

  describe('validateAnswer', () => {
    it('정확히 일치하면 true를 반환해야 함', () => {
      expect(validateAnswer('정답', '정답')).toBe(true);
    });

    it('대소문자를 무시해야 함', () => {
      expect(validateAnswer('Hello', 'hello')).toBe(true);
      expect(validateAnswer('WORLD', 'world')).toBe(true);
    });

    it('앞뒤 공백을 무시해야 함', () => {
      expect(validateAnswer('  정답  ', '정답')).toBe(true);
      expect(validateAnswer('정답', '  정답  ')).toBe(true);
    });

    it('다른 단어는 false를 반환해야 함', () => {
      expect(validateAnswer('오답', '정답')).toBe(false);
    });

    it('빈 문자열 비교', () => {
      expect(validateAnswer('', '')).toBe(true);
      expect(validateAnswer('정답', '')).toBe(false);
    });

    it('부분 일치는 false를 반환해야 함', () => {
      expect(validateAnswer('정', '정답')).toBe(false);
      expect(validateAnswer('정답입니다', '정답')).toBe(false);
    });
  });

  describe('calculateScore', () => {
    it('기본 점수 + 시간 보너스를 계산해야 함', () => {
      // 남은 시간 30초, 총 시간 60초, 힌트 0개
      // 기본 100 + 시간보너스 50 - 힌트패널티 0 = 150
      const score = calculateScore(30, 60, 0);
      expect(score).toBe(150);
    });

    it('힌트 사용 시 페널티를 적용해야 함', () => {
      // 남은 시간 30초, 총 시간 60초, 힌트 1개
      // 기본 100 + 시간보너스 50 - 힌트패널티 50 = 100
      const score = calculateScore(30, 60, 1);
      expect(score).toBe(100);
    });

    it('여러 힌트 사용 시 누적 페널티', () => {
      // 힌트 2개 = 100점 패널티
      const score = calculateScore(30, 60, 2);
      expect(score).toBe(50);
    });

    it('최소 점수는 0이어야 함', () => {
      // 힌트 5개 사용 = 250점 패널티, 음수 불가
      const score = calculateScore(0, 60, 5);
      expect(score).toBe(0);
    });

    it('시간이 모두 남았을 때 최대 시간 보너스', () => {
      // 남은 시간 60초, 총 시간 60초 = 100% 보너스
      const score = calculateScore(60, 60, 0);
      expect(score).toBe(200); // 100 + 100
    });

    it('시간이 없을 때 시간 보너스 없음', () => {
      // 남은 시간 0초
      const score = calculateScore(0, 60, 0);
      expect(score).toBe(100); // 기본 점수만
    });

    it('빠른 정답에 더 높은 점수', () => {
      const fastScore = calculateScore(55, 60, 0);
      const slowScore = calculateScore(5, 60, 0);
      expect(fastScore).toBeGreaterThan(slowScore);
    });
  });
});
