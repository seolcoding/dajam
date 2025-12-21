import { useState } from 'react';
import { Button, Card, Badge } from '@mini-apps/ui';
import { useSettlementStore } from '@/store/settlement-store';
import { formatCurrency } from '@/lib/settlement-algorithm';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { ExpenseForm } from './ExpenseForm';

export function ExpenseList() {
  const { settlement, removeExpense } = useSettlementStore();
  const [isFormOpen, setIsFormOpen] = useState(false);

  if (!settlement) return null;

  const totalAmount = settlement.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="border-0 shadow-lg bg-white">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full" />
          <h2 className="text-2xl font-black text-gray-900">지출 항목</h2>
          <Badge variant="secondary" className="ml-2">
            {settlement.expenses.length}
          </Badge>
          <Button
            onClick={() => setIsFormOpen(true)}
            size="lg"
            className="ml-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            항목 추가
          </Button>
        </div>

        {settlement.expenses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold">지출 항목을 추가해주세요</p>
            <p className="text-sm text-gray-400 mt-1">항목 추가 버튼을 클릭하세요</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {settlement.expenses.map((expense) => {
                const payer = settlement.participants.find((p) => p.id === expense.paidBy);
                const participantCount = expense.participantIds.length;
                const perPerson = expense.amount / participantCount;

                return (
                  <Card
                    key={expense.id}
                    className="border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-md"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-gray-900 mb-1">
                            {expense.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              결제: <span className="font-semibold text-gray-900">{payer?.name}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              참여: <span className="font-semibold text-gray-900">{participantCount}명</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-black text-gray-900">
                              {formatCurrency(expense.amount)}
                            </p>
                            <p className="text-xs text-gray-500">원</p>
                          </div>
                          <button
                            onClick={() => removeExpense(expense.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <Badge variant="outline" className="text-xs">
                          1인당 {formatCurrency(perPerson)}원
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="p-4 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">총 금액</span>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">
                    {formatCurrency(totalAmount)}
                  </p>
                  <p className="text-sm text-gray-600">원</p>
                </div>
              </div>
            </Card>
          </>
        )}

        <ExpenseForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      </div>
    </Card>
  );
}
