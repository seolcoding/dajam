/**
 * 비용 비교 차트 컴포넌트
 */

import { Card, CardHeader, CardTitle, CardContent, Label, Slider, NumberInput } from '@mini-apps/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { calculateJeonseTotalCost, calculateWolseTotalCost, calculateBreakEvenPoint } from '../lib/costComparison';
import { CurrencyDisplay } from './CurrencyDisplay';
import { InfoTooltip } from './InfoTooltip';

export function CostComparisonChart() {
  const {
    jeonse,
    ownFunds,
    loanRate,
    depositForJeonse,
    monthlyRent,
    setOwnFunds,
    setLoanRate,
  } = useCalculatorStore();

  const jeonseCost = calculateJeonseTotalCost(jeonse, ownFunds, loanRate);
  const wolseCost = calculateWolseTotalCost(depositForJeonse, monthlyRent);

  const chartData = [
    {
      name: '초기 비용',
      전세: jeonseCost.brokerageFee,
      월세: wolseCost.brokerageFee,
    },
    {
      name: '월 부담액',
      전세: jeonseCost.monthlyInterest,
      월세: wolseCost.monthlyRent,
    },
    {
      name: '2년 총액',
      전세: jeonseCost.totalCost,
      월세: wolseCost.totalCost,
    },
  ];

  const breakEvenMonths = calculateBreakEvenPoint(jeonseCost, wolseCost);

  return (
    <div className="space-y-6">
      {/* 대출 설정 */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-semibold text-gray-900">대출 설정</CardTitle>
        </CardHeader>
        <CardContent className="bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="own-funds">보유 자금</Label>
              <NumberInput
                id="own-funds"
                value={ownFunds}
                onChange={(value) => setOwnFunds(value || 0)}
                min={0}
                suffix="원"
              />
              <p className="text-xs text-gray-500 mt-1">
                전세금에서 보유 자금을 제외한 금액을 대출합니다
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor="loan-rate">대출 금리</Label>
                <InfoTooltip content="전세자금대출 연이율 (일반적으로 3~4%)" />
              </div>
              <div className="space-y-2">
                <Slider
                  id="loan-rate"
                  value={[loanRate]}
                  onValueChange={([value]) => setLoanRate(value)}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0.1%</span>
                  <span className="font-semibold">{loanRate.toFixed(1)}%</span>
                  <span>10%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 비용 비교 */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-white">
          <CardTitle className="text-lg font-semibold text-gray-900">비용 비교 분석 (2년 기준)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 bg-white">
          {/* 상세 비용 테이블 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 전세 */}
          <div className="p-5 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">전세</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>전세금:</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={jeonseCost.deposit} /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>대출금:</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={jeonseCost.loanAmount} /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>중개수수료:</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={jeonseCost.brokerageFee} /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>월 이자 ({jeonseCost.loanRate}%):</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={jeonseCost.monthlyInterest} /></span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-700">2년 총 비용:</span>
                <span className="font-bold text-blue-600"><CurrencyDisplay value={jeonseCost.totalCost} /></span>
              </div>
            </div>
          </div>

          {/* 월세 */}
          <div className="p-5 bg-white rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">월세</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>보증금:</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={wolseCost.deposit} /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>월세:</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={wolseCost.monthlyRent} /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>중개수수료:</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={wolseCost.brokerageFee} /></span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>24개월 월세:</span>
                <span className="font-semibold text-gray-900"><CurrencyDisplay value={wolseCost.monthlyRent * 24} /></span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200">
                <span className="font-semibold text-gray-700">2년 총 비용:</span>
                <span className="font-bold text-blue-600"><CurrencyDisplay value={wolseCost.totalCost} /></span>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 */}
        <div className="h-80 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} stroke="#6b7280" />
              <Tooltip
                formatter={(value) => `${Number(value).toLocaleString()}원`}
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="전세" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="월세" fill="#6b7280" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 손익분기점 */}
        <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-gray-900 mb-3">손익분기점 분석</p>
          <p className="text-base text-gray-700">
            {breakEvenMonths === Infinity ? (
              <span className="text-blue-600 font-semibold">전세가 항상 유리합니다</span>
            ) : breakEvenMonths < 0 ? (
              <span className="text-gray-600 font-semibold">월세가 항상 유리합니다</span>
            ) : (
              <>
                약 <span className="font-bold text-blue-600">{breakEvenMonths}개월</span> 이상 거주 시{' '}
                <span className="font-semibold text-blue-600">전세가 유리</span>합니다
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-3">
            * 손익분기점: 전세와 월세의 누적 비용이 같아지는 시점
          </p>
        </div>

        {/* 결론 */}
        <div className="p-5 bg-white rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-3">결론</p>
          {jeonseCost.totalCost < wolseCost.totalCost ? (
            <p className="text-base text-gray-700">
              2년 거주 시 <span className="font-bold text-blue-600">전세</span>가{' '}
              <CurrencyDisplay value={wolseCost.totalCost - jeonseCost.totalCost} className="font-bold text-blue-600" /> 더 저렴합니다.
            </p>
          ) : (
            <p className="text-base text-gray-700">
              2년 거주 시 <span className="font-bold text-blue-600">월세</span>가{' '}
              <CurrencyDisplay value={jeonseCost.totalCost - wolseCost.totalCost} className="font-bold text-blue-600" /> 더 저렴합니다.
            </p>
          )}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
