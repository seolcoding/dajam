import { useSalaryStore } from '@/hooks/useSalaryStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@mini-apps/ui';
import { formatNumber } from '@/utils/salaryCalculator';
import { FileText, Info } from 'lucide-react';

interface DeductionItemProps {
  label: string;
  amount: number;
  tooltip?: string;
  color?: string;
}

function DeductionItem({ label, amount, tooltip, color = 'text-foreground' }: DeductionItemProps) {
  return (
    <div className="flex items-center justify-between py-2.5 group hover:bg-slate-50/50 -mx-2 px-2 rounded-lg transition-colors">
      <div className="flex items-center gap-2">
        <span className={`font-medium ${color}`}>{label}</span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-help opacity-70 group-hover:opacity-100 transition-opacity" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span className={`font-bold tabular-nums ${color}`}>{formatNumber(amount)}원</span>
    </div>
  );
}

export function DeductionBreakdown() {
  const { breakdown } = useSalaryStore();

  if (!breakdown) {
    return null;
  }

  return (
    <Card className="shadow-lg shadow-rose-500/5 border-rose-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5 text-rose-600" />
          공제 내역
        </CardTitle>
        <CardDescription className="text-slate-500">4대보험 및 세금 공제 상세 내역</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 4대보험 */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
            4대보험
          </h3>
          <div className="space-y-0.5 bg-slate-50/50 rounded-xl p-3">
            <DeductionItem
              label="국민연금"
              amount={breakdown.nationalPension}
              tooltip="과세 대상 급여의 4.5% (근로자 부담분)"
              color="text-blue-600"
            />
            <DeductionItem
              label="건강보험"
              amount={breakdown.healthInsurance}
              tooltip="과세 대상 급여의 3.545% (근로자 부담분)"
              color="text-green-600"
            />
            <DeductionItem
              label="장기요양보험"
              amount={breakdown.longTermCare}
              tooltip="건강보험료의 12.95%"
              color="text-purple-600"
            />
            <DeductionItem
              label="고용보험"
              amount={breakdown.employmentInsurance}
              tooltip="과세 대상 급여의 0.9% (근로자 부담분)"
              color="text-amber-600"
            />
          </div>
          <Separator className="my-2" />
          <DeductionItem
            label="4대보험 합계"
            amount={breakdown.totalInsurance}
            color="text-blue-700"
          />
        </div>

        <Separator />

        {/* 세금 */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1 h-4 bg-red-500 rounded-full"></div>
            세금
          </h3>
          <div className="space-y-0.5 bg-slate-50/50 rounded-xl p-3">
            <DeductionItem
              label="소득세"
              amount={breakdown.incomeTax}
              tooltip="간이세액표 기준 (부양가족 수 반영)"
              color="text-red-600"
            />
            <DeductionItem
              label="지방소득세"
              amount={breakdown.localIncomeTax}
              tooltip="소득세의 10%"
              color="text-pink-600"
            />
          </div>
          <Separator className="my-2" />
          <DeductionItem
            label="세금 합계"
            amount={breakdown.totalTax}
            color="text-red-700"
          />
        </div>

        <Separator className="my-4" />

        {/* 총 공제액 - 강조된 디자인 */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-rose-50 to-red-50 rounded-2xl border-2 border-rose-200 shadow-inner">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-400/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-rose-600 uppercase tracking-wide">
                총 공제액
              </div>
              <div className="text-sm text-slate-600">
                4대보험 + 세금
              </div>
            </div>
            <div className="text-4xl font-black text-rose-600 tabular-nums">
              -{formatNumber(breakdown.totalInsurance + breakdown.totalTax)}
              <span className="text-xl font-semibold ml-1">원</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
