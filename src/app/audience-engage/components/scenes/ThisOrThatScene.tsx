'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThisOrThatHost, ThisOrThatParticipant } from '@/features/interactions';
import { useSupabase } from '@/hooks/useSupabase';
import type { ThisOrThatQuestion, QuestionStatus, VoteCount } from '@/features/interactions';

export interface ThisOrThatSceneProps {
  sessionId: string;
  sessionCode: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
  participants?: Array<{ id: string; display_name: string }>;
}

interface ThisOrThatState {
  questions: ThisOrThatQuestion[];
  currentQuestionIndex: number;
  status: QuestionStatus;
  voteCount: VoteCount;
}

/**
 * ThisOrThatScene - This or That wrapper for audience-engage
 */
export function ThisOrThatScene({
  sessionId,
  sessionCode,
  isHost,
  participantId,
  participantName,
  participants = [],
}: ThisOrThatSceneProps) {
  const supabase = useSupabase();
  const [state, setState] = useState<ThisOrThatState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/audience-engage?code=${sessionCode}`
    : '';

  // Load session state
  useEffect(() => {
    if (!supabase || !sessionId) return;

    const loadState = async () => {
      setIsLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('this_or_that_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error) {
          console.error('Failed to load this-or-that state:', error);
          return;
        }

        if (data) {
          setState({
            questions: data.questions || [],
            currentQuestionIndex: data.current_question_index || 0,
            status: data.status || 'waiting',
            voteCount: { A: 0, B: 0 },
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadState();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`this-or-that:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'this_or_that_sessions',
          filter: `session_id=eq.${sessionId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.new) {
            const data = payload.new;
            setState((prev) => ({
              ...prev!,
              currentQuestionIndex: data.current_question_index || 0,
              status: data.status || 'waiting',
            }));
            // Reset vote state on new question
            if (data.current_question_index !== state?.currentQuestionIndex) {
              setHasVoted(false);
              setSelectedOption(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sessionId]);

  // Handle vote (participant)
  const handleVote = useCallback(
    async (option: 'A' | 'B') => {
      if (!supabase || !participantId || hasVoted) return;

      setSelectedOption(option);
      setHasVoted(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('this_or_that_votes').insert({
        session_id: sessionId,
        participant_id: participantId,
        question_index: state?.currentQuestionIndex,
        vote: option,
      });
    },
    [supabase, sessionId, participantId, state?.currentQuestionIndex, hasVoted]
  );

  // Host controls
  const handleStartVoting = useCallback(async () => {
    if (!supabase || !isHost) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('this_or_that_sessions')
      .update({ status: 'voting' })
      .eq('session_id', sessionId);
  }, [supabase, sessionId, isHost]);

  const handleShowResult = useCallback(async () => {
    if (!supabase || !isHost) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('this_or_that_sessions')
      .update({ status: 'result' })
      .eq('session_id', sessionId);
  }, [supabase, sessionId, isHost]);

  const handleNextQuestion = useCallback(async () => {
    if (!supabase || !isHost || !state) return;
    const nextIndex = state.currentQuestionIndex + 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('this_or_that_sessions')
      .update({
        current_question_index: nextIndex,
        status: 'waiting',
      })
      .eq('session_id', sessionId);
  }, [supabase, sessionId, isHost, state]);

  const handleEndSession = useCallback(async () => {
    if (!supabase || !isHost) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('this_or_that_sessions')
      .update({ status: 'ended' })
      .eq('session_id', sessionId);
  }, [supabase, sessionId, isHost]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  // No data
  if (!state || state.questions.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <CardContent className="text-center">
          <p className="text-4xl mb-4">⚖️</p>
          <p className="text-xl font-semibold mb-2">This or That</p>
          <p className="text-muted-foreground mb-4">
            {isHost ? '질문을 추가하세요' : '질문이 시작되면 참여할 수 있습니다'}
          </p>
          {isHost && (
            <Button variant="outline">질문 추가</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = state.questions[state.currentQuestionIndex];

  // Host view
  if (isHost) {
    return (
      <ThisOrThatHost
        sessionCode={sessionCode}
        shareUrl={shareUrl}
        currentQuestion={currentQuestion}
        questionNumber={state.currentQuestionIndex + 1}
        totalQuestions={state.questions.length}
        participants={participants}
        voteCount={state.voteCount}
        status={state.status}
        onStartVoting={handleStartVoting}
        onShowResult={handleShowResult}
        onNextQuestion={handleNextQuestion}
        onEndSession={handleEndSession}
      />
    );
  }

  // Participant view
  return (
    <ThisOrThatParticipant
      sessionCode={sessionCode}
      currentQuestion={currentQuestion}
      questionNumber={state.currentQuestionIndex + 1}
      totalQuestions={state.questions.length}
      status={state.status}
      hasVoted={hasVoted}
      onVote={handleVote}
    />
  );
}

export default ThisOrThatScene;
