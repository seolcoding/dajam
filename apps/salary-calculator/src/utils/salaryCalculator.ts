import {
  INSURANCE_RATES,
  SIMPLE_TAX_TABLE,
  CHILD_TAX_CREDIT,
  LOCAL_INCOME_TAX_RATE,
  DEPENDENT_DEDUCTION_RATE
} from '@/constants/taxRates';
import NP from 'number-precision';
import type { SalaryInput, SalaryBreakdown } from '@/types/salary';

// NP 설정: 소수점 계산 정밀도 향상
NP.enableBoundaryChecking(false);

export function calculateSalary(input: SalaryInput): SalaryBreakdown {
  // 1. 월 급여 계산
  let monthlyGross = input.monthlyGross ?? 0;

  if (input.annualSalary) {
    // 퇴직금 포함 연봉인 경우: 연봉의 1/13을 퇴직금으로 분리
    const divisor = input.includeRetirement ? 13 : 12;
    monthlyGross = NP.divide(input.annualSalary, divisor);
  }

  // 2. 과세 대상 급여 (총 급여 - 비과세액)
  const taxableIncome = NP.minus(monthlyGross, input.taxFreeAmount);

  // 3. 4대보험 계산
  const nationalPension = NP.times(taxableIncome, INSURANCE_RATES.NATIONAL_PENSION);
  const healthInsurance = NP.times(taxableIncome, INSURANCE_RATES.HEALTH_INSURANCE);
  const longTermCare = NP.times(healthInsurance, INSURANCE_RATES.LONG_TERM_CARE);
  const employmentInsurance = NP.times(taxableIncome, INSURANCE_RATES.EMPLOYMENT_INSURANCE);

  const totalInsurance = NP.plus(
    NP.plus(nationalPension, healthInsurance),
    NP.plus(longTermCare, employmentInsurance)
  );

  // 4. 소득세 계산 (간이세액표)
  let incomeTax = calculateIncomeTax(taxableIncome, input.dependents);

  // 5. 자녀 세액공제 (8세~20세)
  if (input.children > 0) {
    const childCredit = CHILD_TAX_CREDIT[Math.min(input.children, 3)];
    incomeTax = Math.max(0, NP.minus(incomeTax, childCredit));
  }

  // 6. 지방소득세 (소득세의 10%)
  const localIncomeTax = NP.times(incomeTax, LOCAL_INCOME_TAX_RATE);
  const totalTax = NP.plus(incomeTax, localIncomeTax);

  // 7. 실수령액 계산
  const netPay = NP.minus(monthlyGross, NP.plus(totalInsurance, totalTax));

  return {
    monthlyGross: Math.round(monthlyGross),
    taxableIncome: Math.round(taxableIncome),
    nationalPension: Math.round(nationalPension),
    healthInsurance: Math.round(healthInsurance),
    longTermCare: Math.round(longTermCare),
    employmentInsurance: Math.round(employmentInsurance),
    totalInsurance: Math.round(totalInsurance),
    incomeTax: Math.round(incomeTax),
    localIncomeTax: Math.round(localIncomeTax),
    totalTax: Math.round(totalTax),
    netPay: Math.round(netPay),
  };
}

// 간이세액표 기반 소득세 계산
function calculateIncomeTax(taxableIncome: number, dependents: number): number {
  // 세율 구간 찾기
  const bracket = SIMPLE_TAX_TABLE.find(
    (b: typeof SIMPLE_TAX_TABLE[number]) => taxableIncome >= b.min && taxableIncome < b.max
  );

  if (!bracket) return 0;

  // 기본 세액 계산
  const baseTax = bracket.baseTax + (taxableIncome - bracket.baseIncome) * bracket.rate;

  // 부양가족 수에 따른 세액 감면 (본인 제외, 1명당 5% 감면)
  const deductionRate = Math.max(0, 1 - (dependents - 1) * DEPENDENT_DEDUCTION_RATE);

  return Math.max(0, baseTax * deductionRate);
}

// 연봉 범위별 실수령액 계산 (시뮬레이터용)
export function calculateSalaryRange(
  minSalary: number,
  maxSalary: number,
  step: number,
  baseInput: Omit<SalaryInput, 'annualSalary' | 'monthlyGross'>
): Array<{ salary: number; netPay: number }> {
  const results: Array<{ salary: number; netPay: number }> = [];

  for (let salary = minSalary; salary <= maxSalary; salary += step) {
    const breakdown = calculateSalary({
      ...baseInput,
      annualSalary: salary,
    });
    results.push({
      salary,
      netPay: breakdown.netPay,
    });
  }

  return results;
}

// 숫자를 천단위 콤마 형식으로 포맷
export function formatNumber(value: number): string {
  return value.toLocaleString('ko-KR');
}

// 천단위 콤마 제거하고 숫자로 변환
export function parseNumber(value: string): number {
  return Number(value.replace(/,/g, ''));
}
