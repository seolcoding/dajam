import { Card, CardHeader, CardTitle, CardContent } from '@mini-apps/ui';
import { TrendingUp, Award, BookMarked } from 'lucide-react';
import type { GPAResult } from '../types';

interface GPADisplayProps {
  cumulative: GPAResult;
  major: GPAResult;
  general: GPAResult;
}

export function GPADisplay({ cumulative, major, general }: GPADisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-blue-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">누적 GPA</CardTitle>
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{cumulative.gpa.toFixed(2)}</div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-600">
              총 <span className="font-semibold text-gray-900">{cumulative.earnedCredits}</span>학점 이수
            </p>
            <p className="text-xs text-gray-500">
              평점 계산: {cumulative.totalCredits}학점
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">전공 GPA</CardTitle>
          <Award className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{major.gpa > 0 ? major.gpa.toFixed(2) : '-'}</div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-600">
              {major.earnedCredits > 0 ? (
                <>총 <span className="font-semibold text-gray-900">{major.earnedCredits}</span>학점 이수</>
              ) : (
                '전공 과목 없음'
              )}
            </p>
            <p className="text-xs text-gray-500">
              {major.totalCredits > 0 ? `평점 계산: ${major.totalCredits}학점` : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">교양 GPA</CardTitle>
          <BookMarked className="h-5 w-5 text-gray-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{general.gpa > 0 ? general.gpa.toFixed(2) : '-'}</div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-600">
              {general.earnedCredits > 0 ? (
                <>총 <span className="font-semibold text-gray-900">{general.earnedCredits}</span>학점 이수</>
              ) : (
                '교양 과목 없음'
              )}
            </p>
            <p className="text-xs text-gray-500">
              {general.totalCredits > 0 ? `평점 계산: ${general.totalCredits}학점` : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
