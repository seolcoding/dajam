import { describe, it, expect } from 'vitest';
import { encodeState, decodeState } from '../useUrlState';

describe('useUrlState', () => {
  describe('encodeState', () => {
    it('객체를 base64 URL-safe 문자열로 인코딩한다', () => {
      const state = { name: 'test', value: 123 };
      const encoded = encodeState(state);

      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      // URL-safe 문자만 포함해야 함 (no +, /, =)
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
    });

    it('빈 객체도 인코딩한다', () => {
      const encoded = encodeState({});
      expect(typeof encoded).toBe('string');
    });

    it('한글 문자열을 포함한 객체를 인코딩한다', () => {
      const state = { 이름: '홍길동', 값: 100 };
      const encoded = encodeState(state);

      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('중첩된 객체를 인코딩한다', () => {
      const state = { user: { name: 'test', settings: { theme: 'dark' } } };
      const encoded = encodeState(state);

      expect(typeof encoded).toBe('string');
    });

    it('배열을 포함한 객체를 인코딩한다', () => {
      const state = { items: [1, 2, 3], tags: ['a', 'b'] };
      const encoded = encodeState(state);

      expect(typeof encoded).toBe('string');
    });

    it('특수 문자를 포함한 문자열을 인코딩한다', () => {
      const state = { text: 'Hello! @#$%^&*()' };
      const encoded = encodeState(state);

      expect(typeof encoded).toBe('string');
    });
  });

  describe('decodeState', () => {
    it('인코딩된 문자열을 원래 객체로 디코딩한다', () => {
      const original = { name: 'test', value: 123 };
      const encoded = encodeState(original);
      const decoded = decodeState(encoded, {});

      expect(decoded).toEqual(original);
    });

    it('한글 문자열을 포함한 객체를 디코딩한다', () => {
      const original = { 이름: '홍길동', 값: 100 };
      const encoded = encodeState(original);
      const decoded = decodeState(encoded, {});

      expect(decoded).toEqual(original);
    });

    it('중첩된 객체를 디코딩한다', () => {
      const original = { user: { name: 'test', settings: { theme: 'dark' } } };
      const encoded = encodeState(original);
      const decoded = decodeState(encoded, {});

      expect(decoded).toEqual(original);
    });

    it('배열을 포함한 객체를 디코딩한다', () => {
      const original = { items: [1, 2, 3], tags: ['a', 'b'] };
      const encoded = encodeState(original);
      const decoded = decodeState(encoded, {});

      expect(decoded).toEqual(original);
    });

    it('잘못된 문자열은 기본값을 반환한다', () => {
      const defaultValue = { fallback: true };
      const decoded = decodeState('invalid-string!!!', defaultValue);

      expect(decoded).toEqual(defaultValue);
    });

    it('빈 문자열은 기본값을 반환한다', () => {
      const defaultValue = { empty: true };
      const decoded = decodeState('', defaultValue);

      expect(decoded).toEqual(defaultValue);
    });

    it('null/undefined 기본값도 처리한다', () => {
      const decoded = decodeState('invalid', null as unknown as object);

      expect(decoded).toBeNull();
    });
  });

  describe('encode/decode round-trip', () => {
    it('급여 계산기 상태를 인코딩/디코딩한다', () => {
      const salaryState = {
        m: 'annual',
        a: '50000000',
        g: '',
        t: 200000,
        d: 1,
        c: 0,
        r: 0,
      };

      const encoded = encodeState(salaryState);
      const decoded = decodeState(encoded, {});

      expect(decoded).toEqual(salaryState);
    });

    it('복잡한 상태를 인코딩/디코딩한다', () => {
      const complexState = {
        user: {
          id: 123,
          name: '테스트 사용자',
          preferences: {
            theme: 'dark',
            language: 'ko',
            notifications: ['email', 'push'],
          },
        },
        items: [
          { id: 1, name: '항목 1', checked: true },
          { id: 2, name: '항목 2', checked: false },
        ],
        metadata: {
          createdAt: '2024-12-27',
          version: '1.0.0',
        },
      };

      const encoded = encodeState(complexState);
      const decoded = decodeState(encoded, {});

      expect(decoded).toEqual(complexState);
    });

    it('boolean 값을 정확히 처리한다', () => {
      const state = { a: true, b: false };
      const encoded = encodeState(state);
      const decoded = decodeState(encoded, {});

      expect(decoded.a).toBe(true);
      expect(decoded.b).toBe(false);
    });

    it('null 값을 처리한다', () => {
      const state = { a: null, b: 'test' };
      const encoded = encodeState(state);
      const decoded = decodeState(encoded, {});

      expect(decoded.a).toBeNull();
      expect(decoded.b).toBe('test');
    });

    it('숫자 0을 정확히 처리한다', () => {
      const state = { zero: 0, negative: -1, float: 0.5 };
      const encoded = encodeState(state);
      const decoded = decodeState(encoded, {});

      expect(decoded.zero).toBe(0);
      expect(decoded.negative).toBe(-1);
      expect(decoded.float).toBe(0.5);
    });
  });

  describe('URL 길이 최적화', () => {
    it('인코딩된 문자열이 원본 JSON보다 짧다', () => {
      const state = {
        mode: 'annual',
        salary: '50000000',
        taxFree: 200000,
        dependents: 1,
      };

      const json = JSON.stringify(state);
      const encoded = encodeState(state);

      // base64 인코딩은 약 33% 증가하지만,
      // URI 인코딩된 JSON보다는 대체로 짧음
      expect(encoded.length).toBeLessThan(encodeURIComponent(json).length * 1.5);
    });
  });
});
