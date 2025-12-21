import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Question } from '../types';
import { Card, CardContent, Badge, Progress } from '@mini-apps/ui';
import { Trophy, Users, TrendingUp } from 'lucide-react';

interface ResultChartProps {
  question: Question;
  stats: { A: number; B: number };
  myChoice?: 'A' | 'B';
}

const COLORS = {
  A: '#2563eb', // blue-600
  B: '#9333ea', // purple-600
};

const ResultChart: React.FC<ResultChartProps> = ({ question, stats, myChoice }) => {
  const [animatedPercentageA, setAnimatedPercentageA] = useState(0);
  const [animatedPercentageB, setAnimatedPercentageB] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const totalVotes = stats.A + stats.B;
  const percentageA = (stats.A / totalVotes) * 100;
  const percentageB = (stats.B / totalVotes) * 100;

  const winner = percentageA > percentageB ? 'A' : percentageB > percentageA ? 'B' : 'tie';

  // Animate percentage reveal
  useEffect(() => {
    setShowResults(true);
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setAnimatedPercentageA(percentageA * progress);
      setAnimatedPercentageB(percentageB * progress);

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedPercentageA(percentageA);
        setAnimatedPercentageB(percentageB);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [percentageA, percentageB]);

  const barData = [
    {
      name: question.optionA,
      votes: stats.A,
      fill: COLORS.A,
    },
    {
      name: question.optionB,
      votes: stats.B,
      fill: COLORS.B,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Winner announcement */}
      {winner !== 'tie' && (
        <Card className="border-0 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl">
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg animate-bounce">
                  <Trophy className="w-10 h-10 text-yellow-900" />
                </div>
              </div>
              <h3 className="text-3xl font-black text-gray-900">
                {winner === 'A' ? question.optionA : question.optionB}
              </h3>
              <Badge className="text-lg px-6 py-2 bg-yellow-500 hover:bg-yellow-600">
                {winner === 'A' ? percentageA.toFixed(1) : percentageB.toFixed(1)}% 득표로 우승!
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* My choice highlight */}
      {myChoice && (
        <Card className={`border-2 ${
          myChoice === 'A' ? 'border-blue-500 bg-blue-50' : 'border-purple-500 bg-purple-50'
        }`}>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  myChoice === 'A' ? 'bg-blue-600' : 'bg-purple-600'
                }`}>
                  <span className="text-white font-black text-xl">{myChoice}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">나의 선택</p>
                  <p className="text-2xl font-black text-gray-900">
                    {myChoice === 'A' ? question.optionA : question.optionB}
                  </p>
                </div>
              </div>
              {winner === myChoice && (
                <Badge className="bg-green-500 hover:bg-green-600">
                  <Trophy className="w-4 h-4 mr-1" />
                  승리!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* VS battle results */}
      <Card className="border-0 shadow-xl">
        <CardContent className="py-8">
          <div className="space-y-8">
            {/* Question title */}
            <div className="text-center">
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                {question.title}
              </h2>
              <div className="flex items-center justify-center gap-2 text-gray-500">
                <Users className="w-5 h-5" />
                <p className="text-lg font-medium">
                  총 {totalVotes.toLocaleString()}명 참여
                </p>
              </div>
            </div>

            {/* Choice A */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-lg">A</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {question.optionA}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stats.A.toLocaleString()}명
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-black transition-all duration-300 ${
                    showResults ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`} style={{ color: COLORS.A }}>
                    {animatedPercentageA.toFixed(1)}%
                  </p>
                  {winner === 'A' && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold mt-1">
                      <TrendingUp className="w-4 h-4" />
                      리드 중
                    </div>
                  )}
                </div>
              </div>
              <Progress
                value={animatedPercentageA}
                className="h-4"
                style={{
                  '--progress-background': COLORS.A,
                } as React.CSSProperties}
              />
            </div>

            {/* VS divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center shadow-lg">
                    <span className="text-white font-black">VS</span>
                  </div>
                </span>
              </div>
            </div>

            {/* Choice B */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-lg">B</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {question.optionB}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {stats.B.toLocaleString()}명
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-black transition-all duration-300 ${
                    showResults ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                  }`} style={{ color: COLORS.B }}>
                    {animatedPercentageB.toFixed(1)}%
                  </p>
                  {winner === 'B' && (
                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold mt-1">
                      <TrendingUp className="w-4 h-4" />
                      리드 중
                    </div>
                  )}
                </div>
              </div>
              <Progress
                value={animatedPercentageB}
                className="h-4"
                style={{
                  '--progress-background': COLORS.B,
                } as React.CSSProperties}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bar chart comparison */}
      <Card className="border-0 shadow-xl">
        <CardContent className="py-8">
          <h3 className="text-xl font-black text-gray-900 text-center mb-6">
            투표 비교
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} />
              <Tooltip
                formatter={(value: number) => [`${value.toLocaleString()}명`, '투표 수']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                }}
              />
              <Bar dataKey="votes" radius={[0, 8, 8, 0]}>
                {barData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultChart;
