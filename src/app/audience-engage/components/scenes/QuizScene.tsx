'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import { QuizResponse } from '../elements/quiz/QuizResponse';
import { QuizResults } from '../elements/quiz/QuizResults';
import type { SessionElement } from '@/types/database';

export interface QuizSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

/**
 * QuizScene - V2 Quiz Element를 사용하는 퀴즈 씬
 *
 * Phase 4 V2 아키텍처 통합:
 * - session_elements 테이블의 quiz 타입 element 사용
 * - element_responses 테이블로 답변 저장
 * - element_aggregates 테이블로 점수/순위 집계
 */
export function QuizScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: QuizSceneProps) {
  // V2 Element 훅 사용
  const {
    elements,
    activeElement,
    isLoading,
    createElement,
  } = useSessionElements({
    sessionId,
  });

  // quiz 타입 element 찾기
  const quizElement = activeElement?.element_type === 'quiz'
    ? activeElement
    : elements.find((e) => e.element_type === 'quiz');

  // 새 퀴즈 생성 (호스트)
  const handleCreateQuiz = async () => {
    await createElement({
      session_id: sessionId,
      element_type: 'quiz',
      title: '새 퀴즈',
      config: {
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            text: '첫 번째 문제입니다',
            options: ['보기 1', '보기 2', '보기 3', '보기 4'],
            correctAnswer: 0,
            points: 100,
            timeLimit: 30,
          },
        ],
        shuffleQuestions: false,
        shuffleOptions: false,
        showCorrectAnswer: true,
        showLeaderboard: true,
        speedBonus: true,
      },
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">퀴즈 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  // Quiz element가 없는 경우
  if (!quizElement) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-dajaem-green/10 to-dajaem-yellow/10">
        <CardContent className="text-center">
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-xl font-semibold mb-2">실시간 퀴즈</p>
          <p className="text-muted-foreground mb-4">
            {isHost ? '퀴즈를 만들어 시작하세요' : '퀴즈가 시작되면 참여할 수 있습니다'}
          </p>
          {isHost && (
            <Button
              onClick={handleCreateQuiz}
              className="bg-dajaem-green hover:bg-dajaem-green/90 text-white"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              퀴즈 만들기
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // 호스트: 결과/컨트롤 뷰
  if (isHost) {
    return (
      <div className="h-full flex flex-col p-4 bg-gradient-to-br from-dajaem-green/10 to-dajaem-yellow/10">
        <QuizResults
          element={quizElement}
          sessionId={sessionId}
          showControls={true}
          className="flex-1"
        />
      </div>
    );
  }

  // 참여자: 퀴즈 풀이 뷰
  return (
    <div className="h-full flex flex-col p-4 bg-gradient-to-br from-dajaem-green/10 to-dajaem-yellow/10">
      <QuizResponse
        element={quizElement}
        sessionId={sessionId}
        participantId={participantId}
        displayName={participantName}
        className="flex-1"
      />
    </div>
  );
}

export default QuizScene;
