# 더치페이 정산 (Dutch Pay Calculator)

## 1. 개요

### 1.1 제품 소개
모임/회식 후 정산을 간편하게 처리하는 웹 기반 더치페이 계산기입니다. 총무가 한 번에 정리해서 카카오톡으로 공유할 수 있으며, 최소 송금 횟수로 정산을 최적화합니다.

### 1.2 핵심 가치
- **간편성**: 복잡한 계산 없이 자동으로 정산 내역 생성
- **최적화**: 송금 횟수를 최소화하여 정산 과정 단순화
- **공유 편의성**: 카카오톡 공유용 텍스트 및 이미지 1클릭 생성
- **다양한 정산 방식**: N분의 1, 개별 항목, 혼합 정산 지원

### 1.3 주요 정산 유형
1. **N분의 1 정산**: 모든 참여자가 동일한 금액 부담
2. **개별 항목 정산**: 각자 소비한 항목만 정산
3. **혼합 정산**: 공통 비용(예: 장소 대여) + 개별 비용(예: 음식) 조합
4. **비율 정산**: 참여자별 다른 비율 적용 (예: 어른/학생)

---

## 2. 유사 서비스 분석

### 2.1 카카오페이 정산
**장점**:
- 카카오톡 기반으로 접근성 최강
- 1/N 정산 자동 계산
- 영수증/사진 첨부 기능
- 미정산자 자동 알림
- 자투리 금액 카카오페이가 처리
- 카카오페이 머니로 즉시 송금 가능

**단점**:
- 카카오페이 가입 필요
- 개별 항목별 세부 정산 불가
- 복잡한 정산 시나리오 처리 어려움

### 2.2 Bill Split Pro
**장점**:
- 브라우저 기반으로 앱 설치 불필요
- 최소 송금 횟수 알고리즘 적용
- 링크 공유로 모든 기기에서 접근 가능

**단점**:
- 한국 사용자 UI/UX 최적화 부족
- 한글 지원 미흡

### 2.3 Splitwise
**장점**:
- 그룹별 지속적인 정산 관리
- 복잡한 정산 시나리오 지원
- 송금 횟수 최소화 알고리즘

**단점**:
- 일회성 모임에는 과도한 기능
- 앱 설치 필요
- 한국 시장 특화 기능 부족

### 2.4 차별화 포인트
우리 서비스는:
- **한국 시장 특화**: 카카오톡 공유 최적화, 한글 UI
- **일회성 모임 최적화**: 앱 설치 없이 즉시 사용
- **최소 송금 알고리즘**: 정산 복잡도 최소화
- **시각적 공유**: 이미지 생성으로 쉬운 공유

**참고 자료**:
- [카카오톡 정산하기 및 더치페이 요청하기 방법](https://shiningsense.com/2773)
- [Split Bills with Dutch: From Idea To App Release](https://medium.com/@alexsoong_33845/split-bills-with-dutch-from-idea-to-app-release-be5db9a8e066)
- [Split bills with friends — the algorithm behind Tricount and Splitwise](https://medium.com/@alexbrou/split-bills-with-friends-the-algorithm-behind-tricount-and-splitwise-using-integer-programming-48cd01999507)

---

## 3. 오픈소스 라이브러리

### 3.1 필수 라이브러리
```json
{
  "clipboard": {
    "name": "Clipboard API",
    "description": "브라우저 내장 API로 텍스트 복사 기능",
    "usage": "navigator.clipboard.writeText()"
  },
  "html2canvas": {
    "name": "html2canvas",
    "description": "HTML을 Canvas로 변환하여 이미지 생성",
    "npm": "html2canvas",
    "usage": "정산 내역을 PNG 이미지로 변환하여 다운로드/공유"
  },
  "qrcode": {
    "name": "qrcode",
    "description": "계좌번호/링크를 QR 코드로 생성",
    "npm": "qrcode",
    "usage": "송금 링크 QR 코드 생성"
  }
}
```

### 3.2 선택적 라이브러리
```json
{
  "zustand": {
    "name": "Zustand",
    "description": "경량 상태 관리 라이브러리",
    "npm": "zustand",
    "usage": "정산 데이터 전역 상태 관리"
  },
  "date-fns": {
    "name": "date-fns",
    "description": "날짜 포맷팅 유틸리티",
    "npm": "date-fns",
    "usage": "정산 생성일 표시"
  }
}
```

---

## 4. 기술 스택

### 4.1 프론트엔드
- **Framework**: Vite 6.x + React 19
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React (간결한 아이콘 라이브러리)

### 4.2 브라우저 API
- **Clipboard API**: 텍스트 복사
- **Canvas API**: 이미지 생성
- **LocalStorage API**: 정산 내역 임시 저장

### 4.3 빌드 및 배포
- **Build**: Vite
- **Deploy**: Vercel / Netlify
- **Repository**: GitHub

---

## 5. 핵심 기능 및 구현

### 5.1 정산 생성
**입력 필드**:
- 모임 이름 (예: "2025 연말 회식")
- 정산 날짜 (기본값: 오늘)
- 총무 지정 (정산 대표자)

**참여자 관리**:
- 참여자 이름 추가/삭제
- 참여자 순서 변경 (드래그앤드롭)
- 최소 2명 이상 필수

**UI/UX**:
```
┌─────────────────────────────┐
│ 모임 이름: [연말 회식_____] │
│ 정산 날짜: [2025-12-20___] │
│ 총무: [김철수 ▼]            │
├─────────────────────────────┤
│ 참여자 (5명)                │
│ • 김철수 (총무) [x]         │
│ • 이영희 [x]                │
│ • 박민수 [x]                │
│ + 참여자 추가               │
└─────────────────────────────┘
```

### 5.2 지출 항목 추가
**항목 정보**:
- 항목명 (예: "1차 회식", "2차 술집", "노래방")
- 금액 (숫자만 입력, 천 단위 콤마 자동 추가)
- 결제자 선택 (드롭다운)
- 참여자 선택 (체크박스, 전체 선택/해제 토글)

**정산 방식 선택**:
1. **균등 분할**: 선택된 참여자가 동일한 금액 부담
2. **개별 금액**: 참여자별로 금액 직접 입력
3. **비율**: 참여자별 비율 설정 (예: 100%, 50%)

**UI/UX**:
```
┌─────────────────────────────┐
│ 항목 추가                   │
├─────────────────────────────┤
│ 항목명: [1차 회식_______]  │
│ 금액: [80,000원_________]   │
│ 결제자: [김철수 ▼]         │
│                             │
│ 참여자 선택 [전체 ☑]        │
│ ☑ 김철수  ☑ 이영희          │
│ ☑ 박민수  ☑ 최지훈          │
│ ☑ 정수아                    │
│                             │
│ 정산 방식: ⦿ 균등 분할      │
│           ○ 개별 금액       │
│           ○ 비율            │
│                             │
│ [취소] [항목 추가]          │
└─────────────────────────────┘
```

### 5.3 정산 유형

#### 5.3.1 N분의 1 정산
- 모든 지출 항목을 참여 인원수로 나눔
- 가장 간단한 정산 방식
- 예: 총 150,000원 ÷ 5명 = 1인당 30,000원

#### 5.3.2 개별 정산
- 각 항목별로 참여자 선택
- 참여자만 해당 항목 금액 분담
- 예: 노래방 70,000원 (3명만 참여) → 1인당 23,333원

#### 5.3.3 비율 정산
- 참여자별 다른 부담 비율 설정
- 예: 어른 100%, 학생 50%
- 자동으로 비율에 맞춰 금액 계산

### 5.4 정산 결과

**정산 요약**:
- 총 금액
- 참여 인원
- 항목별 소계

**개인별 정산 내역**:
- 각자가 지불한 금액
- 각자가 소비한 금액
- 차액 (받을 돈 / 보낼 돈)

**최적 송금 관계**:
- 최소 송금 횟수 알고리즘 적용
- 송금자 → 수령자 관계 명시
- 송금 금액 표시

**UI/UX**:
```
┌─────────────────────────────┐
│ 📊 정산 결과                │
├─────────────────────────────┤
│ 총 금액: 150,000원          │
│ 참여: 5명                   │
│                             │
│ 💰 송금 안내                │
│ • 이영희 → 김철수 30,000원  │
│ • 박민수 → 김철수 25,000원  │
│ • 최지훈 → 정수아 15,000원  │
│                             │
│ 📝 개인별 내역              │
│ 김철수: +55,000원 (받음)    │
│ 이영희: -30,000원 (보냄)    │
│ 박민수: -25,000원 (보냄)    │
│ 최지훈: -15,000원 (보냄)    │
│ 정수아: +15,000원 (받음)    │
│                             │
│ [텍스트 복사] [이미지 저장] │
└─────────────────────────────┘
```

### 5.5 공유 기능

#### 5.5.1 카카오톡 공유용 텍스트
- 1클릭 복사 기능 (Clipboard API)
- 이모지 포함 가독성 높은 포맷
- 송금 안내 중심 구성

#### 5.5.2 정산 내역 이미지
- HTML을 Canvas로 변환 (html2canvas)
- PNG 형식으로 다운로드
- 카카오톡/SNS 공유용

#### 5.5.3 링크 공유
- URL에 정산 데이터 인코딩
- 링크만으로 정산 내역 공유 가능
- QR 코드 생성 (qrcode 라이브러리)

### 5.6 정산 내역 템플릿

```
📊 [연말 회식] 정산 내역

총 금액: 150,000원
참여: 5명 (김철수, 이영희, 박민수, 최지훈, 정수아)

💰 송금 안내:
• 이영희 → 김철수 30,000원
• 박민수 → 김철수 25,000원
• 최지훈 → 정수아 15,000원

📝 상세 내역:
• 1차 회식: 80,000원 (5명)
• 2차 술집: 70,000원 (4명 - 정수아 제외)

---
정산 일시: 2025-12-20
총무: 김철수
```

---

## 6. 데이터 모델 (TypeScript)

### 6.1 핵심 타입 정의

```typescript
// 참여자 정보
interface Participant {
  id: string;
  name: string;
  isTreasurer: boolean; // 총무 여부
}

// 정산 방식
type SplitMethod = 'equal' | 'individual' | 'ratio';

// 개별 금액 설정 (individual 방식)
interface IndividualAmount {
  participantId: string;
  amount: number;
}

// 비율 설정 (ratio 방식)
interface RatioSetting {
  participantId: string;
  ratio: number; // 100 = 100%, 50 = 50%
}

// 지출 항목
interface Expense {
  id: string;
  name: string; // 항목명 (예: "1차 회식")
  amount: number; // 총 금액
  paidBy: string; // 결제자 ID (Participant.id)
  participantIds: string[]; // 참여자 ID 목록
  splitMethod: SplitMethod;
  individualAmounts?: IndividualAmount[]; // splitMethod === 'individual'
  ratioSettings?: RatioSetting[]; // splitMethod === 'ratio'
  createdAt: Date;
}

// 정산 세션
interface Settlement {
  id: string;
  name: string; // 모임 이름 (예: "연말 회식")
  date: Date; // 정산 날짜
  participants: Participant[];
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

// 개인별 정산 결과
interface PersonalBalance {
  participantId: string;
  participantName: string;
  totalPaid: number; // 지불한 총 금액
  totalOwed: number; // 부담해야 할 총 금액
  balance: number; // 차액 (양수: 받을 돈, 음수: 보낼 돈)
}

// 송금 거래
interface Transaction {
  from: string; // 송금자 ID
  to: string; // 수령자 ID
  amount: number;
}

// 최종 정산 결과
interface SettlementResult {
  settlement: Settlement;
  personalBalances: PersonalBalance[];
  transactions: Transaction[]; // 최적화된 송금 목록
  totalAmount: number;
  participantCount: number;
}
```

### 6.2 유틸리티 타입

```typescript
// 정산 공유 데이터 (URL 인코딩용)
interface ShareableSettlement {
  name: string;
  date: string; // ISO 8601 format
  participants: { id: string; name: string; isTreasurer: boolean }[];
  expenses: {
    name: string;
    amount: number;
    paidBy: string;
    participantIds: string[];
    splitMethod: SplitMethod;
  }[];
}

// 로컬스토리지 저장 데이터
interface StoredSettlement {
  id: string;
  name: string;
  date: string;
  participantCount: number;
  totalAmount: number;
  createdAt: string;
}
```

---

## 7. 최적 정산 알고리즘 (송금 최소화)

### 7.1 알고리즘 개요

정산 최적화의 핵심은 **송금 횟수를 최소화**하는 것입니다. 이는 다음과 같은 방식으로 구현합니다:

1. 각 참여자의 순 잔액(balance) 계산
   - 양수: 받을 돈이 있음 (채권자, creditor)
   - 음수: 보낼 돈이 있음 (채무자, debtor)

2. 채권자와 채무자를 매칭하여 거래 생성
   - 그리디 알고리즘: 가장 많이 받을 사람과 가장 많이 보낼 사람을 우선 매칭
   - 매칭 시 작은 금액으로 결제하여 한 쪽의 잔액을 0으로 만듦

3. 모든 잔액이 0이 될 때까지 반복

### 7.2 TypeScript 구현

```typescript
/**
 * 최소 송금 횟수 알고리즘
 * Greedy approach: 가장 큰 채권자와 채무자를 매칭하여 거래 생성
 */
function calculateOptimalTransactions(
  personalBalances: PersonalBalance[]
): Transaction[] {
  const transactions: Transaction[] = [];

  // 잔액을 복사하여 작업용 배열 생성 (원본 데이터 보존)
  const balances = personalBalances.map(pb => ({
    participantId: pb.participantId,
    participantName: pb.participantName,
    balance: pb.balance
  }));

  // 채권자(받을 사람)와 채무자(보낼 사람) 분리
  const getCreditors = () =>
    balances
      .filter(b => b.balance > 0)
      .sort((a, b) => b.balance - a.balance); // 내림차순

  const getDebtors = () =>
    balances
      .filter(b => b.balance < 0)
      .sort((a, b) => a.balance - b.balance); // 오름차순

  // 모든 잔액이 0이 될 때까지 반복
  while (true) {
    const creditors = getCreditors();
    const debtors = getDebtors();

    // 더 이상 송금할 거래가 없으면 종료
    if (creditors.length === 0 || debtors.length === 0) {
      break;
    }

    // 가장 많이 받을 사람과 가장 많이 보낼 사람 매칭
    const creditor = creditors[0];
    const debtor = debtors[0];

    // 거래 금액 = min(받을 금액, 보낼 금액의 절댓값)
    const amount = Math.min(
      creditor.balance,
      Math.abs(debtor.balance)
    );

    // 거래 생성
    transactions.push({
      from: debtor.participantId,
      to: creditor.participantId,
      amount: Math.round(amount) // 원 단위로 반올림
    });

    // 잔액 업데이트
    creditor.balance -= amount;
    debtor.balance += amount;

    // 부동소수점 오차 제거 (0에 가까우면 0으로 처리)
    if (Math.abs(creditor.balance) < 0.01) creditor.balance = 0;
    if (Math.abs(debtor.balance) < 0.01) debtor.balance = 0;
  }

  return transactions;
}

/**
 * 개인별 잔액 계산
 */
function calculatePersonalBalances(
  settlement: Settlement
): PersonalBalance[] {
  const balances: Map<string, PersonalBalance> = new Map();

  // 참여자별 초기 잔액 생성
  settlement.participants.forEach(participant => {
    balances.set(participant.id, {
      participantId: participant.id,
      participantName: participant.name,
      totalPaid: 0,
      totalOwed: 0,
      balance: 0
    });
  });

  // 각 지출 항목에 대해 계산
  settlement.expenses.forEach(expense => {
    const paidByBalance = balances.get(expense.paidBy)!;
    paidByBalance.totalPaid += expense.amount;

    // 정산 방식에 따라 부담 금액 계산
    const owedAmounts = calculateOwedAmounts(expense);

    owedAmounts.forEach(({ participantId, amount }) => {
      const participantBalance = balances.get(participantId)!;
      participantBalance.totalOwed += amount;
    });
  });

  // 최종 잔액 계산 (지불 - 부담)
  balances.forEach(balance => {
    balance.balance = balance.totalPaid - balance.totalOwed;
  });

  return Array.from(balances.values());
}

/**
 * 지출 항목별 참여자 부담 금액 계산
 */
function calculateOwedAmounts(
  expense: Expense
): { participantId: string; amount: number }[] {
  const participantCount = expense.participantIds.length;

  switch (expense.splitMethod) {
    case 'equal': {
      // 균등 분할
      const amountPerPerson = expense.amount / participantCount;
      return expense.participantIds.map(id => ({
        participantId: id,
        amount: amountPerPerson
      }));
    }

    case 'individual': {
      // 개별 금액 (직접 입력된 금액 사용)
      if (!expense.individualAmounts) {
        throw new Error('Individual amounts not provided');
      }
      return expense.individualAmounts.map(ia => ({
        participantId: ia.participantId,
        amount: ia.amount
      }));
    }

    case 'ratio': {
      // 비율 정산
      if (!expense.ratioSettings) {
        throw new Error('Ratio settings not provided');
      }

      // 총 비율 계산
      const totalRatio = expense.ratioSettings.reduce(
        (sum, rs) => sum + rs.ratio,
        0
      );

      // 비율에 따라 금액 분배
      return expense.ratioSettings.map(rs => ({
        participantId: rs.participantId,
        amount: (expense.amount * rs.ratio) / totalRatio
      }));
    }

    default:
      throw new Error(`Unknown split method: ${expense.splitMethod}`);
  }
}

/**
 * 정산 결과 생성 (메인 함수)
 */
function generateSettlementResult(
  settlement: Settlement
): SettlementResult {
  const personalBalances = calculatePersonalBalances(settlement);
  const transactions = calculateOptimalTransactions(personalBalances);

  const totalAmount = settlement.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return {
    settlement,
    personalBalances,
    transactions,
    totalAmount,
    participantCount: settlement.participants.length
  };
}
```

### 7.3 알고리즘 예시

**입력 데이터**:
- 김철수: 80,000원 지불, 30,000원 부담 → +50,000원 (받을 돈)
- 이영희: 0원 지불, 30,000원 부담 → -30,000원 (보낼 돈)
- 박민수: 70,000원 지불, 30,000원 부담 → +40,000원 (받을 돈)
- 최지훈: 0원 지불, 30,000원 부담 → -30,000원 (보낼 돈)
- 정수아: 0원 지불, 30,000원 부담 → -30,000원 (보낼 돈)

**알고리즘 실행**:

1. 초기 상태:
   - 채권자: 김철수 +50,000, 박민수 +40,000
   - 채무자: 이영희 -30,000, 최지훈 -30,000, 정수아 -30,000

2. 1차 매칭: 김철수(+50,000) ↔ 이영희(-30,000)
   - 거래: 이영희 → 김철수 30,000원
   - 업데이트: 김철수 +20,000, 이영희 0

3. 2차 매칭: 박민수(+40,000) ↔ 최지훈(-30,000)
   - 거래: 최지훈 → 박민수 30,000원
   - 업데이트: 박민수 +10,000, 최지훈 0

4. 3차 매칭: 김철수(+20,000) ↔ 정수아(-30,000)
   - 거래: 정수아 → 김철수 20,000원
   - 업데이트: 김철수 0, 정수아 -10,000

5. 4차 매칭: 박민수(+10,000) ↔ 정수아(-10,000)
   - 거래: 정수아 → 박민수 10,000원
   - 업데이트: 박민수 0, 정수아 0

**최종 결과** (4회 송금):
- 이영희 → 김철수 30,000원
- 최지훈 → 박민수 30,000원
- 정수아 → 김철수 20,000원
- 정수아 → 박민수 10,000원

### 7.4 알고리즘 복잡도
- **시간 복잡도**: O(n²)
  - n = 참여자 수
  - 최악의 경우 n-1회 거래 발생
  - 각 거래마다 정렬 수행 (O(n log n))

- **공간 복잡도**: O(n)
  - 잔액 배열 및 거래 목록 저장

- **최적성**: 그리디 알고리즘으로 항상 최소 거래 횟수 보장

---

## 8. 컴포넌트 구조

### 8.1 페이지 구조

```
App
├── Header (헤더: 로고, 타이틀)
└── SettlementPage (메인 페이지)
    ├── SettlementForm (정산 생성 폼)
    │   ├── BasicInfoForm (기본 정보: 모임명, 날짜, 총무)
    │   ├── ParticipantList (참여자 목록)
    │   │   └── ParticipantItem (참여자 항목)
    │   └── ExpenseList (지출 항목 목록)
    │       └── ExpenseItem (지출 항목)
    │           └── ExpenseForm (항목 추가/수정 모달)
    │
    └── SettlementResult (정산 결과)
        ├── ResultSummary (요약: 총액, 인원)
        ├── TransactionList (송금 안내)
        │   └── TransactionItem (송금 항목)
        ├── PersonalBalanceList (개인별 정산 내역)
        │   └── PersonalBalanceItem (개인 항목)
        └── ShareButtons (공유 버튼)
            ├── CopyTextButton (텍스트 복사)
            ├── DownloadImageButton (이미지 저장)
            └── ShareLinkButton (링크 공유)
```

### 8.2 주요 컴포넌트 설명

#### 8.2.1 BasicInfoForm
- 모임 이름, 날짜, 총무 입력
- 유효성 검사: 필수 필드 체크

#### 8.2.2 ParticipantList
- 참여자 추가/삭제
- 드래그앤드롭으로 순서 변경
- 최소 2명 이상 필수

#### 8.2.3 ExpenseForm
- 지출 항목 추가 모달
- 정산 방식 선택 (균등/개별/비율)
- 참여자 선택 (전체 선택 토글)

#### 8.2.4 TransactionList
- 최적화된 송금 목록 표시
- 송금자 → 수령자 관계 시각화
- 금액 강조 표시

#### 8.2.5 ShareButtons
- 텍스트 복사: Clipboard API 사용
- 이미지 저장: html2canvas로 PNG 생성
- 링크 공유: URL에 데이터 인코딩, QR 코드 생성

### 8.3 상태 관리 (Zustand)

```typescript
interface SettlementStore {
  // 상태
  settlement: Settlement | null;
  result: SettlementResult | null;

  // 액션
  createSettlement: (name: string, date: Date, participants: Participant[]) => void;
  addParticipant: (name: string) => void;
  removeParticipant: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  calculateResult: () => void;
  reset: () => void;

  // 로컬스토리지
  saveToLocalStorage: () => void;
  loadFromLocalStorage: (id: string) => void;
}

const useSettlementStore = create<SettlementStore>((set, get) => ({
  settlement: null,
  result: null,

  createSettlement: (name, date, participants) => {
    const settlement: Settlement = {
      id: generateId(),
      name,
      date,
      participants,
      expenses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    set({ settlement });
  },

  addParticipant: (name) => {
    const { settlement } = get();
    if (!settlement) return;

    const participant: Participant = {
      id: generateId(),
      name,
      isTreasurer: false
    };

    set({
      settlement: {
        ...settlement,
        participants: [...settlement.participants, participant],
        updatedAt: new Date()
      }
    });
  },

  addExpense: (expenseData) => {
    const { settlement } = get();
    if (!settlement) return;

    const expense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date()
    };

    set({
      settlement: {
        ...settlement,
        expenses: [...settlement.expenses, expense],
        updatedAt: new Date()
      }
    });
  },

  calculateResult: () => {
    const { settlement } = get();
    if (!settlement) return;

    const result = generateSettlementResult(settlement);
    set({ result });
  },

  reset: () => set({ settlement: null, result: null }),

  saveToLocalStorage: () => {
    const { settlement } = get();
    if (!settlement) return;

    const stored: StoredSettlement = {
      id: settlement.id,
      name: settlement.name,
      date: settlement.date.toISOString(),
      participantCount: settlement.participants.length,
      totalAmount: settlement.expenses.reduce((sum, e) => sum + e.amount, 0),
      createdAt: settlement.createdAt.toISOString()
    };

    localStorage.setItem(`settlement-${settlement.id}`, JSON.stringify(settlement));

    // 최근 정산 목록에 추가
    const recentList = JSON.parse(localStorage.getItem('recent-settlements') || '[]');
    recentList.unshift(stored);
    localStorage.setItem('recent-settlements', JSON.stringify(recentList.slice(0, 10)));
  },

  loadFromLocalStorage: (id) => {
    const data = localStorage.getItem(`settlement-${id}`);
    if (!data) return;

    const settlement = JSON.parse(data);
    settlement.date = new Date(settlement.date);
    settlement.createdAt = new Date(settlement.createdAt);
    settlement.updatedAt = new Date(settlement.updatedAt);
    settlement.expenses = settlement.expenses.map((e: any) => ({
      ...e,
      createdAt: new Date(e.createdAt)
    }));

    set({ settlement });
  }
}));
```

---

## 9. UI/UX 설계

### 9.1 디자인 원칙
1. **간결성**: 불필요한 요소 제거, 핵심 기능에 집중
2. **직관성**: 사용 방법을 설명 없이 이해 가능
3. **접근성**: 모바일 최우선 (Mobile-First)
4. **시각적 계층**: 중요한 정보 강조 (금액, 송금 관계)

### 9.2 색상 테마 (Tailwind CSS)

```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#3b82f6', // 메인 파란색
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981', // 받을 돈 (초록)
        danger: '#ef4444',  // 보낼 돈 (빨강)
        warning: '#f59e0b', // 경고 (주황)
      }
    }
  }
}
```

### 9.3 반응형 디자인
- **Mobile**: 320px ~ 768px (세로 스크롤, 풀 너비)
- **Tablet**: 768px ~ 1024px (카드 레이아웃)
- **Desktop**: 1024px+ (사이드바 + 메인 콘텐츠)

### 9.4 인터랙션
- 버튼 호버: 색상 변화 + 그림자 효과
- 입력 필드 포커스: 테두리 강조
- 드래그앤드롭: 드래그 중 투명도 변경
- 모달: 배경 어둡게 + 중앙 정렬

---

## 10. 추가 기능 (Phase 2)

### 10.1 정산 내역 관리
- 최근 정산 내역 목록 (LocalStorage)
- 정산 내역 수정/삭제
- 정산 템플릿 저장 (자주 쓰는 참여자 그룹)

### 10.2 고급 정산 기능
- 할인/쿠폰 적용
- 팁 계산 (서비스료)
- 세금 포함/제외 옵션

### 10.3 계좌 정보 저장
- 참여자별 계좌번호 저장 (암호화)
- 송금 링크 생성 (토스/카카오페이)

### 10.4 다국어 지원
- 영어 (en)
- 일본어 (ja)

---

## 11. 성능 최적화

### 11.1 번들 크기 최적화
- Code Splitting: 라우트별 분리
- Tree Shaking: 사용하지 않는 코드 제거
- 이미지 최적화: WebP 포맷 사용

### 11.2 렌더링 최적화
- React.memo: 불필요한 리렌더링 방지
- useMemo/useCallback: 연산 캐싱
- Virtual List: 긴 목록 성능 개선

### 11.3 로딩 최적화
- Lazy Loading: 컴포넌트 지연 로딩
- Prefetch: 링크 공유 데이터 미리 로드

---

## 12. 테스트 전략

### 12.1 단위 테스트 (Vitest)
- 알고리즘 함수 테스트
  - `calculatePersonalBalances()`
  - `calculateOptimalTransactions()`
  - `calculateOwedAmounts()`

### 12.2 통합 테스트 (React Testing Library)
- 컴포넌트 상호작용 테스트
- 정산 생성 → 결과 표시 플로우

### 12.3 E2E 테스트 (Playwright)
- 전체 정산 프로세스
- 공유 기능 (클립보드, 이미지)

---

## 13. 배포 및 모니터링

### 13.1 배포 환경
- **Hosting**: Vercel (무료)
- **Domain**: dutch-pay.seolcoding.com (예시)
- **CI/CD**: GitHub Actions

### 13.2 분석 도구
- Google Analytics 4: 사용자 행동 분석
- Vercel Analytics: 성능 모니터링

### 13.3 에러 추적
- Sentry: 프론트엔드 에러 모니터링

---

## 14. 개발 일정

### Week 1: 기초 설정 및 데이터 모델
- [ ] Vite + React + TypeScript 프로젝트 설정
- [ ] Tailwind CSS v4 설정
- [ ] 데이터 모델 TypeScript 타입 정의
- [ ] Zustand 스토어 설정

### Week 2: 정산 생성 UI
- [ ] BasicInfoForm 컴포넌트
- [ ] ParticipantList 컴포넌트
- [ ] ExpenseForm 컴포넌트 (모달)
- [ ] ExpenseList 컴포넌트

### Week 3: 정산 결과 및 알고리즘
- [ ] 최소 송금 알고리즘 구현
- [ ] SettlementResult 컴포넌트
- [ ] TransactionList 컴포넌트
- [ ] PersonalBalanceList 컴포넌트

### Week 4: 공유 기능 및 마무리
- [ ] Clipboard API 텍스트 복사
- [ ] html2canvas 이미지 생성
- [ ] QR 코드 링크 공유
- [ ] LocalStorage 저장/로드
- [ ] 반응형 디자인 최적화
- [ ] 테스트 작성
- [ ] 배포

---

## 15. 참고 자료

### 15.1 유사 서비스
- [카카오톡 정산하기 및 더치페이 요청하기 방법](https://shiningsense.com/2773)
- [카카오페이 vs 토스 vs 네이버페이 – 2025 간편결제 혜택 비교](https://richlylife.com/148)

### 15.2 기술 자료
- [Split Bills with Dutch: From Idea To App Release](https://medium.com/@alexsoong_33845/split-bills-with-dutch-from-idea-to-app-release-be5db9a8e066)
- [Split bills with friends — the algorithm behind Tricount and Splitwise](https://medium.com/@alexbrou/split-bills-with-friends-the-algorithm-behind-tricount-and-splitwise-using-integer-programming-48cd01999507)
- [Bill Split Pro - Free Bill Splitting App](https://billsplitpro.com/app/)
- [PaySolver - Split Expenses & Calculate Required Transactions](https://www.pay-solver.com/)

### 15.3 라이브러리 문서
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [qrcode.react Documentation](https://www.npmjs.com/package/qrcode.react)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

## 16. 라이선스 및 기여

### 16.1 라이선스
MIT License

### 16.2 기여 가이드
- Issue를 통한 버그 리포트/기능 제안 환영
- Pull Request 전 코드 스타일 준수
- 테스트 작성 필수

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
