import { useState } from 'react';
import { Button, Input, Label, Dialog, Checkbox } from '@mini-apps/ui';
import { useSettlementStore } from '@/store/settlement-store';
import type { SplitMethod } from '@/types/settlement';
import { Plus, X } from 'lucide-react';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseForm({ isOpen, onClose }: ExpenseFormProps) {
  const { settlement, addExpense } = useSettlementStore();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !paidBy || participantIds.length === 0) return;

    addExpense({
      name,
      amount: parseFloat(amount.replace(/,/g, '')),
      paidBy,
      participantIds,
      splitMethod,
    });

    // 폼 초기화
    setName('');
    setAmount('');
    setPaidBy('');
    setParticipantIds([]);
    setSplitMethod('equal');
    onClose();
  };

  const handleAmountChange = (value: string) => {
    // 숫자만 허용
    const numericValue = value.replace(/[^0-9]/g, '');
    // 천 단위 콤마 추가
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setAmount(formatted);
  };

  const toggleParticipant = (id: string) => {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (!settlement) return;
    if (participantIds.length === settlement.participants.length) {
      setParticipantIds([]);
    } else {
      setParticipantIds(settlement.participants.map((p) => p.id));
    }
  };

  if (!settlement) return null;

  const allSelected = participantIds.length === settlement.participants.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">지출 항목 추가</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expense-name">항목명</Label>
              <Input
                id="expense-name"
                type="text"
                placeholder="예: 1차 회식"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-amount">금액</Label>
              <div className="relative">
                <Input
                  id="expense-amount"
                  type="text"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  원
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense-paidby">결제자</Label>
              <select
                id="expense-paidby"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">선택하세요</option>
                {settlement.participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>참여자 선택</Label>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {allSelected ? '전체 해제' : '전체 선택'}
                </button>
              </div>
              <div className="space-y-1">
                {settlement.participants.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={participantIds.includes(p.id)}
                      onCheckedChange={() => toggleParticipant(p.id)}
                    />
                    <span>{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>정산 방식</Label>
              <div className="space-y-1">
                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                  <input
                    type="radio"
                    name="splitMethod"
                    value="equal"
                    checked={splitMethod === 'equal'}
                    onChange={(e) => setSplitMethod(e.target.value as SplitMethod)}
                  />
                  <span>균등 분할 (N분의 1)</span>
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer opacity-50">
                  <input type="radio" disabled />
                  <span>개별 금액 (추후 지원)</span>
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer opacity-50">
                  <input type="radio" disabled />
                  <span>비율 정산 (추후 지원)</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!name || !amount || !paidBy || participantIds.length === 0}
              >
                추가
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
