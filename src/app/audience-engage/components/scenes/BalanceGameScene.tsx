'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSupabase } from '@/hooks/useSupabase';
import { Users, ChevronRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BalanceGameSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

interface BalanceQuestion {
  id: string;
  title: string;
  optionA: string;
  optionB: string;
}

interface Vote {
  participantId: string;
  participantName: string;
  choice: 'A' | 'B';
}

// 기본 밸런스 게임 질문들
const DEFAULT_QUESTIONS: BalanceQuestion[] = [
  {
    id: 'q1',
    title: '여행 스타일',
    optionA: '계획 빠삭 여행',
    optionB: '무계획 자유 여행',
  },
  {
    id: 'q2',
    title: '아침 vs 저녁',
    optionA: '아침형 인간',
    optionB: '야행성 인간',
  },
  {
    id: 'q3',
    title: '음식 선택',
    optionA: '맵찔이',
    optionB: '맵부심',
  },
  {
    id: 'q4',
    title: '연락 스타일',
    optionA: '연락 자주 하는 편',
    optionB: '잠수 자주 타는 편',
  },
  {
    id: 'q5',
    title: '주말 보내기',
    optionA: '집에서 뒹굴뒹굴',
    optionB: '바깥에서 활동적으로',
  },
];

/**
 * BalanceGameScene - 밸런스 게임 Scene for audience-engage
 *
 * 호스트: 질문 선택 및 실시간 투표 현황 확인
 * 참여자: 선택지 투표
 */
export function BalanceGameScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: BalanceGameSceneProps) {
  const supabase = useSupabase();

  // Shared state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions] = useState<BalanceQuestion[]>(DEFAULT_QUESTIONS);
  const [votes, setVotes] = useState<Vote[]>([]);

  // Participant state
  const [myChoice, setMyChoice] = useState<'A' | 'B' | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Calculate vote stats
  const votesA = votes.filter(v => v.choice === 'A').length;
  const votesB = votes.filter(v => v.choice === 'B').length;
  const totalVotes = votesA + votesB;
  const percentA = totalVotes > 0 ? Math.round((votesA / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? Math.round((votesB / totalVotes) * 100) : 50;

  // Subscribe to votes
  useEffect(() => {
    if (!supabase || !sessionId) return;

    const channel = supabase
      .channel(`balance:${sessionId}`)
      .on('broadcast', { event: 'vote' }, (payload: { payload: Vote }) => {
        setVotes(prev => {
          const filtered = prev.filter(v => v.participantId !== payload.payload.participantId);
          return [...filtered, payload.payload];
        });
      })
      .on('broadcast', { event: 'next-question' }, (payload: { payload: { index: number } }) => {
        setCurrentQuestionIndex(payload.payload.index);
        setVotes([]);
        setMyChoice(null);
        setHasVoted(false);
      })
      .on('broadcast', { event: 'reset' }, () => {
        setCurrentQuestionIndex(0);
        setVotes([]);
        setMyChoice(null);
        setHasVoted(false);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sessionId]);

  // Handle vote
  const handleVote = async (choice: 'A' | 'B') => {
    if (!supabase || hasVoted) return;

    const vote: Vote = {
      participantId: participantId || 'anonymous',
      participantName: participantName || '익명',
      choice,
    };

    await supabase.channel(`balance:${sessionId}`).send({
      type: 'broadcast',
      event: 'vote',
      payload: vote,
    });

    setMyChoice(choice);
    setHasVoted(true);
  };

  // Host: Next question
  const handleNextQuestion = async () => {
    if (!supabase) return;

    const nextIndex = (currentQuestionIndex + 1) % questions.length;

    await supabase.channel(`balance:${sessionId}`).send({
      type: 'broadcast',
      event: 'next-question',
      payload: { index: nextIndex },
    });

    setCurrentQuestionIndex(nextIndex);
    setVotes([]);
  };

  // Host: Reset
  const handleReset = async () => {
    if (!supabase) return;

    await supabase.channel(`balance:${sessionId}`).send({
      type: 'broadcast',
      event: 'reset',
      payload: {},
    });

    setCurrentQuestionIndex(0);
    setVotes([]);
  };

  // Host View
  if (isHost) {
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-pink-50 to-rose-50">
        <CardContent className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">밸런스 게임</h3>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {totalVotes}명 투표
            </Badge>
          </div>

          {/* Question */}
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-2">
              Q{currentQuestionIndex + 1}/{questions.length}
            </Badge>
            <h4 className="text-xl font-bold">{currentQuestion.title}</h4>
          </div>

          {/* Options with Results */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <div
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  votesA > votesB
                    ? "border-pink-500 bg-pink-100"
                    : "border-pink-200 bg-white"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{currentQuestion.optionA}</span>
                  <span className="font-bold text-pink-600">{percentA}%</span>
                </div>
                <Progress value={percentA} className="h-3 bg-pink-100" />
                <p className="text-xs text-muted-foreground mt-1">{votesA}명</p>
              </div>
            </div>

            <div className="text-center text-muted-foreground font-medium">VS</div>

            <div className="relative">
              <div
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  votesB > votesA
                    ? "border-rose-500 bg-rose-100"
                    : "border-rose-200 bg-white"
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{currentQuestion.optionB}</span>
                  <span className="font-bold text-rose-600">{percentB}%</span>
                </div>
                <Progress value={percentB} className="h-3 bg-rose-100" />
                <p className="text-xs text-muted-foreground mt-1">{votesB}명</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button onClick={handleNextQuestion} className="flex-1">
              다음 질문
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Participant View
  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-pink-50 to-rose-50">
      <CardContent className="flex-1 flex flex-col p-6">
        {/* Question */}
        <div className="text-center mb-4">
          <Badge variant="secondary" className="mb-2">
            Q{currentQuestionIndex + 1}/{questions.length}
          </Badge>
          <h4 className="text-xl font-bold">{currentQuestion.title}</h4>
        </div>

        {/* Options */}
        <div className="flex-1 flex flex-col justify-center gap-4">
          <button
            onClick={() => handleVote('A')}
            disabled={hasVoted}
            className={cn(
              "p-6 rounded-xl border-3 transition-all text-center font-medium",
              hasVoted && myChoice === 'A'
                ? "border-pink-500 bg-pink-100 ring-2 ring-pink-500"
                : hasVoted
                ? "border-gray-200 bg-gray-50 opacity-50"
                : "border-pink-300 bg-white hover:border-pink-500 hover:bg-pink-50 active:scale-95"
            )}
          >
            <span className="text-lg">{currentQuestion.optionA}</span>
            {hasVoted && (
              <span className="block text-sm text-muted-foreground mt-2">
                {percentA}%
              </span>
            )}
          </button>

          <div className="text-center text-muted-foreground font-bold text-lg">VS</div>

          <button
            onClick={() => handleVote('B')}
            disabled={hasVoted}
            className={cn(
              "p-6 rounded-xl border-3 transition-all text-center font-medium",
              hasVoted && myChoice === 'B'
                ? "border-rose-500 bg-rose-100 ring-2 ring-rose-500"
                : hasVoted
                ? "border-gray-200 bg-gray-50 opacity-50"
                : "border-rose-300 bg-white hover:border-rose-500 hover:bg-rose-50 active:scale-95"
            )}
          >
            <span className="text-lg">{currentQuestion.optionB}</span>
            {hasVoted && (
              <span className="block text-sm text-muted-foreground mt-2">
                {percentB}%
              </span>
            )}
          </button>
        </div>

        {hasVoted && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            다음 질문을 기다리는 중...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default BalanceGameScene;
