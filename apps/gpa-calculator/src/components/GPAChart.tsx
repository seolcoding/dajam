import { Card, CardHeader, CardTitle, CardContent } from '@mini-apps/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Semester, ChartData, GPAScale } from '../types';
import { calculateSemesterGPA, calculateCumulativeGPA } from '../lib/gpa';

interface GPAChartProps {
  semesters: Semester[];
  scale: GPAScale;
}

export function GPAChart({ semesters, scale }: GPAChartProps) {
  if (semesters.length === 0) {
    return null;
  }

  const data: ChartData[] = semesters.map((sem, idx) => {
    const semesterGPA = calculateSemesterGPA(sem.courses, scale);
    const cumulativeGPA = calculateCumulativeGPA(semesters.slice(0, idx + 1), scale);

    return {
      semester: `${sem.year}-${sem.term}`,
      학기GPA: semesterGPA.gpa,
      누적GPA: cumulativeGPA.gpa
    };
  });

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-gray-900">학점 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis domain={[0, 4.5]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="학기GPA"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 4, fill: '#2563eb' }}
            />
            <Line
              type="monotone"
              dataKey="누적GPA"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 4, fill: '#7c3aed' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
