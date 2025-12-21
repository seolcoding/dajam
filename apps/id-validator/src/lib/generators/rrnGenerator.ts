/**
 * 테스트용 주민등록번호 생성
 */
export function generateTestRRN(): string {
  const year = Math.floor(Math.random() * 75) + 50; // 1950-2024
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // 안전하게 1-28일
  const genderCode = Math.floor(Math.random() * 4) + 1; // 1-4

  const rrn =
    String(year).padStart(2, '0') +
    String(month).padStart(2, '0') +
    String(day).padStart(2, '0') +
    String(genderCode);

  // 뒤 5자리 랜덤 생성
  const randomPart = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');

  const first12 = rrn + randomPart.substring(0, 5);

  // 체크섬 계산
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(first12[i]) * weights[i];
  }

  const checksum = (11 - (sum % 11)) % 10;

  return `${first12}${checksum}`;
}
