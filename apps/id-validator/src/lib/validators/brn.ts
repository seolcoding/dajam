/**
 * 사업자등록번호 유효성 검증
 * @param brn - 사업자등록번호 (하이픈 포함 가능)
 * @returns 검증 결과 객체
 */
export interface BRNValidationResult {
  isValid: boolean;
  message: string;
  details?: {
    type: 'individual' | 'corporation' | 'unknown';
    checksumPassed: boolean;
  };
}

export function validateBRN(brn: string): BRNValidationResult {
  // 하이픈 제거 및 숫자만 추출
  const numbers = brn.replace(/[^0-9]/g, '');

  // 길이 체크
  if (numbers.length !== 10) {
    return { isValid: false, message: '사업자등록번호는 10자리여야 합니다.' };
  }

  // 검증키
  const checkKey = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  // 앞 9자리와 검증키를 각각 곱해서 더함
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * checkKey[i];
  }

  // 9번째 자리(인덱스 8)는 특별 처리
  sum += Math.floor((parseInt(numbers[8]) * 5) / 10);

  // 체크섬 계산
  const checksum = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(numbers[9]);

  const checksumPassed = checksum === lastDigit;

  if (!checksumPassed) {
    return { isValid: false, message: '체크섬 검증에 실패했습니다.' };
  }

  // 사업자 유형 추정 (4-5번째 자리)
  const typeCode = parseInt(numbers.substring(3, 5));
  let type: 'individual' | 'corporation' | 'unknown' = 'unknown';

  if (typeCode >= 0 && typeCode <= 79) {
    type = 'individual'; // 개인사업자
  } else if (typeCode >= 81 && typeCode <= 87) {
    type = 'corporation'; // 법인사업자
  }

  return {
    isValid: true,
    message: '유효한 사업자등록번호입니다.',
    details: {
      type,
      checksumPassed
    }
  };
}
