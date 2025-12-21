import { useSalaryStore } from '@/hooks/useSalaryStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mini-apps/ui';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = {
  nationalPension: '#3b82f6',  // blue-600
  healthInsurance: '#10b981',  // emerald-600
  longTermCare: '#8b5cf6',     // violet-600
  employmentInsurance: '#f59e0b', // amber-600
  incomeTax: '#ef4444',        // red-600
  localIncomeTax: '#ec4899',   // pink-600
  netPay: '#059669',           // emerald-700 (실수령액 - 더 진한 색)
};

export function DeductionChart() {
  const { breakdown } = useSalaryStore();

  if (!breakdown) {
    return null;
  }

  const chartData = [
    { name: '국민연금', value: breakdown.nationalPension, color: COLORS.nationalPension },
    { name: '건강보험', value: breakdown.healthInsurance, color: COLORS.healthInsurance },
    { name: '장기요양', value: breakdown.longTermCare, color: COLORS.longTermCare },
    { name: '고용보험', value: breakdown.employmentInsurance, color: COLORS.employmentInsurance },
    { name: '소득세', value: breakdown.incomeTax, color: COLORS.incomeTax },
    { name: '지방소득세', value: breakdown.localIncomeTax, color: COLORS.localIncomeTax },
    { name: '실수령액', value: breakdown.netPay, color: COLORS.netPay },
  ];

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / breakdown.monthlyGross) * 100).toFixed(1);
    return `${percent}%`;
  };

  return (
    <Card className="shadow-lg shadow-cyan-500/5 border-cyan-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <PieChartIcon className="w-5 h-5 text-cyan-600" />
          급여 구성 비율
        </CardTitle>
        <CardDescription className="text-slate-500">총 급여 대비 공제 항목별 비율</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="bg-slate-50/50 rounded-xl p-4">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={110}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="white"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value.toLocaleString()}원`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={50}
                formatter={(value) => <span className="text-sm font-medium text-slate-700">{value}</span>}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
