# 전세/월세 계산기 (Rent Calculator)

## 1. 개요

### 1.1 프로젝트 목표
한국 부동산 임대차 시장의 독특한 전세/월세 구조를 이해하고, 합리적인 임대차 계약을 체결할 수 있도록 돕는 웹 기반 계산 도구 개발

### 1.2 핵심 가치 제안
- **전세 ↔ 월세 양방향 변환**: 법정 전월세 전환율을 적용한 정확한 계산
- **한국 특화 부동산 도구**: 전세, 월세, 중개수수료 등 한국 부동산 시장의 특수성 반영
- **이사 시즌 필수**: 계약 갱신, 신규 계약 시 실질적인 의사결정 지원
- **실부담액 비교**: 대출 이자, 중개수수료 등을 포함한 총 비용 비교

### 1.3 타겟 사용자
- 임차인(세입자): 전세 vs 월세 결정, 계약 조건 협상
- 예비 임차인: 이사 준비 단계에서 예산 계획
- 부동산 관련 종사자: 빠른 견적 제공

---

## 2. 유사 서비스 분석

### 2.1 주요 경쟁 서비스

| 서비스 | 강점 | 약점 |
|--------|------|------|
| **한국부동산원 전월세전환 계산기** | - 공신력 있는 기관<br>- 법정 전환율 자동 적용<br>- 기준금리 연동 | - UI/UX 구식<br>- 단순 변환만 제공<br>- 대출 계산 미제공 |
| **부동산114 계산기** | - 다양한 부동산 계산기 통합<br>- 직관적인 UI | - 광고 과다<br>- 모바일 최적화 부족 |
| **네이버 전월세 계산기** | - 높은 접근성<br>- 깔끔한 UI | - 기본 기능만 제공<br>- 심화 분석 부족 |
| **부동산계산기.com** | - 전문적인 계산 기능<br>- 중개수수료 통합 계산 | - 오래된 디자인<br>- 사용성 개선 필요 |

### 2.2 차별화 전략
1. **All-in-One 통합 계산**: 전월세 변환 + 대출 이자 + 중개수수료 + 총 비용 비교를 하나의 화면에서 처리
2. **시각화 강화**: Recharts를 활용한 비용 비교 그래프, 손익분기점 분석
3. **모던 UX**: React 19 + Tailwind CSS v4 기반의 반응형 디자인
4. **실시간 계산**: 입력과 동시에 결과 반영, 빠른 의사결정 지원

---

## 3. 오픈소스 라이브러리

### 3.1 금융 계산 라이브러리
- **dinero.js**: 화폐 계산의 부동소수점 오류 방지
  - 정확한 월세, 이자 계산
  - 다양한 통화 단위 지원 (KRW)

### 3.2 날짜 계산
- **date-fns**: 계약 기간, 일할 계산
  - 경량 라이브러리 (moment.js 대체)
  - 트리 쉐이킹 지원

### 3.3 입력 검증
- **zod**: TypeScript-first schema validation
  - 입력값 유효성 검사
  - 타입 안전성 보장

---

## 4. 기술 스택

### 4.1 프론트엔드
- **Vite**: 빌드 도구 (빠른 HMR, 최적화된 번들링)
- **React 19**: UI 라이브러리 (최신 기능 활용)
- **TypeScript**: 타입 안전성, 개발 경험 향상
- **Tailwind CSS v4**: 유틸리티 우선 CSS 프레임워크

### 4.2 차트 및 시각화
- **Recharts**: React 기반 차트 라이브러리
  - 비용 비교 막대 그래프
  - 손익분기점 꺾은선 그래프
  - 누적 비용 영역 그래프

### 4.3 상태 관리
- **React Hook Form**: 폼 상태 관리
  - 성능 최적화 (불필요한 리렌더링 방지)
  - 유연한 검증 규칙

### 4.4 유틸리티
- **clsx**: 조건부 클래스명 관리
- **numeral**: 숫자 포맷팅 (천 단위 콤마, 백만 원 단위)

---

## 5. 핵심 기능 및 구현

### 5.1 전세 → 월세 변환

**입력:**
- 전세금
- 희망 보증금 (전세금보다 낮은 금액)
- 전월세 전환율 (기본값: 법정 상한 4.5%)

**출력:**
- 월세 = (전세금 - 보증금) × 연이율 / 12
- 예시: (2억 - 1억) × 4.5% / 12 = 375,000원

### 5.2 월세 → 전세 역계산

**입력:**
- 보증금
- 월세
- 전월세 전환율

**출력:**
- 전세 환산액 = 보증금 + (월세 × 12 / 전환율)
- 예시: 1억 + (50만 × 12 / 4.5%) = 2.33억

### 5.3 대출 포함 실부담액

**시나리오:** 전세 계약 시 보증금 부족으로 대출 필요

**입력:**
- 전세금 (예: 3억)
- 보유 자금 (예: 2억)
- 전세자금대출 금리 (예: 연 3.5%)

**출력:**
- 대출 금액: 1억
- 월 이자: 1억 × 3.5% / 12 = 291,666원
- 실질 월 부담액: 월세 환산액과 비교

### 5.4 중개수수료 계산

**입력:**
- 거래 유형 (매매, 전세, 월세)
- 거래 금액 (월세의 경우 환산 금액)

**계산:**
- 월세 환산액 = 보증금 + (월세 × 100) [단, 5천만 원 미만 시 ×70]
- 해당 구간의 상한 요율 적용

**출력:**
- 중개수수료 금액
- VAT 별도 안내

### 5.5 총 비용 비교 (2년 기준)

**전세 vs 월세 총 비용 비교:**

| 항목 | 전세 (3억, 대출 1억) | 월세 (보증금 1억, 월세 50만) |
|------|---------------------|---------------------------|
| 초기 비용 | 중개수수료 90만 | 중개수수료 40만 + 보증금 1억 |
| 월 부담액 | 대출 이자 29만 | 월세 50만 |
| 2년 총액 | 90만 + 29만×24 = 786만 | 40만 + 50만×24 = 1,240만 |

**시각화:**
- 막대 그래프: 초기 비용 vs 월 비용 vs 총 비용
- 꺾은선 그래프: 누적 비용 추이

### 5.6 손익분기점 분석

**목표:** 몇 개월 거주 시 전세가 유리한지 계산

**계산:**
- 전세 월 부담액 = 대출 이자
- 월세 월 부담액 = 월세
- 손익분기점 = (전세 초기 비용 - 월세 초기 비용) / (월세 월 부담액 - 전세 월 부담액)

**예시:**
- 전세: 초기 90만, 월 29만
- 월세: 초기 40만, 월 50만
- 손익분기점: (90만 - 40만) / (50만 - 29만) = 2.4개월
- 결론: 3개월 이상 거주 시 전세 유리

---

## 6. 전월세 전환율 계산 공식

### 6.1 법적 근거
- **주택임대차보호법 제7조의2** (월차임 전환 시 산정률의 제한)
- **주택임대차보호법 시행령 제9조** (월차임 전환 시 산정률)

### 6.2 전환율 상한

주택 전월세 전환율은 다음 두 가지 중 **낮은 비율**을 초과할 수 없음:

1. **고정 상한**: 10% (대통령령으로 정하는 비율)
2. **변동 상한**: 한국은행 기준금리 + 2%

**2025년 기준:**
- 한국은행 기준금리: 2.75% (2025년 3월 7일 기준)
- 법정 상한 = MIN(10%, 2.75% + 2%) = **4.75%**
- 실무 적용 상한: **4.5% ~ 5.0%** (시기별 변동)

### 6.3 계산 공식

#### 전세 → 월세 변환
```
월세 = (전세금 - 보증금) × 전환율 ÷ 12
```

#### 월세 → 전세 환산
```
전세 환산액 = 보증금 + (월세 × 12 ÷ 전환율)
```

### 6.4 전환율 변동 이력

| 적용일 | 한국은행 기준금리 | 법정 상한 (기준금리+2%) |
|--------|------------------|---------------------|
| 2025.05.29 | 2.50% | 4.50% |
| 2025.03.07 | 2.75% | 4.75% |
| 2024.12.05 | 3.00% | 5.00% |
| 2024.10.14 | 3.25% | 5.25% |
| 2023.01.13 | 3.50% | 5.50% |

**출처:** [한국부동산원 전월세전환 계산기](https://adrhome.reb.or.kr/adrhome/reb/transfer/transferCalculatorForm.do)

---

## 7. 중개수수료 요율표

### 7.1 주택 매매 중개수수료

| 거래금액 | 상한요율 | 한도액 |
|---------|---------|--------|
| 5천만 원 미만 | 0.6% | 25만 원 |
| 5천만 원 이상 ~ 2억 원 미만 | 0.5% | 80만 원 |
| 2억 원 이상 ~ 9억 원 미만 | 0.4% | - |
| 9억 원 이상 ~ 12억 원 미만 | 0.5% | - |
| 12억 원 이상 ~ 15억 원 미만 | 0.6% | - |
| 15억 원 이상 | 0.7% | - |

### 7.2 주택 임대차 (전세/월세) 중개수수료

| 거래금액 | 상한요율 | 한도액 |
|---------|---------|--------|
| 5천만 원 미만 | 0.5% | 20만 원 |
| 5천만 원 이상 ~ 1억 원 미만 | 0.4% | 30만 원 |
| 1억 원 이상 ~ 6억 원 미만 | 0.3% | - |
| 6억 원 이상 ~ 12억 원 미만 | 0.4% | - |
| 12억 원 이상 ~ 15억 원 미만 | 0.5% | - |
| 15억 원 이상 | 0.6% | - |

### 7.3 월세 거래금액 환산 공식

```
월세 거래금액 = 보증금 + (월세 × 계수)

계수:
- 5천만 원 미만: 70
- 5천만 원 이상: 100
```

**예시:**
- 보증금 2천만 원, 월세 40만 원
- 거래금액 = 2,000만 + (40만 × 100) = 6,000만 원
- 해당 구간: 5천만 원 이상 ~ 1억 원 미만
- 상한요율: 0.4%, 한도액: 30만 원
- 중개수수료 = MIN(6,000만 × 0.4%, 30만) = **24만 원**

### 7.4 법적 근거
- **공인중개사법 시행규칙 제20조** (중개보수 등)
- **2021년 개정 요율** (2025년 현재 동일 적용)

**참고:** 중개수수료는 거래 당사자 간 협의 가능하며, 상한 요율 내에서 낮게 책정 가능

**출처:**
- [경기부동산포털 중개보수 요율표](https://gris.gg.go.kr/reb/selectRebRateView.do)
- [2025년 부동산 중개보수 요율표 (세이프홈즈)](https://safehomes.kr/blog/magazine/446)

---

## 8. 핵심 계산 로직 (TypeScript)

### 8.1 전월세 변환 로직

```typescript
// src/lib/rentCalculator.ts

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
```

### 8.2 중개수수료 계산 로직

```typescript
// src/lib/brokerageFeeCalculator.ts

interface BrokerageFeeRate {
  min: number;
  max: number;
  rate: number;
  maxFee?: number;
}

// 주택 임대차 중개수수료 요율표
const RENTAL_FEE_RATES: BrokerageFeeRate[] = [
  { min: 0, max: 50_000_000, rate: 0.5, maxFee: 200_000 },
  { min: 50_000_000, max: 100_000_000, rate: 0.4, maxFee: 300_000 },
  { min: 100_000_000, max: 600_000_000, rate: 0.3 },
  { min: 600_000_000, max: 1_200_000_000, rate: 0.4 },
  { min: 1_200_000_000, max: 1_500_000_000, rate: 0.5 },
  { min: 1_500_000_000, max: Infinity, rate: 0.6 },
];

/**
 * 월세 거래금액 환산
 * @param deposit - 보증금 (원)
 * @param monthlyRent - 월세 (원)
 * @returns 환산 거래금액 (원)
 */
export function calculateWolseTransactionAmount(
  deposit: number,
  monthlyRent: number
): number {
  const multiplier = deposit + monthlyRent < 50_000_000 ? 70 : 100;
  return deposit + monthlyRent * multiplier;
}

/**
 * 중개수수료 계산
 * @param transactionAmount - 거래금액 (원)
 * @param isRental - 임대차 여부 (true: 전세/월세, false: 매매)
 * @returns 중개수수료 (원)
 */
export function calculateBrokerageFee(
  transactionAmount: number,
  isRental: boolean = true
): number {
  const rates = isRental ? RENTAL_FEE_RATES : SALE_FEE_RATES;

  const rateInfo = rates.find(
    (r) => transactionAmount >= r.min && transactionAmount < r.max
  );

  if (!rateInfo) {
    throw new Error('거래금액이 유효하지 않습니다');
  }

  const calculatedFee = transactionAmount * (rateInfo.rate / 100);

  // 한도액이 있는 경우 MIN(계산값, 한도액)
  if (rateInfo.maxFee) {
    return Math.min(calculatedFee, rateInfo.maxFee);
  }

  return Math.round(calculatedFee);
}

/**
 * 월세 중개수수료 계산 (환산 + 요율 적용)
 * @param deposit - 보증금 (원)
 * @param monthlyRent - 월세 (원)
 * @returns 중개수수료 (원)
 */
export function calculateWolseBrokerageFee(
  deposit: number,
  monthlyRent: number
): number {
  const transactionAmount = calculateWolseTransactionAmount(deposit, monthlyRent);
  return calculateBrokerageFee(transactionAmount, true);
}
```

### 8.3 대출 이자 계산 로직

```typescript
// src/lib/loanCalculator.ts

/**
 * 월 대출 이자 계산 (원리금 균등 상환 아님, 이자만 납부)
 * @param loanAmount - 대출 원금 (원)
 * @param annualRate - 연 이자율 (%)
 * @returns 월 이자 (원)
 */
export function calculateMonthlyInterest(
  loanAmount: number,
  annualRate: number
): number {
  const monthlyInterest = (loanAmount * (annualRate / 100)) / 12;
  return Math.round(monthlyInterest);
}

/**
 * 전세자금대출 포함 실부담액 계산
 * @param jeonse - 전세금 (원)
 * @param ownFunds - 보유 자금 (원)
 * @param loanRate - 대출 연이율 (%)
 * @returns { loanAmount, monthlyInterest }
 */
export function calculateJeonseLoanCost(
  jeonse: number,
  ownFunds: number,
  loanRate: number
): { loanAmount: number; monthlyInterest: number } {
  const loanAmount = jeonse - ownFunds;

  if (loanAmount <= 0) {
    return { loanAmount: 0, monthlyInterest: 0 };
  }

  const monthlyInterest = calculateMonthlyInterest(loanAmount, loanRate);

  return { loanAmount, monthlyInterest };
}
```

### 8.4 총 비용 비교 로직

```typescript
// src/lib/costComparison.ts

interface JeonseCost {
  type: 'jeonse';
  deposit: number;
  loanAmount: number;
  loanRate: number;
  brokerageFee: number;
  monthlyInterest: number;
  totalCost: number; // 2년 기준
}

interface WolseCost {
  type: 'wolse';
  deposit: number;
  monthlyRent: number;
  brokerageFee: number;
  totalCost: number; // 2년 기준
}

/**
 * 전세 총 비용 계산 (2년 기준)
 */
export function calculateJeonseTotalCost(
  jeonse: number,
  ownFunds: number,
  loanRate: number
): JeonseCost {
  const { loanAmount, monthlyInterest } = calculateJeonseLoanCost(
    jeonse,
    ownFunds,
    loanRate
  );

  const brokerageFee = calculateBrokerageFee(jeonse, true);

  // 2년(24개월) 기준 총 비용
  const totalCost = brokerageFee + monthlyInterest * 24;

  return {
    type: 'jeonse',
    deposit: jeonse,
    loanAmount,
    loanRate,
    brokerageFee,
    monthlyInterest,
    totalCost,
  };
}

/**
 * 월세 총 비용 계산 (2년 기준)
 */
export function calculateWolseTotalCost(
  deposit: number,
  monthlyRent: number
): WolseCost {
  const brokerageFee = calculateWolseBrokerageFee(deposit, monthlyRent);

  // 2년(24개월) 기준 총 비용
  const totalCost = brokerageFee + monthlyRent * 24;

  return {
    type: 'wolse',
    deposit,
    monthlyRent,
    brokerageFee,
    totalCost,
  };
}

/**
 * 손익분기점 계산
 * @returns 손익분기점 개월 수 (월세가 유리해지는 시점)
 */
export function calculateBreakEvenPoint(
  jeonseCost: JeonseCost,
  wolseCost: WolseCost
): number {
  const initialDiff = jeonseCost.brokerageFee - wolseCost.brokerageFee;
  const monthlyDiff = wolseCost.monthlyRent - jeonseCost.monthlyInterest;

  if (monthlyDiff <= 0) {
    // 월세 월 부담액이 전세 이하인 경우 손익분기점 없음
    return Infinity;
  }

  const breakEvenMonths = initialDiff / monthlyDiff;
  return Math.round(breakEvenMonths * 10) / 10; // 소수점 첫째 자리
}
```

### 8.5 입력 검증 스키마 (Zod)

```typescript
// src/lib/validationSchemas.ts

import { z } from 'zod';

export const jeonseToWolseSchema = z.object({
  jeonse: z
    .number()
    .min(10_000_000, '전세금은 최소 1천만 원 이상이어야 합니다')
    .max(50_000_000_000, '전세금이 너무 큽니다'),
  deposit: z.number().min(0, '보증금은 0원 이상이어야 합니다'),
  conversionRate: z
    .number()
    .min(0.1, '전환율은 0.1% 이상이어야 합니다')
    .max(10, '전환율은 10% 이하여야 합니다')
    .default(4.5),
}).refine((data) => data.deposit < data.jeonse, {
  message: '보증금은 전세금보다 낮아야 합니다',
  path: ['deposit'],
});

export const wolseToJeonseSchema = z.object({
  deposit: z.number().min(0, '보증금은 0원 이상이어야 합니다'),
  monthlyRent: z
    .number()
    .min(10_000, '월세는 최소 1만 원 이상이어야 합니다')
    .max(100_000_000, '월세가 너무 큽니다'),
  conversionRate: z
    .number()
    .min(0.1)
    .max(10)
    .default(4.5),
});

export const loanCostSchema = z.object({
  jeonse: z.number().min(10_000_000),
  ownFunds: z.number().min(0),
  loanRate: z
    .number()
    .min(0.1, '대출 금리는 0.1% 이상이어야 합니다')
    .max(20, '대출 금리는 20% 이하여야 합니다')
    .default(3.5),
}).refine((data) => data.ownFunds < data.jeonse, {
  message: '보유 자금이 전세금 이상이면 대출이 필요 없습니다',
  path: ['ownFunds'],
});
```

---

## 9. 컴포넌트 구조

### 9.1 전체 구조

```
src/
├── components/
│   ├── RentCalculator.tsx          # 메인 컨테이너
│   ├── JeonseToWolseConverter.tsx  # 전세→월세 변환
│   ├── WolseToJeonseConverter.tsx  # 월세→전세 변환
│   ├── LoanCostCalculator.tsx      # 대출 비용 계산
│   ├── BrokerageFeeCalculator.tsx  # 중개수수료 계산
│   ├── CostComparisonChart.tsx     # 비용 비교 차트
│   ├── BreakEvenAnalysis.tsx       # 손익분기점 분석
│   └── shared/
│       ├── NumberInput.tsx         # 숫자 입력 컴포넌트
│       ├── CurrencyDisplay.tsx     # 화폐 표시 컴포넌트
│       └── InfoTooltip.tsx         # 설명 툴팁
├── lib/
│   ├── rentCalculator.ts           # 전월세 변환 로직
│   ├── brokerageFeeCalculator.ts   # 중개수수료 로직
│   ├── loanCalculator.ts           # 대출 이자 로직
│   ├── costComparison.ts           # 비용 비교 로직
│   └── validationSchemas.ts        # Zod 스키마
├── hooks/
│   ├── useRentCalculation.ts       # 전월세 계산 훅
│   └── useCostComparison.ts        # 비용 비교 훅
└── types/
    └── rentCalculator.ts            # 타입 정의
```

### 9.2 주요 컴포넌트 상세

#### 9.2.1 RentCalculator.tsx (메인)

```typescript
// src/components/RentCalculator.tsx

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import JeonseToWolseConverter from './JeonseToWolseConverter';
import WolseToJeonseConverter from './WolseToJeonseConverter';
import CostComparisonChart from './CostComparisonChart';

export default function RentCalculator() {
  const [activeTab, setActiveTab] = useState<'jeonse-to-wolse' | 'wolse-to-jeonse'>('jeonse-to-wolse');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">전세/월세 계산기</h1>
        <p className="text-gray-600 mt-2">
          전세와 월세를 비교하고, 실제 부담액을 계산하세요
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="jeonse-to-wolse">전세 → 월세</TabsTrigger>
          <TabsTrigger value="wolse-to-jeonse">월세 → 전세</TabsTrigger>
        </TabsList>

        <TabsContent value="jeonse-to-wolse">
          <JeonseToWolseConverter />
        </TabsContent>

        <TabsContent value="wolse-to-jeonse">
          <WolseToJeonseConverter />
        </TabsContent>
      </Tabs>

      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-4">비용 비교 분석</h2>
        <CostComparisonChart />
      </section>
    </div>
  );
}
```

#### 9.2.2 JeonseToWolseConverter.tsx

```typescript
// src/components/JeonseToWolseConverter.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jeonseToWolseSchema } from '@/lib/validationSchemas';
import { jeonseToWolse } from '@/lib/rentCalculator';
import NumberInput from './shared/NumberInput';
import CurrencyDisplay from './shared/CurrencyDisplay';
import InfoTooltip from './shared/InfoTooltip';

interface FormData {
  jeonse: number;
  deposit: number;
  conversionRate: number;
}

export default function JeonseToWolseConverter() {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(jeonseToWolseSchema),
    defaultValues: {
      jeonse: 300_000_000,
      deposit: 100_000_000,
      conversionRate: 4.5,
    },
  });

  const formData = watch();

  let monthlyRent = 0;
  try {
    monthlyRent = jeonseToWolse(
      formData.jeonse,
      formData.deposit,
      formData.conversionRate
    );
  } catch (error) {
    // 에러 처리 (보증금 >= 전세금 등)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">입력</h3>

        <div className="space-y-4">
          <NumberInput
            label="전세금"
            {...register('jeonse', { valueAsNumber: true })}
            error={errors.jeonse?.message}
            unit="원"
            step={10_000_000}
          />

          <NumberInput
            label="월세 보증금"
            {...register('deposit', { valueAsNumber: true })}
            error={errors.deposit?.message}
            unit="원"
            step={10_000_000}
          />

          <div>
            <label className="flex items-center gap-2">
              전월세 전환율
              <InfoTooltip content="법정 상한은 기준금리 + 2% (현재 약 4.5%)" />
            </label>
            <NumberInput
              {...register('conversionRate', { valueAsNumber: true })}
              error={errors.conversionRate?.message}
              unit="%"
              step={0.1}
              max={10}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">결과</h3>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">월세</p>
            <CurrencyDisplay value={monthlyRent} className="text-3xl font-bold text-blue-600" />
          </div>

          <div className="pt-4 border-t border-blue-200">
            <p className="text-sm text-gray-600">계산 공식</p>
            <p className="text-xs text-gray-500 mt-1">
              월세 = (전세금 - 보증금) × 전환율 ÷ 12
            </p>
            <p className="text-xs text-gray-500 mt-1">
              = ({formData.jeonse.toLocaleString()} - {formData.deposit.toLocaleString()})
              × {formData.conversionRate}% ÷ 12
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### 9.2.3 CostComparisonChart.tsx

```typescript
// src/components/CostComparisonChart.tsx

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateJeonseTotalCost, calculateWolseTotalCost, calculateBreakEvenPoint } from '@/lib/costComparison';

export default function CostComparisonChart() {
  // 예시 데이터
  const jeonseCost = calculateJeonseTotalCost(300_000_000, 200_000_000, 3.5);
  const wolseCost = calculateWolseTotalCost(100_000_000, 500_000);

  const chartData = [
    {
      name: '초기 비용',
      전세: jeonseCost.brokerageFee,
      월세: wolseCost.brokerageFee,
    },
    {
      name: '월 부담액',
      전세: jeonseCost.monthlyInterest,
      월세: wolseCost.monthlyRent,
    },
    {
      name: '2년 총액',
      전세: jeonseCost.totalCost,
      월세: wolseCost.totalCost,
    },
  ];

  const breakEvenMonths = calculateBreakEvenPoint(jeonseCost, wolseCost);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString()}원`} />
          <Legend />
          <Bar dataKey="전세" fill="#3b82f6" />
          <Bar dataKey="월세" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm font-semibold">손익분기점</p>
        <p className="text-lg">
          {breakEvenMonths === Infinity
            ? '전세가 항상 유리합니다'
            : `약 ${breakEvenMonths}개월 이상 거주 시 전세 유리`}
        </p>
      </div>
    </div>
  );
}
```

### 9.3 재사용 가능한 공통 컴포넌트

#### NumberInput.tsx
```typescript
// src/components/shared/NumberInput.tsx

import { forwardRef } from 'react';

interface NumberInputProps {
  label?: string;
  error?: string;
  unit?: string;
  step?: number;
  min?: number;
  max?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, unit, step = 1, min = 0, max, ...props }, ref) => {
    return (
      <div>
        {label && <label className="block text-sm font-medium mb-1">{label}</label>}
        <div className="relative">
          <input
            ref={ref}
            type="number"
            step={step}
            min={min}
            max={max}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            {...props}
          />
          {unit && (
            <span className="absolute right-3 top-2 text-gray-500">{unit}</span>
          )}
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }
);

export default NumberInput;
```

#### CurrencyDisplay.tsx
```typescript
// src/components/shared/CurrencyDisplay.tsx

interface CurrencyDisplayProps {
  value: number;
  className?: string;
  showUnit?: boolean;
}

export default function CurrencyDisplay({
  value,
  className = '',
  showUnit = true
}: CurrencyDisplayProps) {
  const formatted = value.toLocaleString('ko-KR');

  return (
    <span className={className}>
      {formatted}{showUnit && '원'}
    </span>
  );
}
```

---

## 10. UI/UX 설계

### 10.1 레이아웃 구조
- **2단 그리드**: 입력 영역 (좌) + 결과 영역 (우)
- **탭 인터페이스**: 전세→월세 / 월세→전세 전환
- **시각화 섹션**: 하단에 비용 비교 차트

### 10.2 주요 인터랙션
1. **실시간 계산**: 입력값 변경 시 즉시 결과 반영
2. **슬라이더 + 입력**: 숫자 입력과 슬라이더 병행 지원
3. **툴팁 안내**: 전환율, 중개수수료 등 복잡한 개념 설명
4. **에러 메시지**: 유효하지 않은 입력 시 친절한 안내

### 10.3 반응형 디자인
- **모바일 (< 768px)**: 1단 레이아웃, 입력 → 결과 순서
- **태블릿 (768px ~ 1024px)**: 2단 유지, 차트 축소
- **데스크톱 (> 1024px)**: 최대 너비 1200px, 여백 활용

---

## 11. 개발 로드맵

### Phase 1: 기본 기능 (1주)
- [ ] 전세 → 월세 변환 로직
- [ ] 월세 → 전세 역계산 로직
- [ ] 기본 UI (입력 폼 + 결과 표시)

### Phase 2: 심화 기능 (1주)
- [ ] 중개수수료 계산 로직
- [ ] 대출 이자 계산 로직
- [ ] 비용 비교 테이블

### Phase 3: 시각화 (1주)
- [ ] Recharts 통합
- [ ] 비용 비교 막대 그래프
- [ ] 손익분기점 꺾은선 그래프

### Phase 4: 완성도 향상 (1주)
- [ ] 입력 검증 강화 (Zod)
- [ ] 에러 핸들링
- [ ] 반응형 디자인 최적화
- [ ] 사용성 테스트 및 개선

---

## 12. 테스트 시나리오

### 12.1 단위 테스트
```typescript
// src/lib/__tests__/rentCalculator.test.ts

import { jeonseToWolse, wolseToJeonse } from '../rentCalculator';

describe('jeonseToWolse', () => {
  it('전세 3억, 보증금 1억, 전환율 4.5% → 월세 75만원', () => {
    expect(jeonseToWolse(300_000_000, 100_000_000, 4.5)).toBe(750_000);
  });

  it('보증금 >= 전세금인 경우 에러 발생', () => {
    expect(() => jeonseToWolse(200_000_000, 300_000_000, 4.5)).toThrow();
  });
});

describe('wolseToJeonse', () => {
  it('보증금 1억, 월세 50만, 전환율 4.5% → 전세 약 2.33억', () => {
    const result = wolseToJeonse(100_000_000, 500_000, 4.5);
    expect(result).toBeCloseTo(233_333_333, -5); // ±10만 원 오차
  });
});
```

### 12.2 통합 테스트
- 입력 → 계산 → 결과 표시 전체 플로우
- 여러 탭 간 전환 시 상태 유지
- 차트 렌더링 검증

### 12.3 E2E 테스트
- Playwright를 활용한 사용자 시나리오 테스트
- 모바일/데스크톱 환경 테스트

---

## 13. 배포 및 운영

### 13.1 배포 환경
- **Vercel**: 프론트엔드 호스팅
- **커스텀 도메인**: rent-calculator.seolcoding.com (예시)

### 13.2 성능 최적화
- **Code Splitting**: 차트 라이브러리 lazy load
- **번들 크기 최적화**: 불필요한 라이브러리 제거
- **이미지 최적화**: 로고, 아이콘 WebP 포맷

### 13.3 모니터링
- **Google Analytics**: 사용자 행동 분석
- **Sentry**: 에러 추적

---

## 14. 향후 확장 가능성

### 14.1 추가 기능 아이디어
- **지역별 시세 연동**: 부동산 API 연동 (네이버 부동산, KB 시세)
- **계약서 자동 생성**: 입력값 기반 임대차 계약서 PDF 생성
- **계약 갱신 알림**: 계약 만료 2개월 전 푸시 알림
- **전월세 전환율 이력**: 과거 전환율 변동 추이 차트

### 14.2 B2B 확장
- **부동산 중개업소 API**: 계산 결과 공유 기능
- **임대인용 버전**: 적정 월세 산정 도구

---

## 15. 참고 자료

### 법률 및 제도
- [주택임대차보호법 제7조의2 (월차임 전환 시 산정률의 제한)](https://www.law.go.kr/)
- [공인중개사법 시행규칙 제20조 (중개보수 등)](https://www.law.go.kr/)
- [한국부동산원 전월세전환 계산기](https://adrhome.reb.or.kr/adrhome/reb/transfer/transferCalculatorForm.do)

### 오픈소스 도구
- [Recharts 공식 문서](https://recharts.org/)
- [Zod 공식 문서](https://zod.dev/)
- [React Hook Form 공식 문서](https://react-hook-form.com/)

### 참고한 계산기
- [경기부동산포털 중개보수 요율표](https://gris.gg.go.kr/reb/selectRebRateView.do)
- [부동산계산기.com](https://xn--989a00af8jnslv3dba.com/)
- [2025년 부동산 중개보수 요율표 (세이프홈즈)](https://safehomes.kr/blog/magazine/446)

---

## 16. 라이선스 및 책임 제한

### 16.1 라이선스
- **MIT License**: 오픈소스 프로젝트

### 16.2 책임 제한 고지
```
본 계산기는 참고용 도구이며, 법적 구속력이 없습니다.
실제 계약 시에는 반드시 전문가(공인중개사, 변호사)와 상담하시기 바랍니다.
계산 결과로 인한 손실에 대해 개발자는 책임을 지지 않습니다.
```

## 17. MCP 개발 도구

### 17.1 UI 컴포넌트 개발
- **Shadcn UI**: 검증된 컴포넌트 라이브러리
- `pnpm dlx shadcn@latest add [component]`로 추가
- `@mini-apps/ui` 패키지에서 공유

### 17.2 브라우저 테스트
- **Chrome DevTools MCP**: 실시간 UI 확인 및 디버깅
- 스냅샷/스크린샷으로 렌더링 확인
- 콘솔/네트워크 요청 분석
- 반응형 테스트 (모바일 뷰포트)

> 자세한 사용법은 `agents/mini-apps/CLAUDE.md` 참조

---

**작성일**: 2025-12-20
**작성자**: SeolCoding
**버전**: 1.0.0
