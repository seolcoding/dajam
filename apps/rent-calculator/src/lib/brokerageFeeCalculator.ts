/**
 * 중개수수료 계산 로직
 */

interface BrokerageFeeRate {
  min: number;
  max: number;
  rate: number;
  maxFee?: number;
}

// 주택 임대차 중개수수료 요율표
const RENTAL_FEE_RATES: BrokerageFeeRate[] = [
  { min: 0, max: 50_000_000, rate: 0.5, maxFee: 200_000 },
  { min: 50_000_000, max: 100_000_000, rate: 0.4, maxFee: 300_000 },
  { min: 100_000_000, max: 600_000_000, rate: 0.3 },
  { min: 600_000_000, max: 1_200_000_000, rate: 0.4 },
  { min: 1_200_000_000, max: 1_500_000_000, rate: 0.5 },
  { min: 1_500_000_000, max: Infinity, rate: 0.6 },
];

/**
 * 월세 거래금액 환산
 * @param deposit - 보증금 (원)
 * @param monthlyRent - 월세 (원)
 * @returns 환산 거래금액 (원)
 */
export function calculateWolseTransactionAmount(
  deposit: number,
  monthlyRent: number
): number {
  const multiplier = deposit + monthlyRent < 50_000_000 ? 70 : 100;
  return deposit + monthlyRent * multiplier;
}

/**
 * 중개수수료 계산
 * @param transactionAmount - 거래금액 (원)
 * @param isRental - 임대차 여부 (true: 전세/월세, false: 매매)
 * @returns 중개수수료 (원)
 */
export function calculateBrokerageFee(
  transactionAmount: number,
  isRental: boolean = true
): number {
  const rates = isRental ? RENTAL_FEE_RATES : RENTAL_FEE_RATES;

  const rateInfo = rates.find(
    (r) => transactionAmount >= r.min && transactionAmount < r.max
  );

  if (!rateInfo) {
    throw new Error('거래금액이 유효하지 않습니다');
  }

  const calculatedFee = transactionAmount * (rateInfo.rate / 100);

  // 한도액이 있는 경우 MIN(계산값, 한도액)
  if (rateInfo.maxFee) {
    return Math.min(calculatedFee, rateInfo.maxFee);
  }

  return Math.round(calculatedFee);
}

/**
 * 월세 중개수수료 계산 (환산 + 요율 적용)
 * @param deposit - 보증금 (원)
 * @param monthlyRent - 월세 (원)
 * @returns 중개수수료 (원)
 */
export function calculateWolseBrokerageFee(
  deposit: number,
  monthlyRent: number
): number {
  const transactionAmount = calculateWolseTransactionAmount(deposit, monthlyRent);
  return calculateBrokerageFee(transactionAmount, true);
}
