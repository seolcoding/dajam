'use client';

/**
 * 밸런스 게임 참여자 플레이 페이지
 */

import { use, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle2, ArrowRight, Home, Trophy } from 'lucide-react';
import { useBalanceSession } from '../../../hooks/useBalanceSession';
import { questionTemplates } from '../../../data/templates';
import { categoryMetadata } from '../../../data/categories';
import type { Category, Question } from '../../../types';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function PlayPage({ params }: PageProps) {
  const { code } = use(params);
  const router = useRouter();

  const {
    session,
    isLoading,
    error,
    myParticipant,
    joinSession,
    submitAnswer,
  } = useBalanceSession({ sessionCode: code });

  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 질문 목록
  const questions = useMemo(() => {
    if (!session) return [];
    const category = session.categoryId as Category;
    const allQuestions = questionTemplates[category] || [];
    return session.questionIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
  }, [session]);

  // 현재 질문
  const currentQuestion = useMemo(() => {
    if (!myParticipant || !questions.length) return null;
    return questions[myParticipant.currentQuestionIndex];
  }, [myParticipant, questions]);

  const handleJoin = async () => {
    if (!name.trim()) return;
    setIsJoining(true);
    await joinSession(name.trim());
    setIsJoining(false);
  };

  const handleSelect = async (choice: 'A' | 'B') => {
    if (!currentQuestion || !myParticipant || isSubmitting) return;

    setIsSubmitting(true);

    const nextIndex = myParticipant.currentQuestionIndex + 1;
    const isComplete = nextIndex >= questions.length;

    await submitAnswer(currentQuestion.id, choice, nextIndex, isComplete);

    setIsSubmitting(false);
  };

  // 로딩
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 에러
  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || '세션을 찾을 수 없습니다.'}</p>
          <Button onClick={() => router.push('/balance-game')}>홈으로</Button>
        </div>
      </div>
    );
  }

  const categoryMeta = categoryMetadata[session.categoryId as Category];

  // 참여 전: 이름 입력
  if (!myParticipant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">{categoryMeta?.emoji}</div>
            <CardTitle className="text-2xl">{session.hostName}의 밸런스 게임</CardTitle>
            <p className="text-muted-foreground">{questions.length}개 질문에 답해보세요</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            <Button
              onClick={handleJoin}
              disabled={!name.trim() || isJoining}
              className="w-full"
              size="lg"
            >
              {isJoining ? '참여 중...' : '참여하기'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 완료: 결과 화면
  if (myParticipant.completedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">완료!</h2>
            <p className="text-muted-foreground mb-6">
              {questions.length}개 질문에 모두 답했습니다
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-2">나의 답변</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {questions.map((q, idx) => (
                  <Badge
                    key={q.id}
                    variant={myParticipant.answers[q.id] === 'A' ? 'default' : 'secondary'}
                    className={myParticipant.answers[q.id] === 'A' ? 'bg-blue-500' : 'bg-red-500 text-white'}
                  >
                    Q{idx + 1}: {myParticipant.answers[q.id]}
                  </Badge>
                ))}
              </div>
            </div>

            <Button onClick={() => router.push('/balance-game')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 플레이 중
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">질문을 불러오는 중...</p>
      </div>
    );
  }

  const progress = ((myParticipant.currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {session.hostName}의 밸런스 게임
            </span>
            <Badge variant="outline">
              {myParticipant.currentQuestionIndex + 1} / {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            {currentQuestion.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A */}
            <button
              onClick={() => handleSelect('A')}
              disabled={isSubmitting}
              className={`
                p-8 rounded-2xl border-4 transition-all duration-200
                bg-gradient-to-br from-blue-50 to-blue-100
                border-blue-200 hover:border-blue-400 hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                flex flex-col items-center justify-center min-h-[200px]
              `}
            >
              <span className="text-6xl mb-4">🅰️</span>
              <span className="text-xl font-bold text-blue-800">
                {currentQuestion.optionA}
              </span>
            </button>

            {/* Option B */}
            <button
              onClick={() => handleSelect('B')}
              disabled={isSubmitting}
              className={`
                p-8 rounded-2xl border-4 transition-all duration-200
                bg-gradient-to-br from-red-50 to-red-100
                border-red-200 hover:border-red-400 hover:shadow-lg
                disabled:opacity-50 disabled:cursor-not-allowed
                flex flex-col items-center justify-center min-h-[200px]
              `}
            >
              <span className="text-6xl mb-4">🅱️</span>
              <span className="text-xl font-bold text-red-800">
                {currentQuestion.optionB}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
