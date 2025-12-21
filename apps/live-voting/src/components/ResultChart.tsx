import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import type { PollResult } from '@/types/poll';

interface ResultChartProps {
  results: PollResult[];
  isRanking?: boolean;
  isPresentationMode?: boolean;
}

const COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // orange
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#84cc16', // teal
];

export function ResultChart({ results, isRanking = false, isPresentationMode = false }: ResultChartProps) {
  const chartData = results.map(r => ({
    name: r.option.length > 15 ? r.option.substring(0, 15) + '...' : r.option,
    fullName: r.option,
    value: isRanking ? (r.score || 0) : r.count,
    displayValue: isRanking ? `${r.score}점` : `${r.count}표`,
  }));

  const fontSize = isPresentationMode ? 16 : 13;
  const height = isPresentationMode ? 500 : 400;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        margin={{
          top: 30,
          right: 30,
          left: 20,
          bottom: isPresentationMode ? 80 : 70
        }}
      >
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={isPresentationMode ? 120 : 100}
          interval={0}
          tick={{ fill: '#374151', fontSize, fontWeight: 600 }}
        />
        <YAxis
          tick={{ fill: '#374151', fontSize, fontWeight: 500 }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
          }}
          labelStyle={{
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '4px'
          }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
        />
        <Bar
          dataKey="value"
          animationDuration={800}
          animationEasing="ease-out"
          radius={[12, 12, 0, 0]}
        >
          {chartData.map((_entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
          <LabelList
            dataKey="displayValue"
            position="top"
            style={{
              fill: '#111827',
              fontWeight: 'bold',
              fontSize: isPresentationMode ? 18 : 14
            }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
