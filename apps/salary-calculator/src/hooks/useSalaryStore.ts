import { create } from 'zustand';
import type { SalaryInput, SalaryBreakdown, InputMode } from '@/types/salary';
import { calculateSalary } from '@/utils/salaryCalculator';
import { TAX_FREE_LIMITS } from '@/constants/taxRates';

interface SalaryStore {
  // Input state
  inputMode: InputMode;
  annualSalary: string;
  monthlyGross: string;
  taxFreeAmount: number;
  dependents: number;
  children: number;
  includeRetirement: boolean;

  // Result state
  breakdown: SalaryBreakdown | null;

  // Actions
  setInputMode: (mode: InputMode) => void;
  setAnnualSalary: (value: string) => void;
  setMonthlyGross: (value: string) => void;
  setTaxFreeAmount: (value: number) => void;
  setDependents: (value: number) => void;
  setChildren: (value: number) => void;
  setIncludeRetirement: (value: boolean) => void;
  calculate: () => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  inputMode: 'annual' as InputMode,
  annualSalary: '',
  monthlyGross: '',
  taxFreeAmount: TAX_FREE_LIMITS.MEAL_ALLOWANCE,
  dependents: 1,
  children: 0,
  includeRetirement: false,
  breakdown: null,
};

export const useSalaryStore = create<SalaryStore>((set, get) => ({
  ...DEFAULT_STATE,

  setInputMode: (mode) => set({ inputMode: mode }),

  setAnnualSalary: (value) => set({ annualSalary: value }),

  setMonthlyGross: (value) => set({ monthlyGross: value }),

  setTaxFreeAmount: (value) => set({ taxFreeAmount: value }),

  setDependents: (value) => set({ dependents: Math.max(1, value) }),

  setChildren: (value) => set({ children: Math.max(0, value) }),

  setIncludeRetirement: (value) => set({ includeRetirement: value }),

  calculate: () => {
    const state = get();
    const annualValue = Number(String(state.annualSalary).replace(/,/g, ''));
    const monthlyValue = Number(String(state.monthlyGross).replace(/,/g, ''));

    const input: SalaryInput = {
      annualSalary: state.inputMode === 'annual' ? annualValue : undefined,
      monthlyGross: state.inputMode === 'monthly' ? monthlyValue : undefined,
      taxFreeAmount: state.taxFreeAmount,
      dependents: state.dependents,
      children: state.children,
      includeRetirement: state.includeRetirement,
    };

    const breakdown = calculateSalary(input);
    set({ breakdown });
  },

  reset: () => set({ ...DEFAULT_STATE }),
}));
