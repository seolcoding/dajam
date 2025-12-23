'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, CheckCircle } from 'lucide-react';
import type { QuizQuestion } from './types';
import { OPTION_STYLES } from './types';

export interface QuizHostProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  answeredCount: number;
  totalParticipants: number;
  showAnswer?: boolean;
}

/**
 * 퀴즈 호스트 뷰 컴포넌트
 * - 질문과 선택지를 큰 화면에 표시
 * - 답변 현황과 타이머 표시
 * - audience-engage와 독립 앱에서 공유
 */
export function QuizHost({
  question,
  questionNumber,
  totalQuestions,
  timeLeft,
  answeredCount,
  totalParticipants,
  showAnswer = false,
}: QuizHostProps) {
  // 타이머 진행률
  const progress = (timeLeft / question.timeLimit) * 100;

  // 타이머 색상
  const getTimerColor = () => {
    if (progress > 60) return 'bg-green-500';
    if (progress > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white p-8">
      {/* 상단 정보 바 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
            <span className="text-2xl font-bold">
              문제 {questionNumber}/{totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
            <Users className="w-6 h-6" />
            <span className="text-xl font-bold">{totalParticipants}명</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
          <CheckCircle className="w-6 h-6" />
          <span className="text-xl font-bold">
            {answeredCount}/{totalParticipants} 답변 완료
          </span>
        </div>
      </div>

      {/* 질문 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center mb-8"
      >
        <div className="max-w-4xl w-full text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
            {question.text}
          </h2>

          {question.imageUrl && (
            <div className="mt-8">
              <img
                src={question.imageUrl}
                alt="Question"
                className="max-w-2xl max-h-96 mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          )}
        </div>

        {/* 선택지 (2x2 그리드) */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-5xl">
          {question.options.map((option, index) => {
            const style = OPTION_STYLES[index];
            const isCorrect = showAnswer && index === question.correctIndex;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative p-8 rounded-3xl shadow-2xl
                  ${style.color}
                  ${isCorrect ? 'ring-4 ring-yellow-400 ring-offset-4' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{style.shape}</div>
                  <div className="flex-1">
                    <div className="text-3xl font-bold">{option}</div>
                  </div>
                </div>

                {/* 정답 표시 */}
                {isCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 하단 타이머 */}
      <div className="space-y-4">
        {/* 타이머 바 */}
        <div className="relative h-8 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${getTimerColor()}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* 남은 시간 */}
        <div className="flex items-center justify-center gap-3">
          <Clock className="w-8 h-8" />
          <span className="text-4xl font-black">{timeLeft}초</span>
        </div>
      </div>
    </div>
  );
}

export default QuizHost;
