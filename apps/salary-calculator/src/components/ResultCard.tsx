import { useSalaryStore } from '@/hooks/useSalaryStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mini-apps/ui';
import { formatNumber } from '@/utils/salaryCalculator';
import { TrendingUp, DollarSign, ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ResultCard() {
  const { breakdown } = useSalaryStore();
  const [prevNetPay, setPrevNetPay] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (breakdown && breakdown.netPay !== prevNetPay) {
      setIsAnimating(true);
      setPrevNetPay(breakdown.netPay);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [breakdown?.netPay]);

  if (!breakdown) {
    return (
      <Card className="border-2 border-dashed border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-600">
            <DollarSign className="w-5 h-5" />
            실수령액
          </CardTitle>
          <CardDescription>급여 정보를 입력하고 계산하기 버튼을 눌러주세요</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const takeHomeRate = ((breakdown.netPay / breakdown.monthlyGross) * 100).toFixed(1);
  const deductionAmount = breakdown.monthlyGross - breakdown.netPay;

  return (
    <Card className="shadow-lg shadow-emerald-500/5 border-emerald-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          월 실수령액
        </CardTitle>
        <CardDescription className="text-slate-500">4대보험 및 세금 공제 후 금액</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 실수령액 - 강력한 시각적 임팩트 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 shadow-inner">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-400/10 rounded-full blur-2xl"></div>

          <div className="relative space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>월 실수령액</span>
            </div>
            <div
              className={`text-6xl font-black text-emerald-600 tracking-tight transition-all duration-600 ${
                isAnimating ? 'scale-105' : 'scale-100'
              }`}
              style={{
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}
            >
              {formatNumber(breakdown.netPay)}
              <span className="text-3xl font-semibold ml-1">원</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">세전 급여</span>
              <span className="font-semibold text-slate-700">
                {formatNumber(breakdown.monthlyGross)}원
              </span>
              <ArrowDown className="w-4 h-4 text-rose-500" />
              <span className="font-semibold text-rose-600">
                -{formatNumber(deductionAmount)}원
              </span>
            </div>
          </div>
        </div>

        {/* 실수령 비율 - 시각적 진행률 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span>실수령 비율</span>
            </div>
            <span className="text-3xl font-bold text-indigo-600 tabular-nums">
              {takeHomeRate}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/50"
              style={{ width: `${takeHomeRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>공제액: {((100 - parseFloat(takeHomeRate))).toFixed(1)}%</span>
            <span>실수령: {takeHomeRate}%</span>
          </div>
        </div>

        {/* 연간 실수령액 - 부드러운 강조 */}
        <div className="relative p-6 border-2 border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-6 -translate-y-1/2 px-3 py-1 bg-white border border-slate-200 rounded-full">
            <span className="text-xs font-semibold text-slate-600">연간 총액</span>
          </div>
          <div className="pt-2 text-center">
            <div className="text-4xl font-bold text-slate-800 tabular-nums">
              {formatNumber(breakdown.netPay * 12)}
              <span className="text-xl font-medium ml-1 text-slate-600">원</span>
            </div>
            <div className="text-sm text-slate-500 mt-2">
              12개월 기준 예상 실수령액
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
