'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/hooks/useSupabase';
import { MBTI_QUESTIONS } from '@/app/personality-test/data/questions';
import { getPersonalityType } from '@/app/personality-test/data/personalities';
import { calculatePersonalityType, calculateDimensionScores } from '@/app/personality-test/utils/calculator';
import type { Answer, PersonalityCode } from '@/app/personality-test/types';
import { Users, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

export interface PersonalitySceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

interface ParticipantResult {
  participantId: string;
  participantName: string;
  code: PersonalityCode;
  timestamp: string;
}

interface AggregatedResults {
  [code: string]: number;
}

/**
 * PersonalityScene - 성격 테스트 Scene for audience-engage
 *
 * 호스트: 참여자 결과 집계 및 통계 표시
 * 참여자: 테스트 진행 및 결과 확인
 */
export function PersonalityScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: PersonalitySceneProps) {
  const supabase = useSupabase();

  // Host state
  const [results, setResults] = useState<ParticipantResult[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedResults>({});

  // Participant state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [myResult, setMyResult] = useState<PersonalityCode | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Subscribe to results (host)
  useEffect(() => {
    if (!isHost || !supabase || !sessionId) return;

    const channel = supabase
      .channel(`personality:${sessionId}`)
      .on('broadcast', { event: 'result' }, (payload: { payload: ParticipantResult }) => {
        setResults(prev => {
          const filtered = prev.filter(r => r.participantId !== payload.payload.participantId);
          return [...filtered, payload.payload];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isHost, supabase, sessionId]);

  // Calculate aggregated results
  useEffect(() => {
    const agg: AggregatedResults = {};
    results.forEach(r => {
      agg[r.code] = (agg[r.code] || 0) + 1;
    });
    setAggregated(agg);
  }, [results]);

  // Handle answer selection
  const handleAnswer = useCallback((direction: 'left' | 'right') => {
    const currentQuestion = MBTI_QUESTIONS[currentQuestionIndex];

    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      dimension: currentQuestion.dimension,
      direction,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex === MBTI_QUESTIONS.length - 1) {
      // Calculate and submit result
      const code = calculatePersonalityType(newAnswers);
      setMyResult(code);
      submitResult(code);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, answers]);

  // Submit result to host
  const submitResult = async (code: PersonalityCode) => {
    if (!supabase || !sessionId || hasSubmitted) return;

    const result: ParticipantResult = {
      participantId: participantId || 'anonymous',
      participantName: participantName || '익명',
      code,
      timestamp: new Date().toISOString(),
    };

    // Broadcast to host
    await supabase
      .channel(`personality:${sessionId}`)
      .send({
        type: 'broadcast',
        event: 'result',
        payload: result,
      });

    setHasSubmitted(true);
  };

  // Reset test
  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setMyResult(null);
    setHasSubmitted(false);
  };

  // Host View
  if (isHost) {
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">성격 테스트 결과</h3>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {results.length}명 완료
            </Badge>
          </div>

          {results.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <p className="text-4xl mb-4">🧠</p>
                <p className="text-muted-foreground">
                  참여자들이 테스트를 완료하면
                  <br />결과가 여기에 표시됩니다
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Types */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(aggregated)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([code, count]) => {
                    const type = getPersonalityType(code as PersonalityCode);
                    return (
                      <div key={code} className="bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{type?.emoji}</span>
                          <span className="font-bold">{code}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{type?.name}</p>
                        <p className="text-sm font-medium mt-1">{count}명 ({Math.round(count / results.length * 100)}%)</p>
                      </div>
                    );
                  })}
              </div>

              {/* Recent Results */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">최근 결과</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {results.slice(-5).reverse().map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-white/50 rounded px-2 py-1">
                      <span>{r.participantName}</span>
                      <Badge variant="secondary">{r.code}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Participant View - Result
  if (myResult) {
    const type = getPersonalityType(myResult);
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl mb-4">{type?.emoji}</p>
          <h3 className="text-2xl font-bold mb-1">{myResult}</h3>
          <p className="text-lg font-medium mb-2">{type?.name}</p>
          <p className="text-sm text-muted-foreground mb-4">{type?.shortDescription}</p>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            다시 테스트
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Participant View - Question
  const currentQuestion = MBTI_QUESTIONS[currentQuestionIndex];
  const progress = (currentQuestionIndex / MBTI_QUESTIONS.length) * 100;

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
      <CardContent className="flex-1 flex flex-col p-6">
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>질문 {currentQuestionIndex + 1}/{MBTI_QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-lg font-medium text-center px-4">
            {currentQuestion.text}
          </p>
        </div>

        {/* Answer Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 px-3 text-left flex-col items-start bg-white hover:bg-purple-50"
            onClick={() => handleAnswer('left')}
          >
            <ChevronLeft className="w-4 h-4 mb-1" />
            <span className="text-sm">{currentQuestion.optionLeft}</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 px-3 text-left flex-col items-start bg-white hover:bg-pink-50"
            onClick={() => handleAnswer('right')}
          >
            <ChevronRight className="w-4 h-4 mb-1" />
            <span className="text-sm">{currentQuestion.optionRight}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PersonalityScene;
