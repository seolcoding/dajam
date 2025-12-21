/**
 * 전월세 계산기 상태 관리 (Zustand)
 */

import { create } from 'zustand';

interface CalculatorState {
  // 전세 → 월세 입력
  jeonse: number;
  depositForWolse: number;
  conversionRateJeonse: number;

  // 월세 → 전세 입력
  depositForJeonse: number;
  monthlyRent: number;
  conversionRateWolse: number;

  // 대출 계산 입력
  ownFunds: number;
  loanRate: number;

  // Actions
  setJeonse: (value: number) => void;
  setDepositForWolse: (value: number) => void;
  setConversionRateJeonse: (value: number) => void;
  setDepositForJeonse: (value: number) => void;
  setMonthlyRent: (value: number) => void;
  setConversionRateWolse: (value: number) => void;
  setOwnFunds: (value: number) => void;
  setLoanRate: (value: number) => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  // 기본값
  jeonse: 300_000_000, // 3억
  depositForWolse: 100_000_000, // 1억
  conversionRateJeonse: 4.5,

  depositForJeonse: 100_000_000, // 1억
  monthlyRent: 500_000, // 50만원
  conversionRateWolse: 4.5,

  ownFunds: 200_000_000, // 2억
  loanRate: 3.5,

  // Actions
  setJeonse: (value) => set({ jeonse: value }),
  setDepositForWolse: (value) => set({ depositForWolse: value }),
  setConversionRateJeonse: (value) => set({ conversionRateJeonse: value }),
  setDepositForJeonse: (value) => set({ depositForJeonse: value }),
  setMonthlyRent: (value) => set({ monthlyRent: value }),
  setConversionRateWolse: (value) => set({ conversionRateWolse: value }),
  setOwnFunds: (value) => set({ ownFunds: value }),
  setLoanRate: (value) => set({ loanRate: value }),
}));
