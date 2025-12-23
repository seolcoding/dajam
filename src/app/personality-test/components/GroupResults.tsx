'use client';

import React from 'react';
import type { Participant, TypeDistribution, DimensionDistribution } from '../types';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { getPersonalityType } from '../data/personalities';
import { MBTI_DIMENSIONS } from '../data/questions';

interface GroupResultsProps {
  participants: Participant[];
}

export default function GroupResults({ participants: allParticipants }: GroupResultsProps) {
  // Filter only completed participants
  const participants = allParticipants.filter(p => p.result);

  // Calculate type distribution
  const typeDistribution: TypeDistribution[] = React.useMemo(() => {
    const typeMap = new Map<string, number>();

    participants.forEach(p => {
      if (p.result) {
        typeMap.set(p.result, (typeMap.get(p.result) || 0) + 1);
      }
    });

    const total = participants.length;
    return Array.from(typeMap.entries())
      .map(([type, count]) => ({
        type: type as any,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [participants]);

  // Calculate dimension distribution
  const dimensionDistribution: DimensionDistribution[] = React.useMemo(() => {
    const dims = {
      EI: { left: 0, right: 0 },
      SN: { left: 0, right: 0 },
      TF: { left: 0, right: 0 },
      JP: { left: 0, right: 0 },
    };

    participants.forEach(p => {
      if (!p.result) return;
      const [ei, sn, tf, jp] = p.result.split('');
      dims.EI[ei === 'E' ? 'left' : 'right']++;
      dims.SN[sn === 'S' ? 'left' : 'right']++;
      dims.TF[tf === 'T' ? 'left' : 'right']++;
      dims.JP[jp === 'J' ? 'left' : 'right']++;
    });

    const total = participants.length;
    return Object.entries(dims).map(([dimension, counts]) => ({
      dimension: dimension as any,
      left: counts.left,
      right: counts.right,
      leftPercentage: Math.round((counts.left / total) * 100),
      rightPercentage: Math.round((counts.right / total) * 100),
    }));
  }, [participants]);

  if (participants.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 text-lg">
          아직 완료한 참가자가 없습니다
        </p>
      </Card>
    );
  }

  // Colors for the bar chart
  const COLORS = [
    '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
    '#06b6d4', '#6366f1', '#ef4444', '#84cc16', '#f97316',
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📊 그룹 결과 분석
        </h2>
        <p className="text-gray-600">
          총 {participants.length}명 참여
        </p>
      </div>

      {/* Type Distribution Chart */}
      <Card className="p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">유형 분포</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={typeDistribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const personality = getPersonalityType(data.type);
                  return (
                    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                      <p className="font-bold text-lg mb-1">
                        {data.type} {personality.emoji}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {personality.name}
                      </p>
                      <p className="text-sm">
                        인원: {data.count}명 ({data.percentage}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="count" name="인원" radius={[8, 8, 0, 0]}>
              {typeDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Dimension Distribution */}
      <Card className="p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">차원별 분포</h3>
        <div className="space-y-6">
          {dimensionDistribution.map((dim) => {
            const dimInfo = MBTI_DIMENSIONS.find(d => d.id === dim.dimension)!;
            return (
              <div key={dim.dimension}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{dimInfo.name}</h4>
                  <span className="text-sm text-gray-600">
                    {dim.left + dim.right}명
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {/* Left side */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {dimInfo.left.label} ({dimInfo.left.code})
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {dim.leftPercentage}%
                      </span>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-[2] h-12 flex rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-4 text-white font-bold"
                      style={{ width: `${dim.leftPercentage}%` }}
                    >
                      {dim.left > 0 && <span>{dim.left}</span>}
                    </div>
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-start pl-4 text-white font-bold"
                      style={{ width: `${dim.rightPercentage}%` }}
                    >
                      {dim.right > 0 && <span>{dim.right}</span>}
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-purple-600">
                        {dim.rightPercentage}%
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        ({dimInfo.right.code}) {dimInfo.right.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span className="flex-1 text-right pr-4">
                    {dimInfo.left.description}
                  </span>
                  <span className="flex-1 pl-4">
                    {dimInfo.right.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Participant List */}
      <Card className="p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">참가자 목록</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {participants.map((participant) => {
            const personality = participant.result
              ? getPersonalityType(participant.result)
              : null;

            return (
              <div
                key={participant.id}
                className={`${personality?.color || 'bg-gray-500'} text-white p-4 rounded-xl shadow-md`}
              >
                <div className="text-3xl mb-2 text-center">
                  {personality?.emoji || '👤'}
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg mb-1">
                    {participant.result}
                  </p>
                  <p className="text-sm opacity-90 truncate">
                    {participant.nickname}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
