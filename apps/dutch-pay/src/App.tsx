import { useEffect } from 'react';
import { Button } from '@mini-apps/ui';
import { useSettlementStore } from './store/settlement-store';
import { BasicInfoForm } from './components/BasicInfoForm';
import { ParticipantList } from './components/ParticipantList';
import { ExpenseList } from './components/ExpenseList';
import { SettlementResult } from './components/SettlementResult';
import { Calculator, RotateCcw } from 'lucide-react';

function App() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 shadow-lg">
            <Calculator className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">
            더치페이 정산
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            모임 후 정산을 간편하게 처리하세요. 최소 송금 횟수로 최적화합니다.
          </p>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            초기화
          </Button>
        </div>

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

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-block px-6 py-3 bg-white rounded-full shadow-sm">
            <p className="text-sm text-gray-600">
              더치페이 정산 계산기 by{' '}
              <a
                href="https://seolcoding.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 hover:text-purple-600 transition-colors"
              >
                SeolCoding
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
