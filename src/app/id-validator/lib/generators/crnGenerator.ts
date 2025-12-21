/**
 * 테스트용 법인등록번호 생성 (13자리)
 */
export function generateTestCRN(): string {
  // 랜덤 등기관서 코드 (4자리)
  const registryCode = Math.floor(Math.random() * 9000) + 1000;

  // 랜덤 법인 종류 코드 (2자리)
  const corporateTypeCode = Math.floor(Math.random() * 90) + 10;

  // 랜덤 일련번호 (6자리)
  const serialNumber = Math.floor(Math.random() * 900000) + 100000;

  const first12 = `${registryCode}${corporateTypeCode}${serialNumber}`;

  // 체크섬 계산
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const weight = (i + 1) % 2 === 1 ? 1 : 2;
    sum += parseInt(first12[i]) * weight;
  }

  const checksum = (10 - (sum % 10)) % 10;

  return `${first12}${checksum}`;
}
