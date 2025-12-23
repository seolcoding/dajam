'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Zap } from 'lucide-react';
import type { QuizQuestion } from '../types';
import { OPTION_STYLES } from '../types';

interface ParticipantViewProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  onAnswer: (answerIndex: number) => void;
  hasAnswered: boolean;
  isCorrect?: boolean;
  pointsEarned?: number;
  correctAnswer?: number;
}

export default function ParticipantView({
  question,
  questionNumber,
  totalQuestions,
  timeLeft,
  onAnswer,
  hasAnswered,
  isCorrect,
  pointsEarned,
  correctAnswer,
}: ParticipantViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedIndex(index);
    onAnswer(index);
  };

  // 타이머 진행률
  const progress = (timeLeft / question.timeLimit) * 100;

  // 타이머 색상
  const getTimerColor = () => {
    if (progress > 60) return 'bg-green-500';
    if (progress > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex flex-col p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6 text-white">
        <div className="text-lg font-bold">
          문제 {questionNumber}/{totalQuestions}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
          <Clock className="w-5 h-5" />
          <span className="text-xl font-bold">{timeLeft}초</span>
        </div>
      </div>

      {/* 질문 텍스트 (참가자는 호스트 화면을 봐야 함) */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {question.text}
        </h2>
        <p className="text-white/80 text-sm">
          색상과 모양으로 답을 선택하세요
        </p>
      </div>

      {/* 선택지 (2x2 그리드) */}
      <div className="flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {question.options.map((option, index) => {
            const style = OPTION_STYLES[index];
            const isSelected = selectedIndex === index;
            const isCorrectOption = correctAnswer !== undefined && index === correctAnswer;
            const showCorrect = hasAnswered && isCorrectOption;
            const showWrong = hasAnswered && isSelected && !isCorrectOption;

            return (
              <motion.button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={hasAnswered}
                whileTap={!hasAnswered ? { scale: 0.95 } : {}}
                className={`
                  relative p-6 rounded-2xl shadow-2xl
                  ${style.color} ${!hasAnswered ? style.hoverColor : ''}
                  ${hasAnswered ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                  ${isSelected ? 'ring-4 ring-white' : ''}
                  transition-all duration-200
                  min-h-[80px]
                `}
              >
                <div className="flex items-center gap-4">
                  {/* 모양 */}
                  <div className="text-5xl">{style.shape}</div>

                  {/* 선택지 텍스트 */}
                  <div className="flex-1 text-left">
                    <div className="text-xl font-bold text-white">{option}</div>
                  </div>

                  {/* 정답/오답 표시 */}
                  {showCorrect && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>
                  )}
                  {showWrong && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <XCircle className="w-8 h-8 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 타이머 바 */}
      <div className="mt-6">
        <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className={getTimerColor()}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* 피드백 모달 */}
      <AnimatePresence>
        {hasAnswered && isCorrect !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <div
              className={`
              max-w-md mx-4 p-8 rounded-3xl shadow-2xl text-center
              ${isCorrect ? 'bg-green-500' : 'bg-red-500'}
            `}
            >
              {isCorrect ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle className="w-24 h-24 text-white mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-4xl font-black text-white mb-2">정답!</h3>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Zap className="w-6 h-6 text-yellow-300" />
                    <span className="text-3xl font-bold text-white">
                      +{pointsEarned?.toLocaleString()}점
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <XCircle className="w-24 h-24 text-white mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-4xl font-black text-white mb-2">아쉬워요!</h3>
                  <p className="text-xl text-white/90">다음 문제에서 만회하세요</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
