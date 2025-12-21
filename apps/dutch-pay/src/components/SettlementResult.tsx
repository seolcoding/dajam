import { useEffect, useRef, useState } from 'react';
import { Button, Card, Avatar, Badge, Separator } from '@mini-apps/ui';
import { useSettlementStore } from '@/store/settlement-store';
import { formatCurrency } from '@/lib/settlement-algorithm';
import {
  ArrowRight,
  Users,
  Receipt,
  Copy,
  Download,
  Share2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

// Helper function to get initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to get avatar color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export function SettlementResult() {
  const { settlement, result, calculateResult } = useSettlementStore();
  const resultRef = useRef<HTMLDivElement>(null);
  const [completedTransactions, setCompletedTransactions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (settlement && settlement.expenses.length > 0) {
      calculateResult();
    }
  }, [settlement, calculateResult]);

  if (!settlement || !result || result.transactions.length === 0) {
    return null;
  }

  const toggleTransactionComplete = (index: number) => {
    setCompletedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const allTransactionsComplete = completedTransactions.size === result.transactions.length;

  const handleCopyText = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      alert('정산 내역이 클립보드에 복사되었습니다!');
    } catch (err) {
      console.error('복사 실패:', err);
      alert('복사에 실패했습니다.');
    }
  };

  const handleDownloadImage = async () => {
    if (!resultRef.current) return;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `${settlement.name}_정산내역_${format(new Date(), 'yyyyMMdd')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('이미지 생성 실패:', err);
      alert('이미지 생성에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    const text = generateShareText();

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settlement.name} 정산 내역`,
          text,
        });
      } catch (err) {
        console.error('공유 실패:', err);
      }
    } else {
      handleCopyText();
    }
  };

  const generateShareText = () => {
    let text = `📊 [${settlement.name}] 정산 내역\n\n`;
    text += `총 금액: ${formatCurrency(result.totalAmount)}원\n`;
    text += `참여: ${result.participantCount}명 (${settlement.participants.map((p) => p.name).join(', ')})\n\n`;
    text += `💰 송금 안내:\n`;

    result.transactions.forEach((t) => {
      text += `• ${t.fromName} → ${t.toName} ${formatCurrency(t.amount)}원\n`;
    });

    text += `\n📝 상세 내역:\n`;
    settlement.expenses.forEach((e) => {
      const participants = e.participantIds
        .map((id) => settlement.participants.find((p) => p.id === id)?.name)
        .filter(Boolean);
      text += `• ${e.name}: ${formatCurrency(e.amount)}원 (${participants.length}명)\n`;
    });

    text += `\n---\n`;
    text += `정산 일시: ${format(settlement.date, 'yyyy-MM-dd')}\n`;
    const treasurer = settlement.participants.find((p) => p.isTreasurer);
    if (treasurer) {
      text += `총무: ${treasurer.name}\n`;
    }

    return text;
  };

  return (
    <div className="space-y-6">
      {allTransactionsComplete && (
        <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">정산 완료!</h3>
            <p className="text-gray-600">모든 송금이 완료되었습니다</p>
          </div>
        </Card>
      )}

      <div ref={resultRef} className="space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-lg bg-white">
          <div className="p-8 text-center">
            <Badge variant="outline" className="mb-4 text-sm font-semibold">
              정산 결과
            </Badge>
            <h2 className="text-4xl font-black text-gray-900 mb-2">{settlement.name}</h2>
            <p className="text-base text-gray-500">{format(settlement.date, 'yyyy년 MM월 dd일')}</p>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-gray-600 mb-2">총 금액</p>
              <p className="text-5xl font-black text-gray-900 mb-1">
                {formatCurrency(result.totalAmount)}
              </p>
              <p className="text-base text-gray-600">원</p>
            </div>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="p-6 text-center">
              <p className="text-sm font-semibold text-gray-600 mb-2">참여 인원</p>
              <p className="text-5xl font-black text-gray-900 mb-1">
                {result.participantCount}
              </p>
              <p className="text-base text-gray-600">명</p>
            </div>
          </Card>
        </div>

        {/* Transaction Flow */}
        <Card className="border-0 shadow-lg bg-white">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              <h3 className="text-2xl font-black text-gray-900">송금 안내</h3>
              <Badge variant="secondary" className="ml-auto">
                {completedTransactions.size}/{result.transactions.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {result.transactions.map((transaction, idx) => {
                const isCompleted = completedTransactions.has(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => toggleTransactionComplete(idx)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                      isCompleted
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* From Avatar */}
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className={`w-12 h-12 ${getAvatarColor(transaction.fromName)}`}>
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(transaction.fromName)}
                          </div>
                        </Avatar>
                        <span className="text-xs font-semibold text-gray-900">
                          {transaction.fromName}
                        </span>
                      </div>

                      {/* Arrow */}
                      <div className="flex-1 flex items-center gap-2">
                        <Separator className="flex-1" />
                        <ArrowRight className={`w-6 h-6 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                        <Separator className="flex-1" />
                      </div>

                      {/* Amount */}
                      <div className="px-4 py-2 bg-gray-900 rounded-lg">
                        <p className="text-2xl font-black text-white">
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-gray-300">원</p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-1 flex items-center gap-2">
                        <Separator className="flex-1" />
                        <ArrowRight className={`w-6 h-6 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                        <Separator className="flex-1" />
                      </div>

                      {/* To Avatar */}
                      <div className="flex flex-col items-center gap-2">
                        <Avatar className={`w-12 h-12 ${getAvatarColor(transaction.toName)}`}>
                          <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                            {getInitials(transaction.toName)}
                          </div>
                        </Avatar>
                        <span className="text-xs font-semibold text-gray-900">
                          {transaction.toName}
                        </span>
                      </div>

                      {/* Completion Indicator */}
                      <CheckCircle2
                        className={`w-6 h-6 transition-colors ${
                          isCompleted ? 'text-green-500' : 'text-gray-300'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Personal Balances */}
        <Card className="border-0 shadow-lg bg-white">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full" />
              <h3 className="text-2xl font-black text-gray-900">개인별 내역</h3>
            </div>

            <div className="grid gap-3">
              {result.personalBalances.map((balance) => (
                <Card
                  key={balance.participantId}
                  className="border-2 border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="p-4 flex items-center gap-4">
                    <Avatar className={`w-14 h-14 ${getAvatarColor(balance.participantName)}`}>
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {getInitials(balance.participantName)}
                      </div>
                    </Avatar>

                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-1">
                        {balance.participantName}
                      </h4>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>지불: {formatCurrency(balance.totalPaid)}원</span>
                        <span>부담: {formatCurrency(balance.totalOwed)}원</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={balance.balance > 0 ? 'default' : balance.balance < 0 ? 'destructive' : 'secondary'}
                        className="text-base px-3 py-1"
                      >
                        {balance.balance > 0 && '+'}
                        {formatCurrency(balance.balance)}원
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {balance.balance > 0 && '받을 금액'}
                        {balance.balance < 0 && '보낼 금액'}
                        {balance.balance === 0 && '정산 완료'}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* Expense Details */}
        <Card className="border-0 shadow-lg bg-white">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full" />
              <h3 className="text-2xl font-black text-gray-900">지출 내역</h3>
            </div>

            <div className="space-y-2">
              {settlement.expenses.map((expense) => {
                const payer = settlement.participants.find(
                  (p) => p.id === expense.paidBy
                );
                const participants = expense.participantIds
                  .map((id) => settlement.participants.find((p) => p.id === id)?.name)
                  .filter(Boolean);

                return (
                  <div
                    key={expense.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{expense.name}</h4>
                      <p className="text-xl font-black text-gray-900">
                        {formatCurrency(expense.amount)}원
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>결제: {payer?.name}</span>
                      <span>참여: {participants.join(', ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={handleCopyText}
          variant="outline"
          size="lg"
          className="h-16 flex flex-col gap-1 hover:bg-gray-50"
        >
          <Copy className="w-5 h-5" />
          <span className="text-sm font-semibold">텍스트 복사</span>
        </Button>
        <Button
          onClick={handleDownloadImage}
          variant="outline"
          size="lg"
          className="h-16 flex flex-col gap-1 hover:bg-gray-50"
        >
          <Download className="w-5 h-5" />
          <span className="text-sm font-semibold">이미지 저장</span>
        </Button>
        <Button
          onClick={handleShare}
          size="lg"
          className="h-16 flex flex-col gap-1 bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-semibold">공유하기</span>
        </Button>
      </div>
    </div>
  );
}
