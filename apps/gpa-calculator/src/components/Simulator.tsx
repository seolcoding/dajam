import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Input, Label } from '@mini-apps/ui';
import { Target } from 'lucide-react';
import { calculateRequiredGPA } from '../lib/gpa';

interface SimulatorProps {
  currentGPA: number;
  currentCredits: number;
}

export function Simulator({ currentGPA, currentCredits }: SimulatorProps) {
  const [targetGPA, setTargetGPA] = useState(4.0);
  const [remainingCredits, setRemainingCredits] = useState(20);

  const result = calculateRequiredGPA({
    currentGPA,
    currentCredits,
    targetGPA,
    remainingCredits
  });

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <Target className="w-5 h-5 text-blue-600" />
          목표 학점 시뮬레이터
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="current-gpa" className="text-sm font-medium text-gray-700">현재 누적 GPA</Label>
            <Input
              id="current-gpa"
              type="number"
              value={currentGPA.toFixed(2)}
              disabled
              className="bg-gray-100 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-credits" className="text-sm font-medium text-gray-700">현재 이수 학점</Label>
            <Input
              id="current-credits"
              type="number"
              value={currentCredits}
              disabled
              className="bg-gray-100 border-gray-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-gpa" className="text-sm font-medium text-gray-700">목표 GPA</Label>
            <Input
              id="target-gpa"
              type="number"
              step="0.1"
              min="0"
              max="4.5"
              value={targetGPA}
              onChange={(e) => setTargetGPA(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remaining-credits" className="text-sm font-medium text-gray-700">남은 이수 학점</Label>
            <Input
              id="remaining-credits"
              type="number"
              min="1"
              value={remainingCredits}
              onChange={(e) => setRemainingCredits(Number(e.target.value))}
            />
          </div>
        </div>

        <div className={`p-6 rounded-lg border-2 ${
          result.isAchievable && result.requiredGPA > 0
            ? 'bg-white border-blue-600'
            : result.isAchievable && result.requiredGPA <= 0
            ? 'bg-white border-green-600'
            : 'bg-white border-red-600'
        }`}>
          <p className={`text-lg font-semibold mb-2 ${
            result.isAchievable && result.requiredGPA > 0
              ? 'text-blue-900'
              : result.isAchievable && result.requiredGPA <= 0
              ? 'text-green-900'
              : 'text-red-900'
          }`}>
            {result.message}
          </p>
          {result.isAchievable && result.requiredGPA > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-700">
                필요 평점: <span className="font-bold text-blue-600 text-2xl">{result.requiredGPA.toFixed(2)}</span> <span className="text-gray-500">/ 4.5</span>
              </p>
              <p className="text-sm text-gray-600">
                {remainingCredits}학점 동안 평균적으로 이 점수 이상을 유지해야 합니다.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="font-semibold text-sm text-gray-900 mb-2">계산 방법:</p>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• 목표 총 평점 = 목표 GPA × (현재 학점 + 남은 학점)</p>
            <p>• 필요 평점 = (목표 총 평점 - 현재 총 평점) / 남은 학점</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
