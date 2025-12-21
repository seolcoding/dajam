# 주민등록번호 검증기 (Korean ID Validator)

## 1. 개요

개발자와 테스터를 위한 한국 신분증 번호 검증 도구입니다. 주민등록번호, 사업자등록번호, 법인등록번호의 유효성을 체크섬 알고리즘으로 검증하며, 테스트용 유효한 번호 생성 기능을 제공합니다. 개인정보 보호를 위해 실제 데이터는 저장하지 않으며, 클라이언트 측에서만 처리됩니다.

**핵심 가치:**
- 개발/테스트 환경에서 유효성 검증 로직 테스트
- 체크섬 알고리즘 교육 및 학습 도구
- 실시간 입력 검증 및 즉각적인 피드백
- 개인정보 보호 (서버 전송 없음)

## 2. 유사 서비스 분석

### 2.1 기존 온라인 검증 도구
- **비즈노(bizno.net)**: 사업자등록번호 조회 및 진위확인 API 제공
- **국세청 홈택스**: 사업자 상태 조회 (공식)
- **공공데이터포털**: 국세청 사업자등록정보 진위확인 API
- **JavaScript 유효성 검사 블로그/라이브러리**: 다양한 개발자 블로그에서 코드 스니펫 제공

### 2.2 차별점
- **올인원 도구**: 주민등록번호, 사업자번호, 법인번호를 한 곳에서 검증
- **교육적 가치**: 체크섬 알고리즘을 시각적으로 보여주고 단계별 계산 과정 표시
- **테스트 번호 생성**: 유효한 테스트 데이터 자동 생성 (실제 번호 아님 경고 포함)
- **개인정보 보호 우선**: 모든 처리는 클라이언트 측에서만 수행, 서버 전송 없음
- **2020년 10월 이후 주민번호 대응**: 임의번호 체계 변경사항 반영

## 3. 참고 자료

### 3.1 주민등록번호
- [주민등록번호 검증 로직 - 나무위키](https://namu.wiki/w/주민등록번호)
- [JavaScript 주민등록번호 유효성검사 - kjslab](https://blog.kjslab.com/148)
- [React 주민등록번호 조건 검사 - velog](https://velog.io/@seondal/ReactJS-주민등록번호-조건-보다-깐깐하게-검사하기)
- [2020년 10월 주민번호 체계 변경 - 한국일보](https://www.hankookilbo.com/News/Read/A2025041609340002728)

### 3.2 사업자등록번호
- [국세청 사업자등록정보 진위확인 API - 공공데이터포털](https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15081808)
- [JavaScript 사업자 등록번호 유효성 검사 - 라떼군](https://www.mrlatte.net/code/2019/01/21/check-corporate-registration-number.html)
- [사업자번호 유효성 확인 - 홍페이지](https://hongpage.kr/96)

### 3.3 법인등록번호
- [법인등록번호 검증 - GitHub Gist](https://gist.github.com/susemeee/ccf35b90806bc29ee465420696cd2e26)
- [번호유효성체크 - eGovFrame](https://www.egovframe.go.kr/wiki/doku.php?id=egovframework:번호유효성체크)
- [법인등록번호 - 나무위키](https://namu.wiki/w/법인등록번호)

## 4. 기술 스택

```json
{
  "framework": "Vite 6.0+",
  "library": "React 19",
  "language": "TypeScript 5.7+",
  "styling": "Tailwind CSS v4",
  "icons": "Lucide React",
  "deployment": "Vercel / Netlify"
}
```

**개발 환경:**
- Node.js 20+ / pnpm
- ESLint + Prettier
- 100% 클라이언트 사이드 렌더링 (CSR)

## 5. 핵심 기능 및 구현

### 5.1 주민등록번호 검증

#### 5.1.1 입력 처리
- 자동 하이픈 삽입 (NNNNNN-NNNNNNN 형식)
- 13자리 숫자만 입력 가능
- 실시간 포맷팅

#### 5.1.2 유효성 검증
1. **형식 검증**: 13자리 숫자인지 확인
2. **생년월일 검증**:
   - 월(01-12), 일(01-31) 유효성
   - 윤년 계산 (2월 29일 검증)
3. **성별 코드 검증**: 1-4, 5-8 (외국인) 유효
4. **체크섬 검증**:
   - 2020년 10월 이전 발급: 체크섬 알고리즘 적용
   - 2020년 10월 이후 발급: 체크섬 검증 제외 (임의번호 체계)

#### 5.1.3 정보 추출
- 생년월일 파싱 및 표시
- 성별 구분 (남성/여성)
- 내/외국인 구분
- 현재 나이 계산

#### 5.1.4 2020년 10월 체계 변경 대응
```
[알림] 2020년 10월 이후 발급된 주민등록번호는
뒷자리가 임의번호로 변경되어 체크섬 검증이 적용되지 않습니다.
```

### 5.2 사업자등록번호 검증

#### 5.2.1 입력 처리
- 자동 하이픈 삽입 (NNN-NN-NNNNN 형식)
- 10자리 숫자만 입력 가능

#### 5.2.2 유효성 검증
- 형식 검증 (10자리)
- 체크섬 알고리즘 적용 (검증키: 1, 3, 7, 1, 3, 7, 1, 3, 5)

#### 5.2.3 정보 표시
- 사업자 유형 구분 (개인/법인 추정)
- 검증 결과 상세 표시

### 5.3 법인등록번호 검증

#### 5.3.1 입력 처리
- 자동 하이픈 삽입 (NNNNNN-NNNNNNN 형식, 13자리)
- 2025년 1월 31일 이전 발급분만 체크섬 검증

#### 5.3.2 유효성 검증
- 형식 검증 (13자리)
- 체크섬 알고리즘 (홀수: 1, 짝수: 2 가중치)
- 2025년 1월 31일 이후 발급분은 14자리 (체크섬 없음) 안내

#### 5.3.3 정보 표시
- 등기관서 코드 표시
- 법인 종류 코드 표시
- 검증 결과 상세 표시

### 5.4 테스트 번호 생성

#### 5.4.1 주민등록번호 생성
- 랜덤 생년월일 (1950-2024년)
- 랜덤 성별 (1-4)
- 유효한 체크섬 자동 계산
- 경고 메시지: "테스트용 번호입니다. 실제 개인과 무관합니다."

#### 5.4.2 사업자등록번호 생성
- 랜덤 일련번호
- 랜덤 사업자 구분 코드
- 유효한 체크섬 자동 계산

#### 5.4.3 법인등록번호 생성
- 랜덤 등기관서 코드
- 랜덤 법인 종류 코드
- 유효한 체크섬 자동 계산

### 5.5 알고리즘 시각화

- 단계별 계산 과정 표시
- 가중치 적용 과정 시각화
- 최종 체크섬 도출 과정 표시
- 교육용 툴팁 및 설명

### 5.6 개인정보 보호 안내

#### 5.6.1 안내 메시지
```
⚠️ 개인정보 보호 안내

1. 이 도구는 개발/테스트 목적으로만 사용하세요.
2. 실제 타인의 주민등록번호를 입력하지 마세요.
3. 모든 검증은 브라우저에서만 처리되며 서버로 전송되지 않습니다.
4. 생성된 테스트 번호는 유효한 형식이지만 실제 등록된 번호가 아닙니다.
5. 테스트 데이터는 법적 효력이 없습니다.
```

#### 5.6.2 보안 기능
- localStorage 사용 안 함 (히스토리 저장 안 함)
- 브라우저 로컬 처리만 사용
- 외부 API 호출 없음
- 개인정보 처리방침 링크 제공

## 6. 체크섬 알고리즘 (TypeScript)

### 6.1 주민등록번호 검증

```typescript
/**
 * 주민등록번호 유효성 검증
 * @param rrn - 주민등록번호 (하이픈 포함 가능)
 * @returns 검증 결과 객체
 */
interface RRNValidationResult {
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

function validateRRN(rrn: string): RRNValidationResult {
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

/**
 * 테스트용 주민등록번호 생성
 */
function generateTestRRN(): string {
  const year = Math.floor(Math.random() * 75) + 50; // 1950-2024
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // 안전하게 1-28일
  const genderCode = Math.floor(Math.random() * 4) + 1; // 1-4

  const rrn =
    String(year).padStart(2, '0') +
    String(month).padStart(2, '0') +
    String(day).padStart(2, '0') +
    String(genderCode);

  // 체크섬 계산
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    if (i < 7) {
      sum += parseInt(rrn[i]) * weights[i];
    } else {
      // 뒤 5자리는 임의로 생성
      const randomDigit = Math.floor(Math.random() * 10);
      sum += randomDigit * weights[i];
    }
  }

  const checksum = (11 - (sum % 11)) % 10;

  // 뒤 5자리 랜덤 생성
  const randomPart = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');

  return `${rrn}${randomPart.substring(0, 4)}${checksum}`;
}
```

## 7. 사업자등록번호 검증 알고리즘

```typescript
/**
 * 사업자등록번호 유효성 검증
 * @param brn - 사업자등록번호 (하이픈 포함 가능)
 * @returns 검증 결과 객체
 */
interface BRNValidationResult {
  isValid: boolean;
  message: string;
  details?: {
    type: 'individual' | 'corporation' | 'unknown';
    checksumPassed: boolean;
  };
}

function validateBRN(brn: string): BRNValidationResult {
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

/**
 * 테스트용 사업자등록번호 생성
 */
function generateTestBRN(): string {
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
```

## 8. 법인등록번호 검증 알고리즘

```typescript
/**
 * 법인등록번호 유효성 검증
 * @param crn - 법인등록번호 (하이픈 포함 가능)
 * @returns 검증 결과 객체
 */
interface CRNValidationResult {
  isValid: boolean;
  message: string;
  details?: {
    registryCode: string;
    corporateTypeCode: string;
    checksumPassed?: boolean; // 2025년 1월 31일 이후는 undefined
  };
}

function validateCRN(crn: string): CRNValidationResult {
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

/**
 * 테스트용 법인등록번호 생성 (13자리)
 */
function generateTestCRN(): string {
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
```

## 9. 컴포넌트 구조

```
src/
├── components/
│   ├── IDValidator/
│   │   ├── RRNValidator.tsx          # 주민등록번호 검증
│   │   ├── BRNValidator.tsx          # 사업자등록번호 검증
│   │   ├── CRNValidator.tsx          # 법인등록번호 검증
│   │   ├── AlgorithmViewer.tsx       # 알고리즘 시각화
│   │   └── PrivacyNotice.tsx         # 개인정보 보호 안내
│   ├── ui/
│   │   ├── Input.tsx                 # 포맷팅 인풋
│   │   ├── Button.tsx                # 버튼 컴포넌트
│   │   ├── Card.tsx                  # 카드 컴포넌트
│   │   ├── Badge.tsx                 # 배지 (유효/무효)
│   │   └── Alert.tsx                 # 경고/안내 메시지
│   └── layout/
│       ├── Header.tsx                # 헤더 (제목, 설명)
│       └── Footer.tsx                # 푸터 (출처)
├── lib/
│   ├── validators/
│   │   ├── rrn.ts                    # 주민등록번호 검증 로직
│   │   ├── brn.ts                    # 사업자등록번호 검증 로직
│   │   └── crn.ts                    # 법인등록번호 검증 로직
│   ├── generators/
│   │   ├── rrnGenerator.ts           # 테스트 주민번호 생성
│   │   ├── brnGenerator.ts           # 테스트 사업자번호 생성
│   │   └── crnGenerator.ts           # 테스트 법인번호 생성
│   └── utils/
│       └── formatters.ts             # 하이픈 자동 삽입
├── App.tsx                           # 메인 앱
└── main.tsx                          # 진입점
```

### 컴포넌트 인터페이스

```typescript
// RRNValidator.tsx
interface RRNValidatorProps {
  onValidate?: (result: RRNValidationResult) => void;
  showAlgorithm?: boolean;
}

// BRNValidator.tsx
interface BRNValidatorProps {
  onValidate?: (result: BRNValidationResult) => void;
  showAlgorithm?: boolean;
}

// CRNValidator.tsx
interface CRNValidatorProps {
  onValidate?: (result: CRNValidationResult) => void;
  showAlgorithm?: boolean;
}

// AlgorithmViewer.tsx
interface AlgorithmViewerProps {
  type: 'rrn' | 'brn' | 'crn';
  input: string;
  weights: number[];
  steps: {
    digit: number;
    weight: number;
    product: number;
  }[];
  sum: number;
  checksum: number;
}
```

## 10. 보안 및 개인정보 보호 고려사항

### 10.1 데이터 처리 원칙
- 모든 검증은 클라이언트 측에서만 수행
- 서버로 데이터 전송 안 함
- localStorage/sessionStorage 사용 안 함
- 브라우저 히스토리 저장 안 함

### 10.2 경고 메시지
```typescript
const PRIVACY_WARNINGS = {
  rrn: '⚠️ 실제 타인의 주민등록번호를 입력하지 마세요. 개인정보 보호법 위반입니다.',
  brn: 'ℹ️ 사업자등록번호는 공개 정보이지만, 실제 진위확인은 국세청 API를 사용하세요.',
  crn: 'ℹ️ 법인등록번호는 공개 정보이지만, 형식 검증만 가능합니다.',
  testData: '⚠️ 생성된 번호는 테스트용입니다. 실제 등록된 번호가 아니며 법적 효력이 없습니다.',
  education: '📚 이 도구는 교육 및 개발 테스트 목적으로만 사용하세요.'
};
```

### 10.3 법적 고지사항
```
## 법적 고지

본 서비스는 개발자와 테스터를 위한 교육용 도구입니다.

1. **개인정보 보호법 준수**: 타인의 개인정보를 무단으로 수집, 이용, 제공하는 행위는 법으로 금지됩니다.
2. **테스트 데이터 한정**: 생성된 번호는 유효한 형식이지만 실제 등록된 번호가 아닙니다.
3. **책임의 한계**: 본 서비스의 사용으로 인한 법적 문제는 사용자 책임입니다.
4. **공식 확인**: 실제 진위확인은 국세청, 대법원 등 공식 기관 API를 사용하세요.

[개인정보 처리방침] [이용약관]
```

### 10.4 안전한 사용 가이드
- 개발/테스트 환경에서만 사용
- 프로덕션 데이터 검증 시 공식 API 사용
- 생성된 테스트 번호의 책임있는 사용
- 교육 목적의 알고리즘 학습

## 11. UI/UX 설계

### 11.1 레이아웃
```
+------------------------------------------+
|  Korean ID Validator                     |
|  주민등록번호, 사업자등록번호, 법인등록번호 검증  |
+------------------------------------------+
| [주민등록번호] [사업자번호] [법인번호] 탭     |
+------------------------------------------+
|                                          |
|  번호 입력: [______-_______]              |
|  [검증하기] [테스트 번호 생성]              |
|                                          |
|  결과:                                    |
|  ✅ 유효한 주민등록번호입니다               |
|  생년월일: 1990-01-01                     |
|  성별: 남성                               |
|  나이: 35세                               |
|                                          |
|  [알고리즘 보기 ▼]                        |
|  ├─ 가중치: 2,3,4,5,6,7,8,9,2,3,4,5      |
|  ├─ 계산 과정: 1×2 + 2×3 + ...           |
|  └─ 체크섬: (11 - 76 % 11) % 10 = 5      |
|                                          |
+------------------------------------------+
|  ⚠️ 개인정보 보호 안내                     |
|  - 실제 번호 입력 금지                     |
|  - 브라우저에서만 처리                     |
|  - 테스트 목적으로만 사용                  |
+------------------------------------------+
```

### 11.2 색상 테마
- 유효: 초록색 (#10b981)
- 무효: 빨강색 (#ef4444)
- 경고: 노랑색 (#f59e0b)
- 정보: 파랑색 (#3b82f6)

### 11.3 반응형 디자인
- 모바일: 1열 레이아웃
- 태블릿: 2열 레이아웃
- 데스크톱: 3열 레이아웃 (각 번호 유형별)

## 12. 추가 기능 (선택)

### 12.1 일괄 검증
- CSV 파일 업로드
- 여러 번호 동시 검증
- 결과 다운로드 (JSON/CSV)

### 12.2 API 모드
- REST API 엔드포인트 제공
- JSON 요청/응답
- CORS 설정

### 12.3 통계 대시보드
- 검증 통계 (클라이언트 측)
- 유효/무효 비율
- 가장 많이 검증된 연도대

## 13. 배포 및 운영

### 13.1 배포
- Vercel/Netlify 자동 배포
- GitHub Actions CI/CD
- 환경변수: 없음 (100% 클라이언트)

### 13.2 모니터링
- Google Analytics (선택)
- 에러 트래킹 (Sentry, 선택)

### 13.3 SEO
- 메타 태그: "주민등록번호 검증, 사업자번호 검증, 개발자 도구"
- Open Graph 이미지
- 구조화된 데이터 (Schema.org)

## 14. 라이선스 및 크레딧

- MIT License
- 출처:
  - 주민등록번호 알고리즘: 행정안전부 공개 정보
  - 사업자등록번호 알고리즘: 국세청 공개 정보
  - 법인등록번호 알고리즘: 대법원 공개 정보
- 참고 자료: 위 "3. 참고 자료" 섹션 링크

## 15. MCP 개발 도구

### 15.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 15.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조

---

**작성일**: 2025-12-20
**버전**: 1.0.0
**작성자**: SeolCoding
