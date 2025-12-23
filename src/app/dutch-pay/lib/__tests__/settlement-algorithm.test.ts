import { describe, it, expect } from 'vitest';
import {
  calculatePersonalBalances,
  calculateOptimalTransactions,
  generateSettlementResult,
  generateId,
  formatCurrency,
} from '../settlement-algorithm';
import type {
  Settlement,
  Participant,
  Expense,
  PersonalBalance,
} from '../../types/settlement';

// Test fixtures
function createParticipant(id: string, name: string, isTreasurer = false): Participant {
  return { id, name, isTreasurer };
}

function createExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 'expense-1',
    name: '테스트 지출',
    amount: 30000,
    paidBy: 'p1',
    participantIds: ['p1', 'p2', 'p3'],
    splitMethod: 'equal',
    createdAt: new Date(),
    ...overrides,
  };
}

function createSettlement(overrides: Partial<Settlement> = {}): Settlement {
  return {
    id: 'settlement-1',
    name: '테스트 정산',
    date: new Date(),
    participants: [
      createParticipant('p1', '홍길동'),
      createParticipant('p2', '김철수'),
      createParticipant('p3', '이영희'),
    ],
    expenses: [createExpense()],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('settlement-algorithm', () => {
  describe('calculatePersonalBalances', () => {
    it('균등 분할 시 정확한 잔액을 계산해야 함', () => {
      // 30,000원을 3명이 균등 분할 → 1인당 10,000원
      // p1이 결제 → balance: 30,000 - 10,000 = +20,000 (받을 돈)
      // p2, p3 → balance: 0 - 10,000 = -10,000 (보낼 돈)
      const settlement = createSettlement();
      const balances = calculatePersonalBalances(settlement);

      expect(balances).toHaveLength(3);

      const p1Balance = balances.find(b => b.participantId === 'p1');
      expect(p1Balance?.totalPaid).toBe(30000);
      expect(p1Balance?.totalOwed).toBe(10000);
      expect(p1Balance?.balance).toBe(20000);

      const p2Balance = balances.find(b => b.participantId === 'p2');
      expect(p2Balance?.totalPaid).toBe(0);
      expect(p2Balance?.totalOwed).toBe(10000);
      expect(p2Balance?.balance).toBe(-10000);
    });

    it('여러 지출 항목이 있을 때 정확히 합산해야 함', () => {
      const settlement = createSettlement({
        expenses: [
          createExpense({ id: 'e1', amount: 30000, paidBy: 'p1' }),
          createExpense({ id: 'e2', amount: 15000, paidBy: 'p2' }),
        ],
      });
      const balances = calculatePersonalBalances(settlement);

      // 총 45,000원 → 1인당 15,000원
      const p1Balance = balances.find(b => b.participantId === 'p1');
      expect(p1Balance?.totalPaid).toBe(30000);
      expect(p1Balance?.totalOwed).toBe(15000);
      expect(p1Balance?.balance).toBe(15000);

      const p2Balance = balances.find(b => b.participantId === 'p2');
      expect(p2Balance?.totalPaid).toBe(15000);
      expect(p2Balance?.totalOwed).toBe(15000);
      expect(p2Balance?.balance).toBe(0);

      const p3Balance = balances.find(b => b.participantId === 'p3');
      expect(p3Balance?.totalPaid).toBe(0);
      expect(p3Balance?.totalOwed).toBe(15000);
      expect(p3Balance?.balance).toBe(-15000);
    });

    it('개별 금액 방식(individual)을 정확히 계산해야 함', () => {
      const settlement = createSettlement({
        expenses: [
          createExpense({
            amount: 50000,
            splitMethod: 'individual',
            individualAmounts: [
              { participantId: 'p1', amount: 10000 },
              { participantId: 'p2', amount: 20000 },
              { participantId: 'p3', amount: 20000 },
            ],
          }),
        ],
      });
      const balances = calculatePersonalBalances(settlement);

      const p1Balance = balances.find(b => b.participantId === 'p1');
      expect(p1Balance?.totalOwed).toBe(10000);

      const p2Balance = balances.find(b => b.participantId === 'p2');
      expect(p2Balance?.totalOwed).toBe(20000);

      const p3Balance = balances.find(b => b.participantId === 'p3');
      expect(p3Balance?.totalOwed).toBe(20000);
    });

    it('비율 방식(ratio)을 정확히 계산해야 함', () => {
      const settlement = createSettlement({
        expenses: [
          createExpense({
            amount: 100000,
            splitMethod: 'ratio',
            ratioSettings: [
              { participantId: 'p1', ratio: 50 },  // 50%
              { participantId: 'p2', ratio: 30 },  // 30%
              { participantId: 'p3', ratio: 20 },  // 20%
            ],
          }),
        ],
      });
      const balances = calculatePersonalBalances(settlement);

      const p1Balance = balances.find(b => b.participantId === 'p1');
      expect(p1Balance?.totalOwed).toBe(50000);

      const p2Balance = balances.find(b => b.participantId === 'p2');
      expect(p2Balance?.totalOwed).toBe(30000);

      const p3Balance = balances.find(b => b.participantId === 'p3');
      expect(p3Balance?.totalOwed).toBe(20000);
    });

    it('참여자 이름을 정확히 포함해야 함', () => {
      const settlement = createSettlement();
      const balances = calculatePersonalBalances(settlement);

      expect(balances.find(b => b.participantId === 'p1')?.participantName).toBe('홍길동');
      expect(balances.find(b => b.participantId === 'p2')?.participantName).toBe('김철수');
      expect(balances.find(b => b.participantId === 'p3')?.participantName).toBe('이영희');
    });

    it('빈 지출 목록일 때 모든 잔액이 0이어야 함', () => {
      const settlement = createSettlement({ expenses: [] });
      const balances = calculatePersonalBalances(settlement);

      balances.forEach(balance => {
        expect(balance.totalPaid).toBe(0);
        expect(balance.totalOwed).toBe(0);
        expect(balance.balance).toBe(0);
      });
    });
  });

  describe('calculateOptimalTransactions', () => {
    it('최소 거래 횟수로 정산해야 함', () => {
      // p1: +20,000, p2: -10,000, p3: -10,000
      const balances: PersonalBalance[] = [
        { participantId: 'p1', participantName: '홍길동', totalPaid: 30000, totalOwed: 10000, balance: 20000 },
        { participantId: 'p2', participantName: '김철수', totalPaid: 0, totalOwed: 10000, balance: -10000 },
        { participantId: 'p3', participantName: '이영희', totalPaid: 0, totalOwed: 10000, balance: -10000 },
      ];

      const transactions = calculateOptimalTransactions(balances);

      expect(transactions).toHaveLength(2);
      expect(transactions.every(t => t.to === 'p1')).toBe(true);
      expect(transactions.reduce((sum, t) => sum + t.amount, 0)).toBe(20000);
    });

    it('한 명만 결제했을 때 올바르게 정산해야 함', () => {
      const balances: PersonalBalance[] = [
        { participantId: 'p1', participantName: '홍길동', totalPaid: 100000, totalOwed: 25000, balance: 75000 },
        { participantId: 'p2', participantName: '김철수', totalPaid: 0, totalOwed: 25000, balance: -25000 },
        { participantId: 'p3', participantName: '이영희', totalPaid: 0, totalOwed: 25000, balance: -25000 },
        { participantId: 'p4', participantName: '박민수', totalPaid: 0, totalOwed: 25000, balance: -25000 },
      ];

      const transactions = calculateOptimalTransactions(balances);

      expect(transactions).toHaveLength(3);
      transactions.forEach(t => {
        expect(t.to).toBe('p1');
        expect(t.amount).toBe(25000);
      });
    });

    it('모든 잔액이 0일 때 거래가 없어야 함', () => {
      const balances: PersonalBalance[] = [
        { participantId: 'p1', participantName: '홍길동', totalPaid: 10000, totalOwed: 10000, balance: 0 },
        { participantId: 'p2', participantName: '김철수', totalPaid: 10000, totalOwed: 10000, balance: 0 },
      ];

      const transactions = calculateOptimalTransactions(balances);

      expect(transactions).toHaveLength(0);
    });

    it('복잡한 정산을 최적화해야 함', () => {
      // 복잡한 케이스: 여러 명이 결제하고 여러 명이 받아야 하는 경우
      const balances: PersonalBalance[] = [
        { participantId: 'p1', participantName: 'A', totalPaid: 0, totalOwed: 0, balance: 40000 },
        { participantId: 'p2', participantName: 'B', totalPaid: 0, totalOwed: 0, balance: 30000 },
        { participantId: 'p3', participantName: 'C', totalPaid: 0, totalOwed: 0, balance: -25000 },
        { participantId: 'p4', participantName: 'D', totalPaid: 0, totalOwed: 0, balance: -45000 },
      ];

      const transactions = calculateOptimalTransactions(balances);

      // 총 송금액 확인
      const totalFromDebtors = transactions.reduce((sum, t) => sum + t.amount, 0);
      expect(totalFromDebtors).toBe(70000);

      // 거래 횟수는 최대 3개 (greedy 알고리즘 기준)
      expect(transactions.length).toBeLessThanOrEqual(3);
    });

    it('금액을 원 단위로 반올림해야 함', () => {
      const balances: PersonalBalance[] = [
        { participantId: 'p1', participantName: '홍길동', totalPaid: 0, totalOwed: 0, balance: 33333.33 },
        { participantId: 'p2', participantName: '김철수', totalPaid: 0, totalOwed: 0, balance: -33333.33 },
      ];

      const transactions = calculateOptimalTransactions(balances);

      expect(transactions).toHaveLength(1);
      expect(Number.isInteger(transactions[0].amount)).toBe(true);
    });
  });

  describe('generateSettlementResult', () => {
    it('완전한 정산 결과를 생성해야 함', () => {
      const settlement = createSettlement();
      const result = generateSettlementResult(settlement);

      expect(result.settlement).toBe(settlement);
      expect(result.personalBalances).toHaveLength(3);
      expect(result.transactions.length).toBeGreaterThan(0);
      expect(result.totalAmount).toBe(30000);
      expect(result.participantCount).toBe(3);
    });

    it('여러 지출 시 총 금액을 정확히 계산해야 함', () => {
      const settlement = createSettlement({
        expenses: [
          createExpense({ id: 'e1', amount: 30000 }),
          createExpense({ id: 'e2', amount: 50000 }),
          createExpense({ id: 'e3', amount: 20000 }),
        ],
      });
      const result = generateSettlementResult(settlement);

      expect(result.totalAmount).toBe(100000);
    });
  });

  describe('generateId', () => {
    it('유일한 ID를 생성해야 함', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it('타임스탬프를 포함해야 함', () => {
      const id = generateId();
      const timestamp = id.split('-')[0];
      expect(Number(timestamp)).toBeLessThanOrEqual(Date.now());
      expect(Number(timestamp)).toBeGreaterThan(Date.now() - 1000);
    });
  });

  describe('formatCurrency', () => {
    it('천 단위 콤마를 추가해야 함', () => {
      expect(formatCurrency(1000)).toBe('1,000');
      expect(formatCurrency(1000000)).toBe('1,000,000');
      expect(formatCurrency(10000000)).toBe('10,000,000');
    });

    it('소수점을 반올림해야 함', () => {
      expect(formatCurrency(1234.5)).toBe('1,235');
      expect(formatCurrency(1234.4)).toBe('1,234');
    });

    it('0을 올바르게 포맷해야 함', () => {
      expect(formatCurrency(0)).toBe('0');
    });

    it('음수를 올바르게 포맷해야 함', () => {
      expect(formatCurrency(-1000)).toBe('-1,000');
    });
  });

  describe('Edge Cases', () => {
    it('2인 정산을 처리해야 함', () => {
      const settlement = createSettlement({
        participants: [
          createParticipant('p1', '홍길동'),
          createParticipant('p2', '김철수'),
        ],
        expenses: [
          createExpense({
            amount: 20000,
            paidBy: 'p1',
            participantIds: ['p1', 'p2'],
          }),
        ],
      });

      const result = generateSettlementResult(settlement);

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].from).toBe('p2');
      expect(result.transactions[0].to).toBe('p1');
      expect(result.transactions[0].amount).toBe(10000);
    });

    it('대규모 정산(10명)을 처리해야 함', () => {
      const participants = Array.from({ length: 10 }, (_, i) =>
        createParticipant(`p${i + 1}`, `참여자${i + 1}`)
      );

      const settlement = createSettlement({
        participants,
        expenses: [
          createExpense({
            amount: 1000000,
            paidBy: 'p1',
            participantIds: participants.map(p => p.id),
          }),
        ],
      });

      const result = generateSettlementResult(settlement);

      expect(result.personalBalances).toHaveLength(10);
      // p1은 1,000,000 결제, 100,000 부담 → +900,000
      const p1Balance = result.personalBalances.find(b => b.participantId === 'p1');
      expect(p1Balance?.balance).toBe(900000);

      // 나머지 9명 합산 = -900,000
      const othersBalance = result.personalBalances
        .filter(b => b.participantId !== 'p1')
        .reduce((sum, b) => sum + b.balance, 0);
      expect(othersBalance).toBe(-900000);
    });

    it('참여자가 일부 항목에만 참여할 때 처리해야 함', () => {
      const settlement = createSettlement({
        expenses: [
          createExpense({
            id: 'e1',
            amount: 20000,
            paidBy: 'p1',
            participantIds: ['p1', 'p2'], // p3 불참
          }),
          createExpense({
            id: 'e2',
            amount: 15000,
            paidBy: 'p2',
            participantIds: ['p2', 'p3'], // p1 불참
          }),
        ],
      });

      const result = generateSettlementResult(settlement);

      const p1Balance = result.personalBalances.find(b => b.participantId === 'p1');
      expect(p1Balance?.totalOwed).toBe(10000); // 첫 항목만

      const p3Balance = result.personalBalances.find(b => b.participantId === 'p3');
      expect(p3Balance?.totalOwed).toBe(7500); // 두 번째 항목만
    });
  });
});
