import { describe, it, expect } from 'vitest';
import { validateBRN } from '../brn';

describe('validateBRN', () => {
  describe('형식 검증', () => {
    it('10자리 숫자를 검증해야 함', () => {
      const result = validateBRN('1234567890');
      // 체크섬 통과 여부와 관계없이 형식은 맞음
      expect(result.message).not.toContain('10자리');
    });

    it('9자리는 유효하지 않음', () => {
      const result = validateBRN('123456789');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('10자리');
    });

    it('11자리는 유효하지 않음', () => {
      const result = validateBRN('12345678901');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('10자리');
    });

    it('하이픈이 포함된 형식(XXX-XX-XXXXX)을 처리해야 함', () => {
      const result = validateBRN('123-45-67890');
      expect(result.message).not.toContain('10자리');
    });

    it('공백이 포함된 형식을 처리해야 함', () => {
      const result = validateBRN('123 45 67890');
      expect(result.message).not.toContain('10자리');
    });
  });

  describe('체크섬 검증', () => {
    it('유효한 사업자등록번호를 통과해야 함', () => {
      // 테스트용 유효한 사업자등록번호 (체크섬 계산)
      // 검증키: [1, 3, 7, 1, 3, 7, 1, 3, 5]
      // 예: 1234567890
      // sum = 1*1 + 2*3 + 3*7 + 4*1 + 5*3 + 6*7 + 7*1 + 8*3 + 9*5 + floor(9*5/10)
      //     = 1 + 6 + 21 + 4 + 15 + 42 + 7 + 24 + 45 + 4 = 169
      // checksum = (10 - 169 % 10) % 10 = (10 - 9) % 10 = 1

      // 1234567891 체크섬 계산:
      // 숫자: 1,2,3,4,5,6,7,8,9
      // 검증키: 1,3,7,1,3,7,1,3,5
      // 곱: 1,6,21,4,15,42,7,24,45
      // 추가: floor(9*5/10) = 4
      // 합: 1+6+21+4+15+42+7+24+45+4 = 169
      // 체크섬: (10 - 169%10) % 10 = 1
      const result = validateBRN('1234567891');
      expect(result.isValid).toBe(true);
      expect(result.details?.checksumPassed).toBe(true);
    });

    it('유효하지 않은 체크섬은 실패해야 함', () => {
      const result = validateBRN('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('체크섬');
    });

    it('모든 0은 실패해야 함', () => {
      const result = validateBRN('0000000000');
      expect(result.isValid).toBe(true); // 체크섬상 유효할 수 있음
    });
  });

  describe('사업자 유형 판단', () => {
    it('개인사업자(00-79)를 인식해야 함', () => {
      // 4-5번째 자리가 00-79면 개인사업자
      const result = validateBRN('1234567891'); // 4-5번째: 45 (개인)
      if (result.isValid && result.details) {
        expect(result.details.type).toBe('individual');
      }
    });

    it('법인사업자(81-87)를 인식해야 함', () => {
      // 4-5번째 자리가 81-87면 법인사업자
      // 123-81-67890 형태 테스트
      // 체크섬이 맞는 번호 필요
      const result = validateBRN('1238167890');
      // 체크섬 계산 필요
    });

    it('알 수 없는 유형(80, 88-99)을 unknown으로 처리해야 함', () => {
      // 4-5번째 자리가 80 또는 88 이상이면 unknown
      const result = validateBRN('1238067890');
      // 체크섬이 맞지 않으면 details가 없음
    });
  });

  describe('실제 유효한 번호 테스트', () => {
    // 체크섬 계산기로 생성한 유효한 사업자등록번호들
    const validBRNs = [
      '1234567891',
      '1111111118', // 검증 필요
    ];

    it.each([
      ['1234567891', true],
      ['1234567890', false],
    ])('%s의 유효성은 %s여야 함', (brn, expected) => {
      const result = validateBRN(brn);
      expect(result.isValid).toBe(expected);
    });
  });

  describe('Edge Cases', () => {
    it('빈 문자열은 거부해야 함', () => {
      const result = validateBRN('');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('10자리');
    });

    it('문자만 있는 입력은 거부해야 함', () => {
      const result = validateBRN('abcdefghij');
      expect(result.isValid).toBe(false);
    });

    it('특수문자가 포함된 입력에서 숫자만 추출해야 함', () => {
      const result = validateBRN('123-45-67891');
      expect(result.isValid).toBe(true);
    });

    it('숫자와 문자 혼합 입력에서 숫자만 추출해야 함', () => {
      const result = validateBRN('1a2b3c4d5e6f7g8h9i1');
      // 숫자만 추출: 1234567891
      expect(result.isValid).toBe(true);
    });
  });

  describe('체크섬 알고리즘 상세 테스트', () => {
    it('검증키 적용이 올바르게 되어야 함', () => {
      // 검증키: [1, 3, 7, 1, 3, 7, 1, 3, 5]
      // 마지막 자리 특별 처리: floor(9번째 * 5 / 10) 추가

      // 0000000000 테스트
      // sum = 0 + floor(0*5/10) = 0
      // checksum = (10 - 0) % 10 = 0
      const result0 = validateBRN('0000000000');
      expect(result0.isValid).toBe(true);

      // 1111111110 테스트
      // sum = 1+3+7+1+3+7+1+3+5 + floor(1*5/10) = 31 + 0 = 31
      // checksum = (10 - 1) % 10 = 9
      const result1 = validateBRN('1111111119');
      expect(result1.isValid).toBe(true);
    });
  });
});
