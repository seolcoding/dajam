import { create } from 'zustand';
import type {
  Settlement,
  Participant,
  Expense,
  SettlementResult,
  StoredSettlement,
} from '@/types/settlement';
import { generateSettlementResult, generateId } from '@/lib/settlement-algorithm';

interface SettlementStore {
  // 상태
  settlement: Settlement | null;
  result: SettlementResult | null;

  // 액션
  createSettlement: (name: string, date: Date, participants: Participant[]) => void;
  updateSettlement: (updates: Partial<Settlement>) => void;
  addParticipant: (name: string, isTreasurer?: boolean) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  setTreasurer: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  removeExpense: (id: string) => void;
  calculateResult: () => void;
  reset: () => void;

  // 로컬스토리지
  saveToLocalStorage: () => void;
  loadFromLocalStorage: (id: string) => void;
  getRecentSettlements: () => StoredSettlement[];
}

export const useSettlementStore = create<SettlementStore>((set, get) => ({
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
      updatedAt: new Date(),
    };
    set({ settlement, result: null });
  },

  updateSettlement: (updates) => {
    const { settlement } = get();
    if (!settlement) return;

    set({
      settlement: {
        ...settlement,
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  addParticipant: (name, isTreasurer = false) => {
    const { settlement } = get();
    if (!settlement) return;

    const participant: Participant = {
      id: generateId(),
      name,
      isTreasurer,
    };

    set({
      settlement: {
        ...settlement,
        participants: [...settlement.participants, participant],
        updatedAt: new Date(),
      },
    });
  },

  removeParticipant: (id) => {
    const { settlement } = get();
    if (!settlement) return;

    // 참여자가 2명 이상이어야 삭제 가능
    if (settlement.participants.length <= 2) return;

    // 참여자가 포함된 지출 항목에서 제거
    const updatedExpenses = settlement.expenses.map((expense) => ({
      ...expense,
      participantIds: expense.participantIds.filter((pid) => pid !== id),
      // 결제자가 삭제된 경우 첫 번째 참여자로 변경
      paidBy: expense.paidBy === id ? settlement.participants[0].id : expense.paidBy,
    }));

    set({
      settlement: {
        ...settlement,
        participants: settlement.participants.filter((p) => p.id !== id),
        expenses: updatedExpenses,
        updatedAt: new Date(),
      },
    });
  },

  updateParticipant: (id, updates) => {
    const { settlement } = get();
    if (!settlement) return;

    set({
      settlement: {
        ...settlement,
        participants: settlement.participants.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
        updatedAt: new Date(),
      },
    });
  },

  setTreasurer: (id) => {
    const { settlement } = get();
    if (!settlement) return;

    set({
      settlement: {
        ...settlement,
        participants: settlement.participants.map((p) => ({
          ...p,
          isTreasurer: p.id === id,
        })),
        updatedAt: new Date(),
      },
    });
  },

  addExpense: (expenseData) => {
    const { settlement } = get();
    if (!settlement) return;

    const expense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date(),
    };

    set({
      settlement: {
        ...settlement,
        expenses: [...settlement.expenses, expense],
        updatedAt: new Date(),
      },
    });
  },

  updateExpense: (id, updates) => {
    const { settlement } = get();
    if (!settlement) return;

    set({
      settlement: {
        ...settlement,
        expenses: settlement.expenses.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
        updatedAt: new Date(),
      },
    });
  },

  removeExpense: (id) => {
    const { settlement } = get();
    if (!settlement) return;

    set({
      settlement: {
        ...settlement,
        expenses: settlement.expenses.filter((e) => e.id !== id),
        updatedAt: new Date(),
      },
    });
  },

  calculateResult: () => {
    const { settlement } = get();
    if (!settlement || settlement.expenses.length === 0) {
      set({ result: null });
      return;
    }

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
      createdAt: settlement.createdAt.toISOString(),
    };

    // 전체 정산 데이터 저장
    localStorage.setItem(
      `settlement-${settlement.id}`,
      JSON.stringify({
        ...settlement,
        date: settlement.date.toISOString(),
        createdAt: settlement.createdAt.toISOString(),
        updatedAt: settlement.updatedAt.toISOString(),
        expenses: settlement.expenses.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
        })),
      })
    );

    // 최근 정산 목록에 추가
    const recentList = JSON.parse(
      localStorage.getItem('recent-settlements') || '[]'
    );
    const filteredList = recentList.filter((s: StoredSettlement) => s.id !== stored.id);
    filteredList.unshift(stored);
    localStorage.setItem(
      'recent-settlements',
      JSON.stringify(filteredList.slice(0, 10))
    );
  },

  loadFromLocalStorage: (id) => {
    const data = localStorage.getItem(`settlement-${id}`);
    if (!data) return;

    const parsedData = JSON.parse(data);
    const settlement: Settlement = {
      ...parsedData,
      date: new Date(parsedData.date),
      createdAt: new Date(parsedData.createdAt),
      updatedAt: new Date(parsedData.updatedAt),
      expenses: parsedData.expenses.map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
      })),
    };

    set({ settlement, result: null });
  },

  getRecentSettlements: () => {
    const recentList = JSON.parse(
      localStorage.getItem('recent-settlements') || '[]'
    );
    return recentList;
  },
}));
