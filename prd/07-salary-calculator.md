# 급여 실수령액 계산기 (Salary Calculator)

## 1. 개요

연봉 또는 월급여를 입력하면 4대보험 및 세금 공제 후 실제 월 실수령액을 계산해주는 웹 기반 계산기입니다.

### 핵심 가치
- **연봉 협상 시 실수령액 즉시 확인**: 면접 제안받은 연봉의 실제 손에 쥐는 금액 파악
- **정확한 4대보험 자동 계산**: 국민연금, 건강보험, 장기요양보험, 고용보험 자동 계산
- **직관적인 세금 시뮬레이션**: 간이세액표 기반 소득세/지방소득세 계산
- **직장인 필수 도구**: 이직 전 급여 비교, 급여 인상 협상 시 활용

### 타겟 유저
- 구직자 (연봉 협상 시)
- 이직 예정자 (급여 비교 시)
- 신입 사원 (급여명세서 이해 시)
- HR/인사담당자 (급여 설계 시)

---

## 2. 유사 서비스 분석

### 2.1 사람인 급여계산기
**URL**: https://www.saramin.co.kr/zf_user/tools/reverse-salary-calculator

**강점**
- 연봉/월급 선택 가능
- 비과세액(식대 20만원) 자동 적용
- 부양가족 수, 자녀 수 입력 가능
- 퇴직금 별도/포함 옵션 제공
- 깔끔한 UI/UX

**약점**
- 연봉 협상 시뮬레이션 기능 없음
- 세부 공제 항목 설명 부족
- 차트/시각화 없음

### 2.2 잡코리아 연봉계산기
**URL**: https://www.jobkorea.co.kr/service/user/tool/incomepaycalc

**강점**
- 세전/세후 비교 표시
- 4대보험 항목별 금액 표시
- 모바일 앱 지원

**약점**
- UI가 다소 복잡
- 계산 과정 설명 부족
- 인터랙티브 시뮬레이션 없음

### 2.3 차별화 전략
본 미니앱은 다음 기능으로 차별화합니다:

1. **연봉 협상 시뮬레이터**: 슬라이더로 연봉을 조정하며 실시간으로 실수령액 변화 확인
2. **시각화 강화**: Recharts 기반 공제 항목별 비율 파이차트, 월별 실수령액 라인차트
3. **교육적 요소**: 각 공제 항목에 대한 간단한 설명 툴팁 제공
4. **다크모드 지원**: 눈의 피로도를 줄이는 다크모드 테마
5. **URL 공유 기능**: 계산 결과를 쿼리스트링으로 공유 가능

---

## 3. 참고 자료

### 3.1 2024년 4대보험료율 (근로자 부담 기준)
- **국민연금**: 4.5% (사업주와 근로자가 각각 4.5%씩 부담)
- **건강보험**: 3.545% (사업주와 근로자가 각각 3.545%씩 부담)
- **장기요양보험**: 건강보험료의 12.95% (건강보험료에 대한 추가 부담)
- **고용보험**: 0.9% (사업주와 근로자가 각각 0.9%씩 부담)

**출처**: 4대사회보험정보연계센터, 국민건강보험공단

### 3.2 2024년 근로소득 간이세액표
월 급여액에 따른 소득세 원천징수 기준 (부양가족 1명 기준)

| 월 급여액 (비과세 제외) | 소득세 (원) |
|----------------------|-----------|
| 106만원 이하 | 0 |
| 210만원 | 25,200 |
| 300만원 | 52,870 |
| 400만원 | 88,200 |
| 500만원 | 127,080 |
| 700만원 | 218,490 |
| 1,000만원 | 380,340 |

**지방소득세**: 소득세의 10%

**출처**: 국세청 근로소득 간이세액표 (2024년)

### 3.3 비과세 항목
- **식대**: 월 20만원까지 비과세 (가장 일반적)
- **차량유지비**: 월 20만원까지 비과세 (영업직 등)
- **출산/보육수당**: 월 10만원까지 비과세
- **연구보조비**: 월 20만원까지 비과세 (연구직)

본 계산기는 **식대 20만원**을 기본 비과세로 적용합니다.

---

## 4. 기술 스택

### 4.1 프론트엔드
- **Build Tool**: Vite 6.x
- **Framework**: React 19 + TypeScript 5.x
- **Styling**: Tailwind CSS v4 (최신 버전)
- **상태관리**: React Hooks (useState, useMemo, useCallback)
- **차트 라이브러리**: Recharts 2.x

### 4.2 기타 라이브러리
- **number-precision**: 부동소수점 계산 오류 방지
- **react-tooltip**: 공제 항목 설명 툴팁
- **lucide-react**: 아이콘 (Calculator, Info, TrendingUp 등)

### 4.3 배포
- **호스팅**: Vercel / Cloudflare Pages
- **도메인**: seolcoding.com/apps/salary-calculator

---

## 5. 핵심 기능 및 구현

### 5.1 연봉/월급 입력 모드 전환
- **연봉 모드**: 연봉 입력 시 12개월로 나눠 월 급여 계산
- **월급 모드**: 월 급여 직접 입력
- **퇴직금**: "별도" 또는 "포함" 옵션 제공

### 5.2 4대보험 계산
```typescript
// 과세 대상 급여 = 총 급여 - 비과세액
const taxableIncome = monthlyGross - taxFreeAmount;

// 국민연금 (4.5%)
const nationalPension = taxableIncome * 0.045;

// 건강보험 (3.545%)
const healthInsurance = taxableIncome * 0.03545;

// 장기요양보험 (건강보험의 12.95%)
const longTermCare = healthInsurance * 0.1295;

// 고용보험 (0.9%)
const employmentInsurance = taxableIncome * 0.009;

// 총 4대보험료
const totalInsurance = nationalPension + healthInsurance + longTermCare + employmentInsurance;
```

### 5.3 소득세/지방소득세 계산
간이세액표를 활용한 소득세 계산 (부양가족 수, 자녀 수 반영)

```typescript
// 간이세액표 기반 소득세 계산
const incomeTax = calculateIncomeTax(taxableIncome, dependents, children);

// 지방소득세 (소득세의 10%)
const localIncomeTax = incomeTax * 0.1;
```

### 5.4 비과세 항목 입력
- 기본값: 식대 20만원
- 사용자 정의 입력 가능 (0 ~ 50만원)

### 5.5 월 실수령액 계산
```typescript
const netPay = monthlyGross - totalInsurance - incomeTax - localIncomeTax;
```

### 5.6 연봉 협상 시뮬레이터
- **슬라이더 입력**: 2,000만원 ~ 2억원 범위
- **실시간 계산**: 슬라이더 조작 시 디바운스 없이 즉시 반영
- **비교 모드**: 현재 연봉 vs 제안 연봉 비교
- **차트 시각화**:
  - 공제 항목별 파이차트
  - 연봉 범위별 실수령액 라인차트

---

## 6. 2024년 세율 및 보험료율 상수

```typescript
// src/constants/taxRates.ts

export const INSURANCE_RATES = {
  // 근로자 부담분
  NATIONAL_PENSION: 0.045,        // 4.5%
  HEALTH_INSURANCE: 0.03545,      // 3.545%
  LONG_TERM_CARE: 0.1295,         // 건강보험의 12.95%
  EMPLOYMENT_INSURANCE: 0.009,    // 0.9%
} as const;

export const TAX_FREE_LIMITS = {
  MEAL_ALLOWANCE: 200000,         // 식대 20만원
  CAR_ALLOWANCE: 200000,          // 차량유지비 20만원
  CHILDCARE_ALLOWANCE: 100000,    // 출산/보육수당 10만원
  RESEARCH_ALLOWANCE: 200000,     // 연구보조비 20만원
} as const;

export const LOCAL_INCOME_TAX_RATE = 0.1; // 소득세의 10%

// 간이세액표 (부양가족 1명 기준, 단위: 원)
export const SIMPLE_TAX_TABLE = [
  { min: 0, max: 1060000, tax: 0 },
  { min: 1060000, max: 1500000, tax: (income: number) => (income - 1060000) * 0.06 },
  { min: 1500000, max: 2100000, tax: 26400 + (income: number) => (income - 1500000) * 0.15 },
  { min: 2100000, max: 3000000, tax: 25200 + (income: number) => (income - 2100000) * 0.15 },
  { min: 3000000, max: 4000000, tax: 52870 + (income: number) => (income - 3000000) * 0.24 },
  { min: 4000000, max: 5000000, tax: 88200 + (income: number) => (income - 4000000) * 0.35 },
  { min: 5000000, max: 7000000, tax: 127080 + (income: number) => (income - 5000000) * 0.38 },
  { min: 7000000, max: 10000000, tax: 218490 + (income: number) => (income - 7000000) * 0.40 },
  { min: 10000000, max: Infinity, tax: 380340 + (income: number) => (income - 10000000) * 0.42 },
] as const;

// 8세 이상 20세 이하 자녀 세액공제 (자녀 수별)
export const CHILD_TAX_CREDIT = [
  0,      // 자녀 0명
  12500,  // 자녀 1명
  29160,  // 자녀 2명
  29160,  // 자녀 3명 이상 (동일)
] as const;
```

---

## 7. 핵심 계산 로직 (TypeScript)

```typescript
// src/utils/salaryCalculator.ts

import { INSURANCE_RATES, SIMPLE_TAX_TABLE, CHILD_TAX_CREDIT, LOCAL_INCOME_TAX_RATE } from '@/constants/taxRates';
import NP from 'number-precision'; // 부동소수점 오류 방지

interface SalaryInput {
  annualSalary?: number;      // 연봉 (연봉 모드)
  monthlyGross?: number;      // 월 급여 (월급 모드)
  taxFreeAmount: number;      // 비과세액 (기본 20만원)
  dependents: number;         // 부양가족 수 (본인 포함)
  children: number;           // 8세~20세 자녀 수
  includeRetirement: boolean; // 퇴직금 포함 여부
}

interface SalaryBreakdown {
  monthlyGross: number;           // 총 월 급여
  taxableIncome: number;          // 과세 대상 급여
  nationalPension: number;        // 국민연금
  healthInsurance: number;        // 건강보험
  longTermCare: number;           // 장기요양보험
  employmentInsurance: number;    // 고용보험
  totalInsurance: number;         // 총 4대보험료
  incomeTax: number;              // 소득세
  localIncomeTax: number;         // 지방소득세
  totalTax: number;               // 총 세금
  netPay: number;                 // 실수령액
}

export function calculateSalary(input: SalaryInput): SalaryBreakdown {
  // 1. 월 급여 계산
  let monthlyGross = input.monthlyGross ?? 0;

  if (input.annualSalary) {
    // 퇴직금 포함 연봉인 경우: 연봉의 1/13을 퇴직금으로 분리
    const divisor = input.includeRetirement ? 13 : 12;
    monthlyGross = NP.divide(input.annualSalary, divisor);
  }

  // 2. 과세 대상 급여 (총 급여 - 비과세액)
  const taxableIncome = NP.minus(monthlyGross, input.taxFreeAmount);

  // 3. 4대보험 계산
  const nationalPension = NP.times(taxableIncome, INSURANCE_RATES.NATIONAL_PENSION);
  const healthInsurance = NP.times(taxableIncome, INSURANCE_RATES.HEALTH_INSURANCE);
  const longTermCare = NP.times(healthInsurance, INSURANCE_RATES.LONG_TERM_CARE);
  const employmentInsurance = NP.times(taxableIncome, INSURANCE_RATES.EMPLOYMENT_INSURANCE);

  const totalInsurance = NP.plus(
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance
  );

  // 4. 소득세 계산 (간이세액표)
  let incomeTax = calculateIncomeTax(taxableIncome, input.dependents);

  // 5. 자녀 세액공제 (8세~20세)
  if (input.children > 0) {
    const childCredit = CHILD_TAX_CREDIT[Math.min(input.children, 3)];
    incomeTax = Math.max(0, NP.minus(incomeTax, childCredit));
  }

  // 6. 지방소득세 (소득세의 10%)
  const localIncomeTax = NP.times(incomeTax, LOCAL_INCOME_TAX_RATE);
  const totalTax = NP.plus(incomeTax, localIncomeTax);

  // 7. 실수령액 계산
  const netPay = NP.minus(monthlyGross, NP.plus(totalInsurance, totalTax));

  return {
    monthlyGross: Math.round(monthlyGross),
    taxableIncome: Math.round(taxableIncome),
    nationalPension: Math.round(nationalPension),
    healthInsurance: Math.round(healthInsurance),
    longTermCare: Math.round(longTermCare),
    employmentInsurance: Math.round(employmentInsurance),
    totalInsurance: Math.round(totalInsurance),
    incomeTax: Math.round(incomeTax),
    localIncomeTax: Math.round(localIncomeTax),
    totalTax: Math.round(totalTax),
    netPay: Math.round(netPay),
  };
}

// 간이세액표 기반 소득세 계산 (부양가족 1명 기준)
function calculateIncomeTax(taxableIncome: number, dependents: number): number {
  // 부양가족 수에 따른 공제율 조정 (간이세액표 기준)
  // 실제로는 부양가족 수별 세액표가 다르지만, 간단히 1명 기준으로 계산
  const bracket = SIMPLE_TAX_TABLE.find(
    (b) => taxableIncome >= b.min && taxableIncome < b.max
  );

  if (!bracket) return 0;

  const baseTax = typeof bracket.tax === 'function'
    ? bracket.tax(taxableIncome)
    : bracket.tax;

  // 부양가족 수에 따른 세액 감면 (대략적인 비율)
  const deductionRate = Math.max(0, 1 - (dependents - 1) * 0.05);
  return Math.round(baseTax * deductionRate);
}

// 연봉 범위별 실수령액 계산 (시뮬레이터용)
export function calculateSalaryRange(
  minSalary: number,
  maxSalary: number,
  step: number,
  baseInput: Omit<SalaryInput, 'annualSalary' | 'monthlyGross'>
): Array<{ salary: number; netPay: number }> {
  const results: Array<{ salary: number; netPay: number }> = [];

  for (let salary = minSalary; salary <= maxSalary; salary += step) {
    const breakdown = calculateSalary({
      ...baseInput,
      annualSalary: salary,
    });
    results.push({
      salary,
      netPay: breakdown.netPay,
    });
  }

  return results;
}
```

---

## 8. 컴포넌트 구조

```
src/
├── components/
│   ├── SalaryCalculator/
│   │   ├── index.tsx                    # 메인 컨테이너
│   │   ├── InputForm.tsx                # 연봉/월급 입력 폼
│   │   ├── DeductionBreakdown.tsx       # 공제 항목 상세 표시
│   │   ├── ResultCard.tsx               # 실수령액 결과 카드
│   │   ├── InsuranceChart.tsx           # 공제 항목 파이차트
│   │   ├── SalarySimulator.tsx          # 연봉 협상 시뮬레이터
│   │   ├── ComparisonChart.tsx          # 연봉 비교 라인차트
│   │   └── InfoTooltip.tsx              # 설명 툴팁
│   └── shared/
│       ├── Button.tsx                   # 공통 버튼
│       ├── Input.tsx                    # 공통 입력필드
│       ├── Slider.tsx                   # 슬라이더
│       └── Card.tsx                     # 카드 레이아웃
├── utils/
│   └── salaryCalculator.ts              # 계산 로직
├── constants/
│   └── taxRates.ts                      # 세율 상수
├── hooks/
│   ├── useSalaryCalculation.ts          # 급여 계산 훅
│   └── useLocalStorage.ts               # 로컬스토리지 저장
├── types/
│   └── salary.ts                        # 타입 정의
└── App.tsx                              # 앱 진입점
```

### 8.1 주요 컴포넌트 설명

#### InputForm.tsx
- 연봉/월급 토글 버튼
- 퇴직금 포함 여부 체크박스
- 비과세액 입력 (기본 20만원)
- 부양가족 수, 자녀 수 선택

#### DeductionBreakdown.tsx
- 4대보험 항목별 금액 표시
- 소득세/지방소득세 표시
- 각 항목에 InfoTooltip 추가 (설명 제공)
- 애니메이션 효과 (숫자 카운트업)

#### InsuranceChart.tsx
```typescript
// Recharts PieChart 예시
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={[
        { name: '국민연금', value: nationalPension },
        { name: '건강보험', value: healthInsurance },
        { name: '장기요양', value: longTermCare },
        { name: '고용보험', value: employmentInsurance },
        { name: '소득세', value: incomeTax },
        { name: '지방소득세', value: localIncomeTax },
      ]}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={renderCustomizedLabel}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

#### SalarySimulator.tsx
- 연봉 슬라이더 (2,000만원 ~ 2억원)
- 실시간 실수령액 업데이트
- 연봉 대비 실수령액 비율 표시
- ComparisonChart 컴포넌트 포함

#### ComparisonChart.tsx
```typescript
// Recharts LineChart 예시
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={salaryRangeData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="salary"
      tickFormatter={(value) => `${(value / 10000).toFixed(0)}만원`}
    />
    <YAxis
      tickFormatter={(value) => `${(value / 10000).toFixed(0)}만원`}
    />
    <Tooltip
      formatter={(value) => `${value.toLocaleString()}원`}
    />
    <Legend />
    <Line
      type="monotone"
      dataKey="netPay"
      stroke="#3b82f6"
      strokeWidth={2}
      name="실수령액"
    />
  </LineChart>
</ResponsiveContainer>
```

---

## 9. UI/UX 설계

### 9.1 레이아웃
```
┌─────────────────────────────────────────┐
│  급여 실수령액 계산기                      │
│  연봉 협상 시 얼마를 받게 될까요?          │
├─────────────────────────────────────────┤
│  [연봉 / 월급] 토글                       │
│  연봉: [________] 만원                    │
│  □ 퇴직금 포함                            │
│  비과세액(식대): [20] 만원                 │
│  부양가족: [1]명  자녀: [0]명             │
│                                         │
│  [계산하기 버튼]                          │
├─────────────────────────────────────────┤
│  💰 월 실수령액                           │
│  ┌─────────────────────┐                │
│  │   3,245,000원        │                │
│  │   (세전: 4,000,000원) │                │
│  └─────────────────────┘                │
│                                         │
│  📊 공제 내역                             │
│  ┌──────────┬──────────┐                │
│  │ 국민연금  │ 171,000원 │                │
│  │ 건강보험  │ 134,710원 │                │
│  │ 장기요양  │  17,445원 │                │
│  │ 고용보험  │  34,200원 │                │
│  │ 소득세   │ 326,700원 │                │
│  │ 지방소득세│  32,670원 │                │
│  └──────────┴──────────┘                │
│                                         │
│  [파이차트]                               │
├─────────────────────────────────────────┤
│  🎯 연봉 협상 시뮬레이터                   │
│  연봉: [===●====] 5,000만원              │
│  실수령액: 3,245,000원 (78.3%)           │
│                                         │
│  [라인차트: 연봉별 실수령액 추이]          │
└─────────────────────────────────────────┘
```

### 9.2 색상 팔레트 (Tailwind CSS)
- **Primary**: `blue-600` (계산 버튼, 강조)
- **Success**: `green-500` (실수령액)
- **Info**: `sky-400` (정보 툴팁)
- **Neutral**: `gray-100` ~ `gray-800` (배경, 텍스트)
- **차트 색상**:
  - 국민연금: `#3b82f6` (blue)
  - 건강보험: `#10b981` (green)
  - 장기요양: `#8b5cf6` (purple)
  - 고용보험: `#f59e0b` (amber)
  - 소득세: `#ef4444` (red)
  - 지방소득세: `#ec4899` (pink)

### 9.3 반응형 디자인
- **Mobile (< 640px)**: 1단 레이아웃
- **Tablet (640px ~ 1024px)**: 2단 레이아웃 (입력 | 결과)
- **Desktop (> 1024px)**: 3단 레이아웃 (입력 | 결과 | 차트)

---

## 10. 개발 우선순위

### Phase 1: MVP (1주)
- [x] 연봉 입력 폼
- [x] 4대보험 자동 계산
- [x] 소득세/지방소득세 계산
- [x] 실수령액 결과 표시
- [x] 공제 내역 상세 표시

### Phase 2: 시각화 (3일)
- [ ] Recharts 파이차트 (공제 항목)
- [ ] 결과 카드 디자인 개선
- [ ] 애니메이션 효과 (숫자 카운트업)

### Phase 3: 시뮬레이터 (3일)
- [ ] 연봉 슬라이더
- [ ] 실시간 계산
- [ ] 라인차트 (연봉별 실수령액)

### Phase 4: 추가 기능 (선택)
- [ ] URL 공유 기능 (쿼리스트링)
- [ ] 로컬스토리지 저장
- [ ] 다크모드 지원
- [ ] 인쇄 기능
- [ ] PDF 다운로드

---

## 11. 테스트 케이스

### 11.1 경계값 테스트
- 연봉 2,000만원: 월 실수령액 약 155만원
- 연봉 5,000만원: 월 실수령액 약 323만원
- 연봉 1억원: 월 실수령액 약 597만원

### 11.2 부양가족 테스트
- 부양가족 1명 (본인): 기본 세액
- 부양가족 3명: 세액 약 10% 감소

### 11.3 자녀 세액공제 테스트
- 자녀 1명: 12,500원 공제
- 자녀 2명: 29,160원 공제

### 11.4 비과세액 테스트
- 비과세 0원: 4대보험 최대
- 비과세 20만원: 일반적인 케이스
- 비과세 50만원: 특수직종

---

## 12. 배포 체크리스트

- [ ] TypeScript 타입 에러 0개
- [ ] ESLint 경고 0개
- [ ] Lighthouse 성능 90점 이상
- [ ] 모바일 반응형 테스트 (Chrome DevTools)
- [ ] 크로스 브라우저 테스트 (Chrome, Safari, Firefox)
- [ ] 메타 태그 설정 (OG 이미지, 설명)
- [ ] Google Analytics 연동
- [ ] 404 페이지 처리

---

## 13. 향후 확장 아이디어

1. **퇴직금 계산기**: 근무 기간별 예상 퇴직금 계산
2. **실업급여 계산기**: 퇴사 시 받을 수 있는 실업급여 계산
3. **연말정산 시뮬레이터**: 공제 항목별 환급액 예측
4. **비교 모드**: 여러 연봉 제안을 한 번에 비교
5. **경력별 평균 연봉**: 직무/경력별 시장 연봉 데이터 제공
6. **복리후생 환산**: 건강검진, 식대, 통신비 등을 연봉으로 환산

---

## 14. 참고 링크

- [국세청 근로소득 간이세액표](https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6426&cntntsId=7862)
- [4대사회보험정보연계센터](https://www.4insure.or.kr/)
- [국민건강보험공단 보험료율](https://www.nhis.or.kr/)
- [고용노동부 고용보험](https://www.ei.go.kr/)
- [사람인 급여계산기](https://www.saramin.co.kr/zf_user/tools/reverse-salary-calculator)
- [잡코리아 연봉계산기](https://www.jobkorea.co.kr/service/user/tool/incomepaycalc)

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

**작성일**: 2024-12-20
**버전**: 1.0
**작성자**: SeolCoding
