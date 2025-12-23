'use client';

import React from 'react';
import type { TestQuestion } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TestQuestionProps {
  question: TestQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (direction: 'left' | 'right') => void;
}

export default function TestQuestion({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
}: TestQuestionProps) {
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            질문 {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-sm font-medium text-gray-600">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="bg-white shadow-xl rounded-3xl overflow-hidden border-0">
        <div className="p-8 md:p-12">
          {/* Question Text */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {question.text}
            </h2>
            <p className="text-sm text-gray-500">
              솔직하게 답변해주세요
            </p>
          </div>

          {/* Answer Buttons - Mobile Optimized (세로 배치) */}
          <div className="flex flex-col gap-4">
            {/* Option Left */}
            <Button
              onClick={() => onAnswer('left')}
              className="w-full h-auto min-h-[80px] md:min-h-[100px] text-lg md:text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] p-6"
            >
              <div className="flex items-center justify-center text-center">
                {question.optionLeft}
              </div>
            </Button>

            {/* Option Right */}
            <Button
              onClick={() => onAnswer('right')}
              className="w-full h-auto min-h-[80px] md:min-h-[100px] text-lg md:text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] p-6"
            >
              <div className="flex items-center justify-center text-center">
                {question.optionRight}
              </div>
            </Button>
          </div>
        </div>
      </Card>

      {/* Helper Text */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          💡 두 선택지 중 더 가까운 것을 골라주세요
        </p>
      </div>
    </div>
  );
}
