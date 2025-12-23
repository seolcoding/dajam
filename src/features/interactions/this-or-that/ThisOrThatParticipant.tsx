'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import type { ThisOrThatQuestion, QuestionStatus } from './types';

export interface ThisOrThatParticipantProps {
  sessionCode: string;
  currentQuestion: ThisOrThatQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  hasVoted: boolean;
  onVote: (choice: 'A' | 'B') => void;
  status: QuestionStatus;
  timeRemaining?: number;
}

/**
 * This or That 참가자 뷰 컴포넌트
 * - 모바일 최적화된 투표 UI
 * - 대기/투표/완료 상태 표시
 * - audience-engage와 독립 앱에서 공유
 */
export function ThisOrThatParticipant({
  sessionCode,
  currentQuestion,
  questionNumber,
  totalQuestions,
  hasVoted,
  onVote,
  status,
  timeRemaining,
}: ThisOrThatParticipantProps) {
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (choice: 'A' | 'B') => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);

    // 햅틱 피드백 (모바일)
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    await onVote(choice);
    setIsVoting(false);
  };

  // 대기 중
  if (status === 'waiting' || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">대기 중...</h2>
            <p className="text-muted-foreground mb-4">
              호스트가 곧 질문을 시작합니다
            </p>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {sessionCode}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 투표 완료
  if (hasVoted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">투표 완료!</h2>
            <p className="text-muted-foreground mb-4">
              다음 질문을 기다려주세요
            </p>
            <div className="text-sm text-muted-foreground">
              {questionNumber} / {totalQuestions}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 투표 화면 - 모바일 세로 모드 최적화
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header - 최소화 */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{sessionCode}</Badge>
            <span className="text-sm text-muted-foreground">
              {questionNumber}/{totalQuestions}
            </span>
          </div>
          {timeRemaining !== undefined && (
            <div className="flex items-center gap-2 text-orange-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{timeRemaining}초</span>
            </div>
          )}
        </div>
      </div>

      {/* Question - 작게 */}
      <div className="flex-shrink-0 px-4 py-4 bg-gray-50">
        <h2 className="text-lg font-bold text-center">
          {currentQuestion.text}
        </h2>
      </div>

      {/* Voting Buttons - 화면의 대부분 차지 (50% 이상) */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-2">
        {/* Option A - 왼쪽 */}
        <button
          onClick={() => handleVote('A')}
          disabled={isVoting}
          className="
            relative overflow-hidden
            rounded-xl
            bg-gradient-to-br from-blue-400 to-blue-600
            hover:from-blue-500 hover:to-blue-700
            active:scale-95
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg hover:shadow-xl
            flex flex-col items-center justify-center
            text-white
          "
          style={{ minHeight: '40vh' }}
        >
          <div className="text-7xl mb-4">🅰️</div>
          <div className="text-3xl font-bold text-center px-4 leading-tight">
            {currentQuestion.optionA}
          </div>
          <div className="absolute top-4 left-4 text-6xl font-black opacity-20">
            A
          </div>
        </button>

        {/* Option B - 오른쪽 */}
        <button
          onClick={() => handleVote('B')}
          disabled={isVoting}
          className="
            relative overflow-hidden
            rounded-xl
            bg-gradient-to-br from-pink-400 to-pink-600
            hover:from-pink-500 hover:to-pink-700
            active:scale-95
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-lg hover:shadow-xl
            flex flex-col items-center justify-center
            text-white
          "
          style={{ minHeight: '40vh' }}
        >
          <div className="text-7xl mb-4">🅱️</div>
          <div className="text-3xl font-bold text-center px-4 leading-tight">
            {currentQuestion.optionB}
          </div>
          <div className="absolute top-4 right-4 text-6xl font-black opacity-20">
            B
          </div>
        </button>
      </div>

      {/* Footer hint - 최소화 */}
      <div className="flex-shrink-0 px-4 py-3 text-center text-xs text-muted-foreground bg-gray-50">
        선택지를 눌러 투표하세요
      </div>
    </div>
  );
}

export default ThisOrThatParticipant;
