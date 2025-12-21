/**
 * 주민등록번호 유효성 검증
 * @param rrn - 주민등록번호 (하이픈 포함 가능)
 * @returns 검증 결과 객체
 */
export interface RRNValidationResult {
  isValid: boolean;
  message: string;
  details?: {
    birthDate: string;
    gender: 'male' | 'female';
    isKorean: boolean;
    age: number;
    checksumPassed?: boolean; // 2020년 10월 이후는 undefined
  };
}

export function validateRRN(rrn: string): RRNValidationResult {
  // 하이픈 제거 및 숫자만 추출
  const numbers = rrn.replace(/[^0-9]/g, '');

  // 길이 체크
  if (numbers.length !== 13) {
    return { isValid: false, message: '주민등록번호는 13자리여야 합니다.' };
  }

  // 생년월일 파싱
  const year = parseInt(numbers.substring(0, 2));
  const month = parseInt(numbers.substring(2, 4));
  const day = parseInt(numbers.substring(4, 6));
  const genderCode = parseInt(numbers[6]);

  // 월/일 유효성 검증
  if (month < 1 || month > 12) {
    return { isValid: false, message: '올바르지 않은 월입니다.' };
  }
  if (day < 1 || day > 31) {
    return { isValid: false, message: '올바르지 않은 일입니다.' };
  }

  // 성별 코드 유효성
  if (![1, 2, 3, 4, 5, 6, 7, 8].includes(genderCode)) {
    return { isValid: false, message: '올바르지 않은 성별 코드입니다.' };
  }

  // 세기 판단
  let fullYear: number;
  if (genderCode === 1 || genderCode === 2 || genderCode === 5 || genderCode === 6) {
    fullYear = 1900 + year;
  } else if (genderCode === 3 || genderCode === 4 || genderCode === 7 || genderCode === 8) {
    fullYear = 2000 + year;
  } else {
    fullYear = 1800 + year; // 9, 0 (1800년대, 거의 사용 안 됨)
  }

  // 윤년 계산
  const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  const daysInMonth = [31, isLeapYear(fullYear) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (day > daysInMonth[month - 1]) {
    return { isValid: false, message: `${month}월은 ${daysInMonth[month - 1]}일까지입니다.` };
  }

  // 2020년 10월 이후 발급분 체크
  const issueDate = new Date(fullYear, month - 1, day);
  const cutoffDate = new Date(2020, 9, 1); // 2020-10-01

  let checksumPassed: boolean | undefined = undefined;

  if (issueDate < cutoffDate) {
    // 2020년 10월 이전: 체크섬 검증
    const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
    let sum = 0;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(numbers[i]) * weights[i];
    }

    const checksum = (11 - (sum % 11)) % 10;
    const lastDigit = parseInt(numbers[12]);

    checksumPassed = checksum === lastDigit;

    if (!checksumPassed) {
      return { isValid: false, message: '체크섬 검증에 실패했습니다.' };
    }
  }

  // 성별 및 내외국인 판단
  const gender = [1, 3, 5, 7].includes(genderCode) ? 'male' : 'female';
  const isKorean = [1, 2, 3, 4].includes(genderCode);

  // 나이 계산
  const today = new Date();
  let age = today.getFullYear() - fullYear;
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) {
    age--;
  }

  return {
    isValid: true,
    message: checksumPassed === undefined
      ? '유효한 형식입니다 (2020년 10월 이후 발급분으로 체크섬 검증 제외)'
      : '유효한 주민등록번호입니다.',
    details: {
      birthDate: `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      gender,
      isKorean,
      age,
      checksumPassed
    }
  };
}
