/**
 * 비용 비교 로직
 */

import { calculateBrokerageFee, calculateWolseBrokerageFee } from './brokerageFeeCalculator';
import { calculateJeonseLoanCost } from './loanCalculator';

export interface JeonseCost {
  type: 'jeonse';
  deposit: number;
  loanAmount: number;
  loanRate: number;
  brokerageFee: number;
  monthlyInterest: number;
  totalCost: number; // 2년 기준
}

export interface WolseCost {
  type: 'wolse';
  deposit: number;
  monthlyRent: number;
  brokerageFee: number;
  totalCost: number; // 2년 기준
}

/**
 * 전세 총 비용 계산 (2년 기준)
 */
export function calculateJeonseTotalCost(
  jeonse: number,
  ownFunds: number,
  loanRate: number
): JeonseCost {
  const { loanAmount, monthlyInterest } = calculateJeonseLoanCost(
    jeonse,
    ownFunds,
    loanRate
  );

  const brokerageFee = calculateBrokerageFee(jeonse, true);

  // 2년(24개월) 기준 총 비용
  const totalCost = brokerageFee + monthlyInterest * 24;

  return {
    type: 'jeonse',
    deposit: jeonse,
    loanAmount,
    loanRate,
    brokerageFee,
    monthlyInterest,
    totalCost,
  };
}

/**
 * 월세 총 비용 계산 (2년 기준)
 */
export function calculateWolseTotalCost(
  deposit: number,
  monthlyRent: number
): WolseCost {
  const brokerageFee = calculateWolseBrokerageFee(deposit, monthlyRent);

  // 2년(24개월) 기준 총 비용
  const totalCost = brokerageFee + monthlyRent * 24;

  return {
    type: 'wolse',
    deposit,
    monthlyRent,
    brokerageFee,
    totalCost,
  };
}

/**
 * 손익분기점 계산
 * @returns 손익분기점 개월 수 (월세가 유리해지는 시점)
 */
export function calculateBreakEvenPoint(
  jeonseCost: JeonseCost,
  wolseCost: WolseCost
): number {
  const initialDiff = jeonseCost.brokerageFee - wolseCost.brokerageFee;
  const monthlyDiff = wolseCost.monthlyRent - jeonseCost.monthlyInterest;

  if (monthlyDiff <= 0) {
    // 월세 월 부담액이 전세 이하인 경우 손익분기점 없음
    return Infinity;
  }

  const breakEvenMonths = initialDiff / monthlyDiff;
  return Math.round(breakEvenMonths * 10) / 10; // 소수점 첫째 자리
}
