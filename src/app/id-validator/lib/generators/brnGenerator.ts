/**
 * 테스트용 사업자등록번호 생성
 */
export function generateTestBRN(): string {
  // 랜덤 번호 생성 (앞 3자리 + 구분코드 2자리 + 일련번호 4자리)
  const part1 = Math.floor(Math.random() * 900) + 100; // 100-999
  const part2 = Math.floor(Math.random() * 80); // 0-79 (개인사업자)
  const part3 = Math.floor(Math.random() * 9000) + 1000; // 1000-9999

  const first9 = `${part1}${String(part2).padStart(2, '0')}${part3}`;

  // 체크섬 계산
  const checkKey = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(first9[i]) * checkKey[i];
  }

  sum += Math.floor((parseInt(first9[8]) * 5) / 10);
  const checksum = (10 - (sum % 10)) % 10;

  return `${first9}${checksum}`;
}
