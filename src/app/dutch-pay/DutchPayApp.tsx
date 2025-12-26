'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSettlementStore } from './store/settlement-store';
import { BasicInfoForm } from './components/BasicInfoForm';
import { ParticipantList } from './components/ParticipantList';
import { ExpenseList } from './components/ExpenseList';
import { SettlementResult } from './components/SettlementResult';
import { AppHeader, AppFooter } from '@/components/layout';
import { Receipt, RotateCcw } from 'lucide-react';

export function DutchPayApp() {
  const { settlement, createSettlement, reset } = useSettlementStore();

  useEffect(() => {
    // 초기 정산 생성
    if (!settlement) {
      createSettlement('새 정산', new Date(), [
        { id: '1', name: '참여자 1', isTreasurer: true },
        { id: '2', name: '참여자 2', isTreasurer: false },
      ]);
    }
  }, [settlement, createSettlement]);

  const handleReset = () => {
    if (confirm('정산을 초기화하시겠습니까?')) {
      reset();
      createSettlement('새 정산', new Date(), [
        { id: '1', name: '참여자 1', isTreasurer: true },
        { id: '2', name: '참여자 2', isTreasurer: false },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex flex-col">
      <AppHeader
        title="더치페이 정산"
        description="모임 후 정산을 간편하게 처리하세요. 최소 송금 횟수로 최적화합니다."
        icon={Receipt}
        iconGradient="from-blue-500 to-purple-500"
        actions={
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <RotateCcw className="w-4 h-4 mr-1.5" />
            초기화
          </Button>
        }
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl flex-1">

        {/* Main Content */}
        <div className="space-y-8">
          {/* 기본 정보 */}
          <BasicInfoForm />

          {/* 참여자 */}
          <ParticipantList />

          {/* 지출 항목 */}
          <ExpenseList />

          {/* 정산 결과 */}
          {settlement && settlement.expenses.length > 0 && (
            <SettlementResult />
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  );
}
