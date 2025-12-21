/**
 * 대출 이자 계산 로직
 */

/**
 * 월 대출 이자 계산 (원리금 균등 상환 아님, 이자만 납부)
 * @param loanAmount - 대출 원금 (원)
 * @param annualRate - 연 이자율 (%)
 * @returns 월 이자 (원)
 */
export function calculateMonthlyInterest(
  loanAmount: number,
  annualRate: number
): number {
  const monthlyInterest = (loanAmount * (annualRate / 100)) / 12;
  return Math.round(monthlyInterest);
}

/**
 * 전세자금대출 포함 실부담액 계산
 * @param jeonse - 전세금 (원)
 * @param ownFunds - 보유 자금 (원)
 * @param loanRate - 대출 연이율 (%)
 * @returns { loanAmount, monthlyInterest }
 */
export function calculateJeonseLoanCost(
  jeonse: number,
  ownFunds: number,
  loanRate: number
): { loanAmount: number; monthlyInterest: number } {
  const loanAmount = jeonse - ownFunds;

  if (loanAmount <= 0) {
    return { loanAmount: 0, monthlyInterest: 0 };
  }

  const monthlyInterest = calculateMonthlyInterest(loanAmount, loanRate);

  return { loanAmount, monthlyInterest };
}
