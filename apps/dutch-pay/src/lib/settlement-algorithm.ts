import type {
  Expense,
  Settlement,
  PersonalBalance,
  Transaction,
  SettlementResult,
} from '@/types/settlement';

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
      return expense.participantIds.map((id) => ({
        participantId: id,
        amount: amountPerPerson,
      }));
    }

    case 'individual': {
      // 개별 금액 (직접 입력된 금액 사용)
      if (!expense.individualAmounts) {
        throw new Error('Individual amounts not provided');
      }
      return expense.individualAmounts.map((ia) => ({
        participantId: ia.participantId,
        amount: ia.amount,
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
      return expense.ratioSettings.map((rs) => ({
        participantId: rs.participantId,
        amount: (expense.amount * rs.ratio) / totalRatio,
      }));
    }

    default:
      throw new Error(`Unknown split method: ${expense.splitMethod}`);
  }
}

/**
 * 개인별 잔액 계산
 */
export function calculatePersonalBalances(
  settlement: Settlement
): PersonalBalance[] {
  const balances: Map<string, PersonalBalance> = new Map();

  // 참여자별 초기 잔액 생성
  settlement.participants.forEach((participant) => {
    balances.set(participant.id, {
      participantId: participant.id,
      participantName: participant.name,
      totalPaid: 0,
      totalOwed: 0,
      balance: 0,
    });
  });

  // 각 지출 항목에 대해 계산
  settlement.expenses.forEach((expense) => {
    const paidByBalance = balances.get(expense.paidBy);
    if (paidByBalance) {
      paidByBalance.totalPaid += expense.amount;
    }

    // 정산 방식에 따라 부담 금액 계산
    const owedAmounts = calculateOwedAmounts(expense);

    owedAmounts.forEach(({ participantId, amount }) => {
      const participantBalance = balances.get(participantId);
      if (participantBalance) {
        participantBalance.totalOwed += amount;
      }
    });
  });

  // 최종 잔액 계산 (지불 - 부담)
  balances.forEach((balance) => {
    balance.balance = balance.totalPaid - balance.totalOwed;
  });

  return Array.from(balances.values());
}

/**
 * 최소 송금 횟수 알고리즘
 * Greedy approach: 가장 큰 채권자와 채무자를 매칭하여 거래 생성
 */
export function calculateOptimalTransactions(
  personalBalances: PersonalBalance[]
): Transaction[] {
  const transactions: Transaction[] = [];

  // 잔액을 복사하여 작업용 배열 생성 (원본 데이터 보존)
  const balances = personalBalances.map((pb) => ({
    participantId: pb.participantId,
    participantName: pb.participantName,
    balance: pb.balance,
  }));

  // 채권자(받을 사람)와 채무자(보낼 사람) 분리
  const getCreditors = () =>
    balances
      .filter((b) => b.balance > 0)
      .sort((a, b) => b.balance - a.balance); // 내림차순

  const getDebtors = () =>
    balances
      .filter((b) => b.balance < 0)
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
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));

    // 거래 생성
    transactions.push({
      from: debtor.participantId,
      fromName: debtor.participantName,
      to: creditor.participantId,
      toName: creditor.participantName,
      amount: Math.round(amount), // 원 단위로 반올림
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
 * 정산 결과 생성 (메인 함수)
 */
export function generateSettlementResult(
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
    participantCount: settlement.participants.length,
  };
}

/**
 * ID 생성 유틸리티
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 금액 포맷팅 (천 단위 콤마)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
}

/**
 * 카카오페이 송금 링크 생성
 */
export function generateKakaoPayLink(amount: number): string {
  // 카카오페이 송금 링크 형식
  // 실제로는 카카오페이 API를 사용해야 하지만, 여기서는 기본 형식만 제공
  return `kakaopay://send?amount=${amount}`;
}
