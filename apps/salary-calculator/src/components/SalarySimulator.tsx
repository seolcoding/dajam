import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Slider,
  Label,
} from '@mini-apps/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateSalaryRange, formatNumber } from '@/utils/salaryCalculator';
import { useSalaryStore } from '@/hooks/useSalaryStore';
import { TrendingUp } from 'lucide-react';

const MIN_SALARY = 20000000; // 2천만원
const MAX_SALARY = 200000000; // 2억원
const STEP = 5000000; // 500만원

export function SalarySimulator() {
  const { taxFreeAmount, dependents, children, includeRetirement } = useSalaryStore();
  const [simulatedSalary, setSimulatedSalary] = useState(50000000); // 기본 5천만원
  const [chartData, setChartData] = useState<Array<{ salary: number; netPay: number }>>([]);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    const data = calculateSalaryRange(
      MIN_SALARY,
      MAX_SALARY,
      STEP,
      {
        taxFreeAmount,
        dependents,
        children,
        includeRetirement,
      }
    );
    setChartData(data);
  }, [taxFreeAmount, dependents, children, includeRetirement]);

  const currentData = chartData.find(d => d.salary === simulatedSalary) || chartData[0];
  const takeHomeRate = currentData
    ? ((currentData.netPay / (simulatedSalary / 12)) * 100).toFixed(1)
    : '0';

  const handleSliderChange = ([value]: number[]) => {
    setSimulatedSalary(value);
    setIsSliding(true);
    setTimeout(() => setIsSliding(false), 150);
  };

  return (
    <Card className="shadow-lg shadow-violet-500/5 border-violet-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          연봉 협상 시뮬레이터
        </CardTitle>
        <CardDescription className="text-slate-500">슬라이더로 연봉을 조정하며 실수령액을 확인하세요</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 슬라이더 - 향상된 시각화 */}
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <Label className="text-sm font-medium text-slate-600">연봉</Label>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-5xl font-black text-violet-600 tabular-nums transition-all duration-200 ${
                  isSliding ? 'scale-110' : 'scale-100'
                }`}
                style={{
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.02em',
                }}
              >
                {formatNumber(simulatedSalary)}
              </span>
              <span className="text-2xl font-semibold text-violet-500">원</span>
            </div>
          </div>

          {/* Custom styled slider container */}
          <div className="relative px-1">
            <Slider
              value={[simulatedSalary]}
              onValueChange={handleSliderChange}
              min={MIN_SALARY}
              max={MAX_SALARY}
              step={STEP}
              className="w-full"
            />
            {/* Progress indicator */}
            <div className="flex justify-between items-center mt-2 text-xs">
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                {(MIN_SALARY / 10000000).toFixed(0)}천만원
              </span>
              <div className="flex-1 mx-4 h-px bg-slate-200"></div>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
                {(MAX_SALARY / 10000000).toFixed(0)}억원
              </span>
            </div>
          </div>
        </div>

        {/* 실수령액 정보 - 카드 스타일 개선 */}
        {currentData && (
          <div className="grid grid-cols-2 gap-4">
            <div className="relative overflow-hidden p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl shadow-sm border border-violet-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet-400/10 rounded-full blur-2xl"></div>
              <div className="relative space-y-2">
                <div className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
                  월 실수령액
                </div>
                <div className="text-3xl font-black text-violet-700 tabular-nums">
                  {formatNumber(currentData.netPay)}
                  <span className="text-lg font-medium ml-1">원</span>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-100">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full blur-2xl"></div>
              <div className="relative space-y-2">
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                  실수령 비율
                </div>
                <div className="text-3xl font-black text-amber-700 tabular-nums">
                  {takeHomeRate}
                  <span className="text-lg font-medium ml-1">%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 차트 */}
        <div className="pt-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="salary"
                tickFormatter={(value) => `${(value / 10000000).toFixed(0)}천만`}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
              />
              <Tooltip
                formatter={(value: number) => `${formatNumber(value)}원`}
                labelFormatter={(value) => `연봉: ${formatNumber(value)}원`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="netPay"
                stroke="#3b82f6"
                strokeWidth={2}
                name="월 실수령액"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
