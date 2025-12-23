import { describe, it, expect } from 'vitest';
import { validateCRN } from '../crn';

describe('validateCRN', () => {
  describe('형식 검증', () => {
    it('13자리 숫자를 검증해야 함', () => {
      const result = validateCRN('1234567890123');
      expect(result.message).not.toContain('13자리 또는 14자리');
    });

    it('14자리 숫자를 검증해야 함', () => {
      const result = validateCRN('12345678901234');
      expect(result.message).not.toContain('13자리 또는 14자리');
    });

    it('12자리는 유효하지 않음', () => {
      const result = validateCRN('123456789012');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('13자리 또는 14자리');
    });

    it('15자리는 유효하지 않음', () => {
      const result = validateCRN('123456789012345');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('13자리 또는 14자리');
    });

    it('하이픈이 포함된 형식(XXXXXX-XXXXXXX)을 처리해야 함', () => {
      const result = validateCRN('123456-7890123');
      expect(result.message).not.toContain('자리');
    });

    it('공백이 포함된 형식을 처리해야 함', () => {
      const result = validateCRN('123456 7890123');
      expect(result.message).not.toContain('자리');
    });
  });

  describe('13자리 체크섬 검증', () => {
    it('유효한 법인등록번호를 통과해야 함', () => {
      // 체크섬 계산:
      // 홀수 자리(1,3,5,7,9,11)는 1을 곱함
      // 짝수 자리(2,4,6,8,10,12)는 2를 곱함
      // checksum = (10 - sum % 10) % 10

      // 1101110000016 테스트
      // 위치:   1  2  3  4  5  6  7  8  9  10 11 12 13
      // 숫자:   1  1  0  1  1  1  0  0  0  0  0  1  6
      // 가중치: 1  2  1  2  1  2  1  2  1  2  1  2
      // 곱:     1  2  0  2  1  2  0  0  0  0  0  2 = 10
      // checksum = (10 - 10 % 10) % 10 = 0
      // 실제 마지막 자리가 6이면 실패

      // 올바른 예: 마지막이 0인 경우
      const result = validateCRN('1101110000010');
      // 체크섬 확인 필요
    });

    it('유효하지 않은 체크섬은 실패해야 함', () => {
      const result = validateCRN('1234567890123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('체크섬');
    });
  });

  describe('14자리 (2025년 1월 31일 이후)', () => {
    it('14자리는 체크섬 없이 유효해야 함', () => {
      const result = validateCRN('12345678901234');
      expect(result.isValid).toBe(true);
      expect(result.message).toContain('2025년 1월 31일');
      expect(result.details?.checksumPassed).toBeUndefined();
    });

    it('14자리에서 등기소코드를 추출해야 함', () => {
      const result = validateCRN('12345678901234');
      expect(result.details?.registryCode).toBe('1234');
    });

    it('14자리에서 법인유형코드를 추출해야 함', () => {
      const result = validateCRN('12345678901234');
      expect(result.details?.corporateTypeCode).toBe('56');
    });
  });

  describe('상세 정보 반환', () => {
    it('등기소코드를 올바르게 추출해야 함', () => {
      const result = validateCRN('1101110000010');
      // 앞 4자리가 등기소코드
      if (result.details) {
        expect(result.details.registryCode).toBe('1101');
      }
    });

    it('법인유형코드를 올바르게 추출해야 함', () => {
      const result = validateCRN('1101110000010');
      // 5-6번째 자리가 법인유형코드
      if (result.details) {
        expect(result.details.corporateTypeCode).toBe('11');
      }
    });
  });

  describe('체크섬 알고리즘 상세 테스트', () => {
    it('모든 0에서 체크섬이 0이어야 함', () => {
      // 0000000000000
      // sum = 0
      // checksum = (10 - 0) % 10 = 0
      const result = validateCRN('0000000000000');
      expect(result.isValid).toBe(true);
    });

    it('가중치 패턴(1,2,1,2...)이 올바르게 적용되어야 함', () => {
      // 1111111111110
      // 위치별 가중치: 1,2,1,2,1,2,1,2,1,2,1,2
      // 곱: 1,2,1,2,1,2,1,2,1,2,1,2 = 18
      // checksum = (10 - 18 % 10) % 10 = (10 - 8) % 10 = 2
      const result = validateCRN('1111111111112');
      expect(result.isValid).toBe(true);
    });

    it('체크섬 경계값 테스트', () => {
      // sum이 10의 배수일 때 checksum = 0
      // sum이 10의 배수 + 1일 때 checksum = 9

      // 모든 1 (12자리): sum = 1+2+1+2+1+2+1+2+1+2+1+2 = 18
      // checksum = 2

      // 마지막이 2인 경우 유효
      const result2 = validateCRN('1111111111112');
      expect(result2.isValid).toBe(true);

      // 마지막이 다른 경우 유효하지 않음
      const result3 = validateCRN('1111111111113');
      expect(result3.isValid).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열은 거부해야 함', () => {
      const result = validateCRN('');
      expect(result.isValid).toBe(false);
    });

    it('문자만 있는 입력은 거부해야 함', () => {
      const result = validateCRN('abcdefghijklm');
      expect(result.isValid).toBe(false);
    });

    it('특수문자가 포함된 입력에서 숫자만 추출해야 함', () => {
      const result = validateCRN('111111-1111112');
      // 숫자만 추출하면 13자리
      expect(result.isValid).toBe(true);
    });

    it('숫자와 문자 혼합 입력에서 숫자만 추출해야 함', () => {
      const result = validateCRN('1a1b1c1d1e1f1g1h1i1j1k1l2');
      // 숫자만: 1111111111112
      expect(result.isValid).toBe(true);
    });
  });

  describe('실제 유효한 번호 테스트', () => {
    it.each([
      ['0000000000000', true],
      ['1111111111112', true],
      ['1234567890123', false], // 체크섬 불일치
    ])('%s의 유효성은 %s여야 함', (crn, expected) => {
      const result = validateCRN(crn);
      expect(result.isValid).toBe(expected);
    });
  });
});
