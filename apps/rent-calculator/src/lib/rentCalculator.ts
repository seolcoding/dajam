/**
 * 전월세 변환 계산 로직
 */

/**
 * 전세를 월세로 변환
 * @param jeonse - 전세금 (원)
 * @param deposit - 월세 보증금 (원)
 * @param conversionRate - 전월세 전환율 (%, 기본값 4.5)
 * @returns 월세 (원)
 */
export function jeonseToWolse(
  jeonse: number,
  deposit: number,
  conversionRate: number = 4.5
): number {
  if (deposit >= jeonse) {
    throw new Error('보증금은 전세금보다 낮아야 합니다');
  }

  const monthlyRent = ((jeonse - deposit) * (conversionRate / 100)) / 12;
  return Math.round(monthlyRent);
}

/**
 * 월세를 전세로 환산
 * @param deposit - 월세 보증금 (원)
 * @param monthlyRent - 월세 (원)
 * @param conversionRate - 전월세 전환율 (%, 기본값 4.5)
 * @returns 전세 환산액 (원)
 */
export function wolseToJeonse(
  deposit: number,
  monthlyRent: number,
  conversionRate: number = 4.5
): number {
  const jeonseEquivalent = deposit + (monthlyRent * 12) / (conversionRate / 100);
  return Math.round(jeonseEquivalent);
}
