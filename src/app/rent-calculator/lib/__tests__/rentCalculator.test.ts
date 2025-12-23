import { describe, it, expect } from 'vitest';
import { jeonseToWolse, wolseToJeonse } from '../rentCalculator';
import {
  calculateWolseTransactionAmount,
  calculateBrokerageFee,
  calculateWolseBrokerageFee,
} from '../brokerageFeeCalculator';

describe('rentCalculator', () => {
  describe('jeonseToWolse', () => {
    it('전세를 월세로 변환해야 함', () => {
      // 전세 2억, 보증금 5천만원, 전환율 4.5%
      // (2억 - 5천만원) * 4.5% / 12 = 562,500원
      const result = jeonseToWolse(200_000_000, 50_000_000, 4.5);
      expect(result).toBe(562500);
    });

    it('기본 전환율(4.5%)을 적용해야 함', () => {
      const result = jeonseToWolse(200_000_000, 50_000_000);
      expect(result).toBe(562500);
    });

    it('다양한 전환율을 적용해야 함', () => {
      // 전환율 5%
      const result5 = jeonseToWolse(200_000_000, 50_000_000, 5);
      expect(result5).toBe(625000);

      // 전환율 4%
      const result4 = jeonseToWolse(200_000_000, 50_000_000, 4);
      expect(result4).toBe(500000);
    });

    it('보증금이 전세금보다 높으면 에러', () => {
      expect(() => jeonseToWolse(100_000_000, 150_000_000)).toThrow();
    });

    it('보증금이 전세금과 같으면 에러', () => {
      expect(() => jeonseToWolse(100_000_000, 100_000_000)).toThrow();
    });

    it('원 단위로 반올림해야 함', () => {
      // 결과가 소수점이 나오는 케이스
      const result = jeonseToWolse(100_000_000, 30_000_000, 4.5);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('보증금 0원일 때 전액 전환', () => {
      const result = jeonseToWolse(120_000_000, 0, 4.5);
      // 1.2억 * 4.5% / 12 = 450,000원
      expect(result).toBe(450000);
    });
  });

  describe('wolseToJeonse', () => {
    it('월세를 전세로 환산해야 함', () => {
      // 보증금 5천만원, 월세 50만원, 전환율 4.5%
      // 5천만원 + (50만원 * 12 / 4.5%) = 5천만원 + 1.33억 = 1.83억
      const result = wolseToJeonse(50_000_000, 500_000, 4.5);
      expect(result).toBeCloseTo(183_333_333, -3);
    });

    it('기본 전환율(4.5%)을 적용해야 함', () => {
      const result = wolseToJeonse(50_000_000, 500_000);
      expect(result).toBeCloseTo(183_333_333, -3);
    });

    it('월세 0원이면 보증금만 반환', () => {
      const result = wolseToJeonse(100_000_000, 0, 4.5);
      expect(result).toBe(100_000_000);
    });

    it('보증금 0원일 때 월세만 환산', () => {
      const result = wolseToJeonse(0, 500_000, 4.5);
      // 0 + (50만원 * 12 / 4.5%) = 1.33억
      expect(result).toBeCloseTo(133_333_333, -3);
    });

    it('원 단위로 반올림해야 함', () => {
      const result = wolseToJeonse(50_000_000, 300_000, 4.5);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('jeonseToWolse와 역변환이 가능해야 함', () => {
      const originalJeonse = 200_000_000;
      const deposit = 50_000_000;
      const rate = 4.5;

      const wolse = jeonseToWolse(originalJeonse, deposit, rate);
      const reconvertedJeonse = wolseToJeonse(deposit, wolse, rate);

      // 반올림 오차 허용
      expect(reconvertedJeonse).toBeCloseTo(originalJeonse, -4);
    });
  });
});

describe('brokerageFeeCalculator', () => {
  describe('calculateWolseTransactionAmount', () => {
    it('5천만원 미만은 70배 적용', () => {
      // 보증금 1천만원 + 월세 30만원 = 4천만원 (5천만원 미만)
      // 환산: 1천만원 + 30만원 * 70 = 1천만원 + 2,100만원 = 3,100만원
      const result = calculateWolseTransactionAmount(10_000_000, 300_000);
      expect(result).toBe(31_000_000);
    });

    it('5천만원 이상은 100배 적용', () => {
      // 합계(deposit + monthlyRent)가 5천만원 이상이면 100배 적용
      // 보증금 4900만원 + 월세 200만원 = 5100만원 (5천만원 이상) → 100배
      const result = calculateWolseTransactionAmount(49_000_000, 2_000_000);
      // 5천만원 이상이므로 100배: 4900만원 + 200만원 * 100 = 2.49억
      expect(result).toBe(249_000_000);
    });

    it('경계값 테스트', () => {
      // 정확히 5천만원 (보증금 + 월세)
      // 보증금 4900만원, 월세 100만원 = 5000만원
      const result = calculateWolseTransactionAmount(49_000_000, 10_000);
      // 49,000,000 + 10,000 = 49,010,000 (5천만 미만)
      // 49,000,000 + 10,000 * 70 = 49,700,000
      expect(result).toBe(49_700_000);
    });
  });

  describe('calculateBrokerageFee', () => {
    it('5천만원 미만 요율(0.5%, 한도 20만원) 적용', () => {
      // 3천만원 * 0.5% = 15만원 (한도 미달)
      const result = calculateBrokerageFee(30_000_000);
      expect(result).toBe(150_000);
    });

    it('5천만원 미만 한도 적용', () => {
      // 4500만원 * 0.5% = 22.5만원 → 한도 20만원 적용
      const result = calculateBrokerageFee(45_000_000);
      expect(result).toBe(200_000);
    });

    it('5천만원~1억 요율(0.4%, 한도 30만원) 적용', () => {
      // 7천만원 * 0.4% = 28만원 (한도 미달)
      const result = calculateBrokerageFee(70_000_000);
      expect(result).toBe(280_000);
    });

    it('5천만원~1억 한도 적용', () => {
      // 9천만원 * 0.4% = 36만원 → 한도 30만원 적용
      const result = calculateBrokerageFee(90_000_000);
      expect(result).toBe(300_000);
    });

    it('1억~6억 요율(0.3%) 적용', () => {
      // 3억 * 0.3% = 90만원
      const result = calculateBrokerageFee(300_000_000);
      expect(result).toBe(900_000);
    });

    it('6억~12억 요율(0.4%) 적용', () => {
      // 8억 * 0.4% = 320만원
      const result = calculateBrokerageFee(800_000_000);
      expect(result).toBe(3_200_000);
    });

    it('12억~15억 요율(0.5%) 적용', () => {
      // 13억 * 0.5% = 650만원
      const result = calculateBrokerageFee(1_300_000_000);
      expect(result).toBe(6_500_000);
    });

    it('15억 초과 요율(0.6%) 적용', () => {
      // 20억 * 0.6% = 1,200만원
      const result = calculateBrokerageFee(2_000_000_000);
      expect(result).toBe(12_000_000);
    });
  });

  describe('calculateWolseBrokerageFee', () => {
    it('월세 중개수수료를 올바르게 계산해야 함', () => {
      // 보증금 5천만원, 월세 50만원
      // 환산액: 5천만원 + 50만원 * 100 = 1억
      // 요율: 0.4%, 한도 30만원
      // 수수료: 1억 * 0.4% = 40만원 → 한도 30만원
      const result = calculateWolseBrokerageFee(50_000_000, 500_000);
      expect(result).toBe(300_000);
    });

    it('소액 월세 중개수수료', () => {
      // 보증금 1천만원, 월세 30만원
      // 합: 1300만원 (5천만원 미만) → 70배 적용
      // 환산액: 1천만원 + 30만원 * 70 = 3100만원
      // 요율: 0.5%, 한도 20만원
      // 수수료: 3100만원 * 0.5% = 15.5만원
      const result = calculateWolseBrokerageFee(10_000_000, 300_000);
      expect(result).toBe(155_000);
    });
  });

  describe('Edge Cases', () => {
    it('0원 거래금액', () => {
      const result = calculateBrokerageFee(0);
      expect(result).toBe(0);
    });

    it('매우 작은 금액', () => {
      const result = calculateBrokerageFee(100_000);
      expect(result).toBe(500); // 10만원 * 0.5%
    });
  });
});
