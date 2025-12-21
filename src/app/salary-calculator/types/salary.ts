export interface SalaryInput {
  annualSalary?: number;      // 연봉 (연봉 모드)
  monthlyGross?: number;      // 월 급여 (월급 모드)
  taxFreeAmount: number;      // 비과세액 (기본 20만원)
  dependents: number;         // 부양가족 수 (본인 포함)
  children: number;           // 8세~20세 자녀 수
  includeRetirement: boolean; // 퇴직금 포함 여부
}

export interface SalaryBreakdown {
  monthlyGross: number;           // 총 월 급여
  taxableIncome: number;          // 과세 대상 급여
  nationalPension: number;        // 국민연금
  healthInsurance: number;        // 건강보험
  longTermCare: number;           // 장기요양보험
  employmentInsurance: number;    // 고용보험
  totalInsurance: number;         // 총 4대보험료
  incomeTax: number;              // 소득세
  localIncomeTax: number;         // 지방소득세
  totalTax: number;               // 총 세금
  netPay: number;                 // 실수령액
}

export type InputMode = 'annual' | 'monthly';
