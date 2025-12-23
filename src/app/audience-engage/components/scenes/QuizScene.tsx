'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizHost, QuizParticipant } from '@/features/interactions';
import { useSupabase } from '@/hooks/useSupabase';
import type { QuizQuestion, GameState, ParticipantAnswer } from '@/features/interactions';

export interface QuizSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

interface QuizSessionState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  gameState: GameState;
  showAnswer: boolean;
  timeLeft: number;
  answers: ParticipantAnswer[];
}

/**
 * QuizScene - Quiz wrapper for audience-engage
 * Manages quiz state and renders appropriate view (host/participant)
 */
export function QuizScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: QuizSceneProps) {
  const supabase = useSupabase();
  const [quizState, setQuizState] = useState<QuizSessionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Load quiz session state
  useEffect(() => {
    if (!supabase || !sessionId) return;

    const loadQuizState = async () => {
      setIsLoading(true);
      try {
        // Load from quiz_sessions table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('quiz_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error) {
          console.error('Failed to load quiz state:', error);
          return;
        }

        if (data) {
          setQuizState({
            questions: data.questions || [],
            currentQuestionIndex: data.current_question_index || 0,
            gameState: data.game_state || 'waiting',
            showAnswer: data.show_answer || false,
            timeLeft: data.time_left || 30,
            answers: [],
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizState();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`quiz:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions',
          filter: `session_id=eq.${sessionId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.new) {
            const data = payload.new;
            setQuizState((prev) => ({
              ...prev!,
              currentQuestionIndex: data.current_question_index || 0,
              gameState: data.game_state || 'waiting',
              showAnswer: data.show_answer || false,
              timeLeft: data.time_left || 30,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sessionId]);

  // Handle answer submission (participant)
  const handleSubmitAnswer = useCallback(
    async (answerIndex: number) => {
      if (!supabase || !participantId || hasAnswered) return;

      setSelectedAnswer(answerIndex);
      setHasAnswered(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('quiz_answers').insert({
        session_id: sessionId,
        participant_id: participantId,
        question_index: quizState?.currentQuestionIndex,
        answer_index: answerIndex,
        answered_at: new Date().toISOString(),
      });
    },
    [supabase, sessionId, participantId, quizState?.currentQuestionIndex, hasAnswered]
  );

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">퀴즈 로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  // No quiz data
  if (!quizState || quizState.questions.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="text-center">
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-xl font-semibold mb-2">퀴즈</p>
          <p className="text-muted-foreground mb-4">
            {isHost ? '퀴즈를 설정하세요' : '퀴즈가 시작되면 참여할 수 있습니다'}
          </p>
          {isHost && (
            <Button variant="outline">퀴즈 만들기</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

  // Host view
  if (isHost) {
    return (
      <QuizHost
        question={currentQuestion}
        questionNumber={quizState.currentQuestionIndex + 1}
        totalQuestions={quizState.questions.length}
        timeLeft={quizState.timeLeft}
        answeredCount={quizState.answers.length}
        totalParticipants={10} // TODO: Get from session
        showAnswer={quizState.showAnswer}
      />
    );
  }

  // Participant view
  return (
    <QuizParticipant
      question={currentQuestion}
      questionNumber={quizState.currentQuestionIndex + 1}
      totalQuestions={quizState.questions.length}
      timeLeft={quizState.timeLeft}
      hasAnswered={hasAnswered}
      onAnswer={handleSubmitAnswer}
      isCorrect={quizState.showAnswer ? currentQuestion.correctIndex === selectedAnswer : undefined}
      correctAnswer={quizState.showAnswer ? currentQuestion.correctIndex : undefined}
    />
  );
}

export default QuizScene;
