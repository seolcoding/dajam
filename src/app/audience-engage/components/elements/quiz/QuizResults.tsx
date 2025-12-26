'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Users,
  CheckCircle,
  XCircle,
  Play,
  Eye,
  SkipForward,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import type { SessionElement, ElementResponse } from '@/types/database';
import type {
  QuizElementConfig,
  QuizElementState,
  QuizResponseData,
  QuizLeaderboardEntry,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface QuizResultsProps {
  element: SessionElement;
  sessionId: string;
  /** 컨트롤 버튼 표시 */
  showControls?: boolean;
  /** 리더보드 최대 표시 수 */
  maxLeaderboard?: number;
  className?: string;
}

// ============================================
// Medal Colors
// ============================================

const MEDAL_STYLES = [
  { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🥇' },
  { bg: 'bg-gray-100', text: 'text-gray-600', icon: '🥈' },
  { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🥉' },
];

// ============================================
// Component
// ============================================

export function QuizResults({
  element,
  sessionId,
  showControls = true,
  maxLeaderboard = 10,
  className,
}: QuizResultsProps) {
  const config = element.config as unknown as QuizElementConfig;
  const state = (element.state || {}) as unknown as QuizElementState;

  const currentQuestionIndex = state.currentQuestionIndex ?? 0;
  const currentQuestion = config.questions[currentQuestionIndex];
  const isQuestionActive = state.isQuestionActive ?? false;
  const isRevealed = state.isRevealed ?? false;

  // 응답 훅
  const { responses, isLoading } = useElementResponses({
    elementId: element.id,
    sessionId,
  });

  // Element 상태 업데이트용
  const { updateElementState } = useSessionElements({
    sessionId,
  });

  // ============================================
  // Computed Data
  // ============================================

  // 현재 문제 응답 통계
  const currentQuestionStats = useMemo(() => {
    if (!currentQuestion) return { total: 0, correct: 0, incorrect: 0 };

    const questionResponses = responses.filter((r) => {
      const data = r.data as unknown as QuizResponseData;
      return data.questionId === currentQuestion.id;
    });

    const correct = questionResponses.filter((r) => r.is_correct).length;
    const incorrect = questionResponses.length - correct;

    return {
      total: questionResponses.length,
      correct,
      incorrect,
    };
  }, [responses, currentQuestion]);

  // 리더보드 계산
  const leaderboard = useMemo((): QuizLeaderboardEntry[] => {
    // 참여자별 점수 집계
    const scoreMap = new Map<string, {
      displayName: string;
      score: number;
      correctCount: number;
      totalResponseTime: number;
      responseCount: number;
    }>();

    responses.forEach((r) => {
      const key = r.participant_id || r.user_id || r.anonymous_id || r.id;
      const existing = scoreMap.get(key);
      const data = r.data as unknown as QuizResponseData;

      if (existing) {
        existing.score += r.score || 0;
        existing.correctCount += r.is_correct ? 1 : 0;
        existing.totalResponseTime += data.answeredAt || 0;
        existing.responseCount += 1;
      } else {
        scoreMap.set(key, {
          displayName: r.display_name || `참여자 ${scoreMap.size + 1}`,
          score: r.score || 0,
          correctCount: r.is_correct ? 1 : 0,
          totalResponseTime: data.answeredAt || 0,
          responseCount: 1,
        });
      }
    });

    return Array.from(scoreMap.entries())
      .map(([participantId, data]) => ({
        participantId,
        displayName: data.displayName,
        score: data.score,
        correctCount: data.correctCount,
        averageResponseTime: data.responseCount > 0
          ? data.totalResponseTime / data.responseCount
          : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxLeaderboard);
  }, [responses, maxLeaderboard]);

  // ============================================
  // Handlers
  // ============================================

  const handleStartQuestion = async () => {
    await updateElementState(element.id, {
      ...state,
      isQuestionActive: true,
      isRevealed: false,
      questionStartedAt: new Date().toISOString(),
    });
  };

  const handleRevealAnswer = async () => {
    await updateElementState(element.id, {
      ...state,
      isQuestionActive: false,
      isRevealed: true,
    });
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= config.questions.length) {
      // 퀴즈 종료
      await updateElementState(element.id, {
        ...state,
        isQuestionActive: false,
        isRevealed: false,
        currentQuestionIndex: config.questions.length,
      });
    } else {
      await updateElementState(element.id, {
        ...state,
        currentQuestionIndex: nextIndex,
        isQuestionActive: false,
        isRevealed: false,
        questionStartedAt: undefined,
      });
    }
  };

  const handleResetQuiz = async () => {
    await updateElementState(element.id, {
      currentQuestionIndex: 0,
      isQuestionActive: false,
      isRevealed: false,
      questionStartedAt: undefined,
      completedParticipants: 0,
    });
  };

  // ============================================
  // Render: 퀴즈 완료
  // ============================================

  if (currentQuestionIndex >= config.questions.length) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h3 className="text-2xl font-bold mb-2">퀴즈 완료!</h3>
          <p className="text-gray-500">
            총 {config.questions.length}문제 | {responses.length}개 응답
          </p>
        </div>

        {/* Final Leaderboard */}
        <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl p-6">
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            최종 순위
          </h4>

          <div className="space-y-2">
            {leaderboard.map((entry, index) => {
              const medalStyle = index < 3 ? MEDAL_STYLES[index] : null;

              return (
                <motion.div
                  key={entry.participantId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl',
                    medalStyle?.bg || 'bg-gray-50'
                  )}
                >
                  <div className="w-8 text-center font-bold">
                    {medalStyle ? (
                      <span className="text-xl">{medalStyle.icon}</span>
                    ) : (
                      <span className="text-gray-500">{index + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={cn('font-medium', medalStyle?.text)}>
                      {entry.displayName}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      {entry.correctCount}문제 정답
                    </span>
                  </div>
                  <div className={cn('font-bold text-lg', medalStyle?.text || 'text-gray-700')}>
                    {entry.score}점
                  </div>
                </motion.div>
              );
            })}
          </div>

          {leaderboard.length === 0 && (
            <p className="text-center text-gray-500 py-4">아직 참여자가 없습니다</p>
          )}
        </div>

        {showControls && (
          <Button onClick={handleResetQuiz} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            퀴즈 다시 시작
          </Button>
        )}
      </div>
    );
  }

  // ============================================
  // Render: 문제 진행 중
  // ============================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">
            문제 {currentQuestionIndex + 1} / {config.questions.length}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {currentQuestion?.text}
          </p>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span>{currentQuestionStats.total}명 응답</span>
        </div>
      </div>

      {/* Question Status */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {currentQuestionStats.total}
          </div>
          <div className="text-sm text-blue-700">참여</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {currentQuestionStats.correct}
          </div>
          <div className="text-sm text-emerald-700">정답</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {currentQuestionStats.incorrect}
          </div>
          <div className="text-sm text-red-700">오답</div>
        </div>
      </div>

      {/* Correct Answer (when revealed) */}
      {isRevealed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-100 border-2 border-emerald-300 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-emerald-700 font-medium mb-2">
            <CheckCircle className="w-5 h-5" />
            정답
          </div>
          <p className="text-lg font-bold text-emerald-800">
            {typeof currentQuestion.correctAnswer === 'number'
              ? currentQuestion.options?.[currentQuestion.correctAnswer]
              : currentQuestion.correctAnswer}
          </p>
          {currentQuestion.explanation && (
            <p className="text-sm text-emerald-600 mt-2">
              {currentQuestion.explanation}
            </p>
          )}
        </motion.div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="flex gap-3">
          {!isQuestionActive && !isRevealed && (
            <Button onClick={handleStartQuestion} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              문제 시작
            </Button>
          )}

          {isQuestionActive && !isRevealed && (
            <Button onClick={handleRevealAnswer} className="flex-1" variant="secondary">
              <Eye className="w-4 h-4 mr-2" />
              정답 공개
            </Button>
          )}

          {isRevealed && (
            <Button onClick={handleNextQuestion} className="flex-1">
              <SkipForward className="w-4 h-4 mr-2" />
              {currentQuestionIndex + 1 >= config.questions.length
                ? '결과 보기'
                : '다음 문제'}
            </Button>
          )}
        </div>
      )}

      {/* Mini Leaderboard */}
      {config.showLeaderboard && leaderboard.length > 0 && (
        <div className="border rounded-xl p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Medal className="w-4 h-4" />
            현재 순위
          </h4>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((entry, index) => (
              <div
                key={entry.participantId}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 text-center font-medium text-gray-500">
                    {index + 1}
                  </span>
                  <span>{entry.displayName}</span>
                </div>
                <span className="font-bold">{entry.score}점</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizResults;
