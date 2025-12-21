/**
 * 법인등록번호 유효성 검증
 * @param crn - 법인등록번호 (하이픈 포함 가능)
 * @returns 검증 결과 객체
 */
export interface CRNValidationResult {
  isValid: boolean;
  message: string;
  details?: {
    registryCode: string;
    corporateTypeCode: string;
    checksumPassed?: boolean; // 2025년 1월 31일 이후는 undefined
  };
}

export function validateCRN(crn: string): CRNValidationResult {
  // 하이픈 제거 및 숫자만 추출
  const numbers = crn.replace(/[^0-9]/g, '');

  // 길이 체크 (13자리 또는 14자리)
  if (numbers.length !== 13 && numbers.length !== 14) {
    return {
      isValid: false,
      message: '법인등록번호는 13자리 또는 14자리여야 합니다.'
    };
  }

  // 14자리는 2025년 1월 31일 이후 발급분 (체크섬 없음)
  if (numbers.length === 14) {
    const registryCode = numbers.substring(0, 4);
    const corporateTypeCode = numbers.substring(4, 6);

    return {
      isValid: true,
      message: '유효한 형식입니다 (2025년 1월 31일 이후 발급분, 체크섬 없음)',
      details: {
        registryCode,
        corporateTypeCode,
        checksumPassed: undefined
      }
    };
  }

  // 13자리: 체크섬 검증
  const registryCode = numbers.substring(0, 4);
  const corporateTypeCode = numbers.substring(4, 6);

  let sum = 0;

  // 홀수 자리는 1, 짝수 자리는 2를 곱함
  for (let i = 0; i < 12; i++) {
    const weight = (i + 1) % 2 === 1 ? 1 : 2;
    sum += parseInt(numbers[i]) * weight;
  }

  // 체크섬 계산
  const checksum = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(numbers[12]);

  const checksumPassed = checksum === lastDigit;

  if (!checksumPassed) {
    return { isValid: false, message: '체크섬 검증에 실패했습니다.' };
  }

  return {
    isValid: true,
    message: '유효한 법인등록번호입니다.',
    details: {
      registryCode,
      corporateTypeCode,
      checksumPassed
    }
  };
}
