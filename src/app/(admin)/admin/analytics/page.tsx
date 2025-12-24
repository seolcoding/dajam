'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, FolderOpen } from 'lucide-react';

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">분석</h2>
          <p className="text-muted-foreground">플랫폼 사용 현황 및 트렌드를 분석하세요</p>
        </div>
        <Select defaultValue="7days">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">최근 7일</SelectItem>
            <SelectItem value="30days">최근 30일</SelectItem>
            <SelectItem value="90days">최근 90일</SelectItem>
            <SelectItem value="1year">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              사용자 증가 추이
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="사용자 수"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* App Usage Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                앱별 사용량
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="app" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sessions" fill="#8b5cf6" name="세션 수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                플랜 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Session Trends */}
        <Card>
          <CardHeader>
            <CardTitle>세션 트렌드</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="생성된 세션"
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="활성 세션"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Mock data
const userGrowthData = [
  { date: '01/01', users: 120 },
  { date: '01/02', users: 145 },
  { date: '01/03', users: 168 },
  { date: '01/04', users: 190 },
  { date: '01/05', users: 220 },
  { date: '01/06', users: 245 },
  { date: '01/07', users: 280 },
];

const appUsageData = [
  { app: '실시간 투표', sessions: 45 },
  { app: '청중 참여', sessions: 38 },
  { app: '공동 주문', sessions: 32 },
  { app: 'This or That', sessions: 28 },
  { app: '실시간 퀴즈', sessions: 25 },
];

const planDistributionData = [
  { name: 'Free', value: 245 },
  { name: 'Pro', value: 35 },
];

const COLORS = ['#94a3b8', '#3b82f6'];

const sessionTrendsData = [
  { date: '01/01', created: 12, active: 8 },
  { date: '01/02', created: 15, active: 10 },
  { date: '01/03', created: 18, active: 12 },
  { date: '01/04', created: 14, active: 9 },
  { date: '01/05', created: 20, active: 15 },
  { date: '01/06', created: 22, active: 16 },
  { date: '01/07', created: 25, active: 18 },
];

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}
