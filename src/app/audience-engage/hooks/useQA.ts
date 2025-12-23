'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useAudienceEngageStore } from '../store/audienceEngageStore';
import type { Question } from '../types';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * useQA - Q&A 실시간 관리 훅
 *
 * - 질문 목록 로드 및 실시간 구독
 * - 질문 제출, 좋아요, 하이라이트, 답변완료, 삭제
 */

interface UseQAOptions {
  sessionId: string;
  participantId?: string;
  participantName?: string;
  enabled?: boolean;
}

interface QuestionRow {
  id: string;
  session_id: string;
  participant_id: string | null;
  author_name: string;
  body: string;
  like_count: number;
  is_highlighted: boolean;
  is_answered: boolean;
  created_at: string;
}

interface QuestionLikeRow {
  question_id: string;
  participant_id: string;
}

// Extended Question type with hasLiked for UI
export interface QuestionWithLikeStatus extends Question {
  hasLiked?: boolean;
}

export function useQA({
  sessionId,
  participantId,
  participantName = '익명',
  enabled = true,
}: UseQAOptions) {
  const supabase = useSupabase();
  const { questions, setQuestions, addQuestion, updateQuestion, removeQuestion } = useAudienceEngageStore();
  const [likedQuestionIds, setLikedQuestionIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // 질문 로드
  const loadQuestions = useCallback(async () => {
    if (!supabase || !sessionId) return;

    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to load questions:', error);
        return;
      }

      const loadedQuestions: Question[] = (data || []).map((row: QuestionRow) => ({
        id: row.id,
        sessionId: row.session_id,
        participantId: row.participant_id || undefined,
        authorName: row.author_name,
        body: row.body,
        likeCount: row.like_count,
        isHighlighted: row.is_highlighted,
        isAnswered: row.is_answered,
        createdAt: row.created_at,
      }));

      setQuestions(loadedQuestions);

      // 내가 좋아요한 질문 로드
      if (participantId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: likes } = await (supabase as any)
          .from('question_likes')
          .select('question_id')
          .eq('participant_id', participantId);

        if (likes) {
          setLikedQuestionIds(new Set(likes.map((l: QuestionLikeRow) => l.question_id)));
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, sessionId, participantId, setQuestions]);

  // 실시간 구독
  useEffect(() => {
    if (!enabled || !sessionId || !supabase) return;

    loadQuestions();

    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      channel = supabase
        .channel(`qa:${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'questions',
            filter: `session_id=eq.${sessionId}`,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (payload: any) => {
            if (payload.eventType === 'INSERT' && payload.new) {
              const row = payload.new as QuestionRow;
              const newQuestion: Question = {
                id: row.id,
                sessionId: row.session_id,
                participantId: row.participant_id || undefined,
                authorName: row.author_name,
                body: row.body,
                likeCount: row.like_count,
                isHighlighted: row.is_highlighted,
                isAnswered: row.is_answered,
                createdAt: row.created_at,
              };
              addQuestion(newQuestion);
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              const row = payload.new as QuestionRow;
              updateQuestion(row.id, {
                likeCount: row.like_count,
                isHighlighted: row.is_highlighted,
                isAnswered: row.is_answered,
              });
            } else if (payload.eventType === 'DELETE' && payload.old) {
              const oldRow = payload.old as { id: string };
              removeQuestion(oldRow.id);
            }
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [enabled, sessionId, supabase, loadQuestions, addQuestion, updateQuestion, removeQuestion]);

  // 질문 제출
  const submitQuestion = useCallback(
    async (body: string) => {
      if (!supabase || !sessionId) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('questions').insert({
        session_id: sessionId,
        participant_id: participantId || null,
        author_name: participantName,
        body,
      });

      if (error) {
        console.error('Failed to submit question:', error);
      }
    },
    [supabase, sessionId, participantId, participantName]
  );

  // 좋아요 토글
  const toggleLike = useCallback(
    async (questionId: string) => {
      if (!supabase || !participantId) return;

      const hasLiked = likedQuestionIds.has(questionId);

      if (hasLiked) {
        // 좋아요 취소
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('question_likes')
          .delete()
          .eq('question_id', questionId)
          .eq('participant_id', participantId);

        setLikedQuestionIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });

        // 좋아요 수 감소
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc('decrement_like_count', { q_id: questionId });
      } else {
        // 좋아요 추가
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('question_likes').insert({
          question_id: questionId,
          participant_id: participantId,
        });

        setLikedQuestionIds((prev) => new Set(prev).add(questionId));

        // 좋아요 수 증가
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).rpc('increment_like_count', { q_id: questionId });
      }
    },
    [supabase, participantId, likedQuestionIds]
  );

  // 하이라이트 토글 (호스트)
  const toggleHighlight = useCallback(
    async (questionId: string, highlighted: boolean) => {
      if (!supabase) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('questions')
        .update({ is_highlighted: highlighted })
        .eq('id', questionId);
    },
    [supabase]
  );

  // 답변완료 토글 (호스트)
  const toggleAnswered = useCallback(
    async (questionId: string, answered: boolean) => {
      if (!supabase) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('questions')
        .update({ is_answered: answered })
        .eq('id', questionId);
    },
    [supabase]
  );

  // 질문 삭제 (호스트)
  const deleteQuestion = useCallback(
    async (questionId: string) => {
      if (!supabase) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('questions').delete().eq('id', questionId);
    },
    [supabase]
  );

  // 질문에 hasLiked 정보 추가
  const questionsWithLikeStatus: QuestionWithLikeStatus[] = questions.map((q) => ({
    ...q,
    hasLiked: likedQuestionIds.has(q.id),
  }));

  return {
    questions: questionsWithLikeStatus,
    isLoading,
    submitQuestion,
    toggleLike,
    toggleHighlight,
    toggleAnswered,
    deleteQuestion,
  };
}

export default useQA;
