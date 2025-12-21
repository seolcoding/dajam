// 2025년 기준 4대보험료율 및 세율

export const INSURANCE_RATES = {
  // 근로자 부담분
  NATIONAL_PENSION: 0.045,        // 4.5%
  HEALTH_INSURANCE: 0.03545,      // 3.545%
  LONG_TERM_CARE: 0.1295,         // 건강보험의 12.95%
  EMPLOYMENT_INSURANCE: 0.009,    // 0.9%
} as const;

export const TAX_FREE_LIMITS = {
  MEAL_ALLOWANCE: 200000,         // 식대 20만원
  CAR_ALLOWANCE: 200000,          // 차량유지비 20만원
  CHILDCARE_ALLOWANCE: 100000,    // 출산/보육수당 10만원
  RESEARCH_ALLOWANCE: 200000,     // 연구보조비 20만원
} as const;

export const LOCAL_INCOME_TAX_RATE = 0.1; // 소득세의 10%

// 간이세액표 (부양가족 1명 기준, 단위: 원)
// 2025년 기준 세율 구간
export const SIMPLE_TAX_TABLE = [
  { min: 0, max: 1060000, baseTax: 0, rate: 0, baseIncome: 0 },
  { min: 1060000, max: 1500000, baseTax: 0, rate: 0.06, baseIncome: 1060000 },
  { min: 1500000, max: 2100000, baseTax: 26400, rate: 0.15, baseIncome: 1500000 },
  { min: 2100000, max: 3000000, baseTax: 116400, rate: 0.15, baseIncome: 2100000 },
  { min: 3000000, max: 4000000, baseTax: 251400, rate: 0.24, baseIncome: 3000000 },
  { min: 4000000, max: 5000000, baseTax: 491400, rate: 0.35, baseIncome: 4000000 },
  { min: 5000000, max: 7000000, baseTax: 841400, rate: 0.38, baseIncome: 5000000 },
  { min: 7000000, max: 10000000, baseTax: 1601400, rate: 0.40, baseIncome: 7000000 },
  { min: 10000000, max: Infinity, baseTax: 2801400, rate: 0.42, baseIncome: 10000000 },
] as const;

// 8세 이상 20세 이하 자녀 세액공제 (자녀 수별)
export const CHILD_TAX_CREDIT = [
  0,      // 자녀 0명
  12500,  // 자녀 1명
  29160,  // 자녀 2명
  29160,  // 자녀 3명 이상 (동일)
] as const;

// 부양가족 수에 따른 세액 감면율 (대략적인 비율)
export const DEPENDENT_DEDUCTION_RATE = 0.05; // 부양가족 1명당 5% 감면
