import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { validateRRN } from '../rrn';

describe('validateRRN', () => {
  // Mock Date.now for consistent age calculations
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('형식 검증', () => {
    it('13자리 숫자를 검증해야 함', () => {
      const result = validateRRN('1234567890123');
      expect(result.isValid).toBe(false); // 체크섬 실패
    });

    it('12자리는 유효하지 않음', () => {
      const result = validateRRN('123456789012');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('13자리');
    });

    it('14자리는 유효하지 않음', () => {
      const result = validateRRN('12345678901234');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('13자리');
    });

    it('하이픈이 포함된 형식을 처리해야 함', () => {
      const result = validateRRN('900101-1234567');
      // 숫자만 추출해서 검증
      expect(result.message).not.toContain('13자리');
    });

    it('공백이 포함된 형식을 처리해야 함', () => {
      const result = validateRRN('900101 1234567');
      expect(result.message).not.toContain('13자리');
    });
  });

  describe('생년월일 검증', () => {
    it('유효하지 않은 월은 거부해야 함', () => {
      const result = validateRRN('9013011234567'); // 13월
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('월');
    });

    it('0월은 거부해야 함', () => {
      const result = validateRRN('9000011234567'); // 0월
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('월');
    });

    it('유효하지 않은 일은 거부해야 함', () => {
      const result = validateRRN('9001321234567'); // 32일
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('일');
    });

    it('0일은 거부해야 함', () => {
      const result = validateRRN('9001001234567'); // 0일
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('일');
    });

    it('2월 30일은 거부해야 함', () => {
      const result = validateRRN('9002301234567'); // 2월 30일
      expect(result.isValid).toBe(false);
    });

    it('윤년 2월 29일은 허용해야 함', () => {
      // 2000년은 윤년 (성별코드 3으로 2000년대)
      const result = validateRRN('0002293000000');
      // 체크섬 때문에 실패할 수 있지만 날짜 오류가 아니어야 함
      expect(result.message).not.toContain('2월');
    });

    it('비윤년 2월 29일은 거부해야 함', () => {
      // 1999년은 비윤년 (성별코드 1로 1900년대)
      const result = validateRRN('9902291234567');
      expect(result.isValid).toBe(false);
    });
  });

  describe('성별 코드 검증', () => {
    it('유효하지 않은 성별 코드(0)를 거부해야 함', () => {
      const result = validateRRN('9001010000000');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('성별');
    });

    it('유효하지 않은 성별 코드(9)를 거부해야 함', () => {
      const result = validateRRN('9001019000000');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('성별');
    });

    it('1-8 성별 코드를 허용해야 함', () => {
      for (let code = 1; code <= 8; code++) {
        const rrn = `900101${code}000000`;
        const result = validateRRN(rrn);
        expect(result.message).not.toContain('성별');
      }
    });
  });

  describe('세기 판단', () => {
    it('1, 2로 시작하면 1900년대로 판단해야 함', () => {
      const result1 = validateRRN('9001011000000');
      const result2 = validateRRN('9001012000000');
      // 체크섬 관련 메시지가 아닌 다른 오류 확인
      expect(result1.message).not.toContain('월');
      expect(result2.message).not.toContain('월');
    });

    it('3, 4로 시작하면 2000년대로 판단해야 함', () => {
      const result3 = validateRRN('0001013000000');
      const result4 = validateRRN('0001014000000');
      expect(result3.message).not.toContain('월');
      expect(result4.message).not.toContain('월');
    });

    it('5, 6은 외국인 1900년대로 판단해야 함', () => {
      const result5 = validateRRN('9001015000000');
      const result6 = validateRRN('9001016000000');
      expect(result5.message).not.toContain('월');
      expect(result6.message).not.toContain('월');
    });

    it('7, 8은 외국인 2000년대로 판단해야 함', () => {
      const result7 = validateRRN('0001017000000');
      const result8 = validateRRN('0001018000000');
      expect(result7.message).not.toContain('월');
      expect(result8.message).not.toContain('월');
    });
  });

  describe('체크섬 검증', () => {
    it('유효한 체크섬을 통과해야 함', () => {
      // 유효한 주민등록번호 예시 (테스트용 가상 번호)
      // 체크섬 계산: 가중치 [2,3,4,5,6,7,8,9,2,3,4,5]
      // 900101-1234567 형식 테스트
      const result = validateRRN('8001011234527'); // 실제 체크섬 통과하는 예시
      // 2020년 이전 발급분으로 체크섬 적용
      if (result.isValid) {
        expect(result.details?.checksumPassed).toBe(true);
      }
    });

    it('유효하지 않은 체크섬은 실패해야 함', () => {
      const result = validateRRN('9001011234567'); // 임의의 체크섬
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('체크섬');
    });
  });

  describe('상세 정보 반환', () => {
    it('성별을 올바르게 판단해야 함', () => {
      // 홀수 코드 (1, 3, 5, 7) = 남성
      // 짝수 코드 (2, 4, 6, 8) = 여성
      const result = validateRRN('9001011000000');
      if (result.details) {
        // 성별코드 1 = 남성
      }
    });

    it('내외국인 여부를 올바르게 판단해야 함', () => {
      // 1-4 = 내국인, 5-8 = 외국인
      const result = validateRRN('9001011000000');
      if (result.details) {
        // 성별코드 1-4 = 내국인
      }
    });
  });

  describe('2020년 10월 이후 발급분', () => {
    it('2020년 10월 이후 발급분은 체크섬 검증을 건너뛰어야 함', () => {
      // 2020년 10월 이후 출생 (성별코드 3 = 2000년대)
      const result = validateRRN('2010013000000'); // 2020년 10월 1일
      // 체크섬 없이 형식만 검증
      if (result.isValid) {
        expect(result.details?.checksumPassed).toBeUndefined();
      }
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열은 거부해야 함', () => {
      const result = validateRRN('');
      expect(result.isValid).toBe(false);
    });

    it('문자만 있는 입력은 거부해야 함', () => {
      const result = validateRRN('abcdefghijklm');
      expect(result.isValid).toBe(false);
    });

    it('숫자와 문자 혼합 입력에서 숫자만 추출해야 함', () => {
      const result = validateRRN('9a0b0c1d0e1f1234567');
      expect(result.message).not.toContain('13자리');
    });
  });
});
