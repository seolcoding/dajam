/**
 * 테스트용 주민등록번호 생성
 * 1900년대(genderCode 1-2) 또는 2000년대(genderCode 3-4) 생년 생성
 */
export function generateTestRRN(): string {
  // 50% 확률로 1900년대 또는 2000년대 선택
  const is2000s = Math.random() > 0.5;

  let year: number;
  let genderCode: number;

  if (is2000s) {
    // 2000-2019 (체크섬 검증 대상)
    year = Math.floor(Math.random() * 20); // 0-19
    genderCode = Math.floor(Math.random() * 2) + 3; // 3-4
  } else {
    // 1950-1999
    year = Math.floor(Math.random() * 50) + 50; // 50-99
    genderCode = Math.floor(Math.random() * 2) + 1; // 1-2
  }

  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // 안전하게 1-28일

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
