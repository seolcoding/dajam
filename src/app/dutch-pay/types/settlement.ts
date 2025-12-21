// 참여자 정보
export interface Participant {
  id: string;
  name: string;
  isTreasurer: boolean; // 총무 여부
}

// 정산 방식
export type SplitMethod = 'equal' | 'individual' | 'ratio';

// 개별 금액 설정 (individual 방식)
export interface IndividualAmount {
  participantId: string;
  amount: number;
}

// 비율 설정 (ratio 방식)
export interface RatioSetting {
  participantId: string;
  ratio: number; // 100 = 100%, 50 = 50%
}

// 지출 항목
export interface Expense {
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
export interface Settlement {
  id: string;
  name: string; // 모임 이름 (예: "연말 회식")
  date: Date; // 정산 날짜
  participants: Participant[];
  expenses: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

// 개인별 정산 결과
export interface PersonalBalance {
  participantId: string;
  participantName: string;
  totalPaid: number; // 지불한 총 금액
  totalOwed: number; // 부담해야 할 총 금액
  balance: number; // 차액 (양수: 받을 돈, 음수: 보낼 돈)
}

// 송금 거래
export interface Transaction {
  from: string; // 송금자 ID
  fromName: string; // 송금자 이름
  to: string; // 수령자 ID
  toName: string; // 수령자 이름
  amount: number;
}

// 최종 정산 결과
export interface SettlementResult {
  settlement: Settlement;
  personalBalances: PersonalBalance[];
  transactions: Transaction[]; // 최적화된 송금 목록
  totalAmount: number;
  participantCount: number;
}

// 정산 공유 데이터 (URL 인코딩용)
export interface ShareableSettlement {
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
export interface StoredSettlement {
  id: string;
  name: string;
  date: string;
  participantCount: number;
  totalAmount: number;
  createdAt: string;
}
