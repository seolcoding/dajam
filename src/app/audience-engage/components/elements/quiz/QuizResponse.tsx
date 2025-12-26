'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import type { SessionElement } from '@/types/database';
import type {
  QuizElementConfig,
  QuizElementState,
  QuizResponseData,
  QuizQuestion,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface QuizResponseProps {
  element: SessionElement;
  sessionId: string;
  participantId?: string;
  userId?: string;
  anonymousId?: string;
  displayName?: string;
  className?: string;
}

// ============================================
// Color Palette
// ============================================

const OPTION_COLORS = [
  'bg-red-500 hover:bg-red-600',
  'bg-blue-500 hover:bg-blue-600',
  'bg-amber-500 hover:bg-amber-600',
  'bg-emerald-500 hover:bg-emerald-600',
];

const OPTION_ICONS = ['▲', '◆', '●', '■'];

// ============================================
// Component
// ============================================

export function QuizResponse({
  element,
  sessionId,
  participantId,
  userId,
  anonymousId,
  displayName,
  className,
}: QuizResponseProps) {
  const config = element.config as unknown as QuizElementConfig;
  const state = (element.state || {}) as unknown as QuizElementState;

  // 현재 문제 인덱스
  const currentQuestionIndex = state.currentQuestionIndex ?? 0;
  const currentQuestion = config.questions[currentQuestionIndex];
  const isQuestionActive = state.isQuestionActive ?? false;
  const isRevealed = state.isRevealed ?? false;

  // 로컬 상태
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // 응답 훅
  const {
    responses,
    hasResponded,
    myResponse,
    submitResponse,
    error: responseError,
  } = useElementResponses<QuizResponseData>({
    elementId: element.id,
    sessionId,
    participantId,
    userId,
    anonymousId,
    responseType: 'answer',
  });

  // 현재 문제에 대한 내 응답 찾기
  const myCurrentAnswer = useMemo(() => {
    if (!myResponse) return null;
    const data = myResponse.data as unknown as QuizResponseData;
    if (data.questionId === currentQuestion?.id) {
      return data.answer;
    }
    return null;
  }, [myResponse, currentQuestion?.id]);

  const hasAnsweredCurrent = myCurrentAnswer !== null;

  // ============================================
  // Timer
  // ============================================

  useEffect(() => {
    if (!isQuestionActive || !currentQuestion?.timeLimit || !state.questionStartedAt) {
      setTimeLeft(null);
      return;
    }

    const startTime = new Date(state.questionStartedAt).getTime();
    const endTime = startTime + currentQuestion.timeLimit * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining <= 0) {
        // 시간 초과
        setTimeLeft(0);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isQuestionActive, currentQuestion?.timeLimit, state.questionStartedAt]);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedAnswer(null);
  }, [currentQuestionIndex]);

  // ============================================
  // Handlers
  // ============================================

  const handleSelectAnswer = useCallback((answer: string | number) => {
    if (hasAnsweredCurrent || isSubmitting || !isQuestionActive || timeLeft === 0) return;
    setSelectedAnswer(answer);
  }, [hasAnsweredCurrent, isSubmitting, isQuestionActive, timeLeft]);

  const handleSubmit = async () => {
    if (selectedAnswer === null || isSubmitting || hasAnsweredCurrent) return;

    setIsSubmitting(true);

    try {
      const responseData: QuizResponseData = {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        answeredAt: Date.now(),
      };

      // 정답 체크
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer ||
        (typeof currentQuestion.correctAnswer === 'number' &&
          currentQuestion.options?.[currentQuestion.correctAnswer] === selectedAnswer);

      // 점수 계산 (speed bonus 포함)
      let score = 0;
      if (isCorrect) {
        score = currentQuestion.points;

        // Speed bonus: 남은 시간에 비례해서 최대 50% 추가
        if (config.speedBonus && currentQuestion.timeLimit && timeLeft) {
          const timeBonus = Math.floor((timeLeft / currentQuestion.timeLimit) * (currentQuestion.points * 0.5));
          score += timeBonus;
        }
      }

      await submitResponse(responseData, {
        displayName,
        score,
        isCorrect,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // Render: 대기 상태
  // ============================================

  if (!currentQuestion) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">퀴즈 완료!</h3>
        <p className="text-gray-500">결과를 기다려주세요</p>
      </div>
    );
  }

  if (!isQuestionActive && !isRevealed) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Loader2 className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
        <h3 className="text-xl font-bold mb-2">다음 문제 준비 중...</h3>
        <p className="text-gray-500">잠시만 기다려주세요</p>
      </div>
    );
  }

  // ============================================
  // Render: 정답 공개 상태
  // ============================================

  if (isRevealed) {
    const isCorrect = myCurrentAnswer === currentQuestion.correctAnswer ||
      (typeof currentQuestion.correctAnswer === 'number' &&
        currentQuestion.options?.[currentQuestion.correctAnswer] === myCurrentAnswer);

    return (
      <div className={cn('space-y-6', className)}>
        {/* Result indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            'w-24 h-24 mx-auto rounded-full flex items-center justify-center',
            isCorrect ? 'bg-emerald-100' : 'bg-red-100'
          )}
        >
          {isCorrect ? (
            <Check className="w-12 h-12 text-emerald-600" />
          ) : (
            <X className="w-12 h-12 text-red-600" />
          )}
        </motion.div>

        <div className="text-center">
          <h3 className={cn(
            'text-2xl font-bold',
            isCorrect ? 'text-emerald-600' : 'text-red-600'
          )}>
            {isCorrect ? '정답입니다!' : '오답입니다'}
          </h3>
          {myResponse?.score != null && myResponse.score > 0 && (
            <p className="text-lg text-gray-600 mt-2">
              +{myResponse.score}점
            </p>
          )}
        </div>

        {/* Correct answer */}
        {!isCorrect && config.showCorrectAnswer && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-sm text-emerald-700 font-medium mb-1">정답</p>
            <p className="text-lg font-bold text-emerald-800">
              {typeof currentQuestion.correctAnswer === 'number'
                ? currentQuestion.options?.[currentQuestion.correctAnswer]
                : currentQuestion.correctAnswer}
            </p>
          </div>
        )}

        {/* Explanation */}
        {currentQuestion.explanation && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 font-medium mb-1">해설</p>
            <p className="text-blue-800">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // Render: 문제 풀이 UI
  // ============================================

  const options = currentQuestion.options || [];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Timer */}
      {timeLeft !== null && (
        <div className="flex justify-center">
          <motion.div
            animate={{
              scale: timeLeft <= 5 ? [1, 1.1, 1] : 1,
            }}
            transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full font-bold text-lg',
              timeLeft <= 5
                ? 'bg-red-100 text-red-600'
                : timeLeft <= 10
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 text-gray-700'
            )}
          >
            <Clock className="w-5 h-5" />
            {timeLeft}초
          </motion.div>
        </div>
      )}

      {/* Question */}
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          문제 {currentQuestionIndex + 1} / {config.questions.length}
        </div>
        <h3 className="text-xl font-bold">{currentQuestion.text}</h3>
        {currentQuestion.imageUrl && (
          <img
            src={currentQuestion.imageUrl}
            alt="문제 이미지"
            className="max-w-full h-auto rounded-lg mx-auto mt-4"
          />
        )}
      </div>

      {/* True/False Question */}
      {currentQuestion.type === 'true_false' && (
        <div className="grid grid-cols-2 gap-4">
          {['O', 'X'].map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isMyAnswer = myCurrentAnswer === answer;

            return (
              <motion.button
                key={answer}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectAnswer(answer)}
                disabled={hasAnsweredCurrent || isSubmitting || timeLeft === 0}
                className={cn(
                  'p-8 rounded-2xl text-4xl font-bold transition-all',
                  isSelected || isMyAnswer
                    ? index === 0
                      ? 'bg-blue-500 text-white shadow-lg scale-105'
                      : 'bg-red-500 text-white shadow-lg scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300',
                  (hasAnsweredCurrent || timeLeft === 0) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {answer}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Multiple Choice */}
      {currentQuestion.type === 'multiple_choice' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isMyAnswer = myCurrentAnswer === index;
            const colorClass = OPTION_COLORS[index % OPTION_COLORS.length];

            return (
              <motion.button
                key={index}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectAnswer(index)}
                disabled={hasAnsweredCurrent || isSubmitting || timeLeft === 0}
                className={cn(
                  'p-4 rounded-xl text-left transition-all flex items-center gap-3',
                  isSelected || isMyAnswer
                    ? `${colorClass} text-white shadow-lg`
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300',
                  (hasAnsweredCurrent || timeLeft === 0) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <span className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold',
                  isSelected || isMyAnswer ? 'bg-white/20' : 'bg-gray-100'
                )}>
                  {OPTION_ICONS[index % OPTION_ICONS.length]}
                </span>
                <span className="font-medium">{option}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Error */}
      {responseError && (
        <p className="text-sm text-red-500 text-center">{responseError}</p>
      )}

      {/* Submit button */}
      {!hasAnsweredCurrent && (
        <Button
          onClick={handleSubmit}
          disabled={selectedAnswer === null || isSubmitting || timeLeft === 0}
          className="w-full py-6 text-lg font-bold rounded-xl"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              제출 중...
            </>
          ) : timeLeft === 0 ? (
            '시간 초과'
          ) : (
            '정답 제출'
          )}
        </Button>
      )}

      {/* Already answered */}
      {hasAnsweredCurrent && !isRevealed && (
        <div className="text-center py-4">
          <Check className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-gray-600">답변이 제출되었습니다</p>
          <p className="text-sm text-gray-400">정답 공개를 기다려주세요</p>
        </div>
      )}
    </div>
  );
}

export default QuizResponse;
