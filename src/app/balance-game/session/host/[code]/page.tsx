'use client';

/**
 * 밸런스 게임 호스트 대시보드
 * - 참여자들의 실시간 진행상황 확인
 * - 완료 후 답변 비교
 */

import { use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Users, RefreshCw, Copy, Check, QrCode,
  CheckCircle2, Clock, BarChart3
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useBalanceSession, type ParticipantState } from '../../../hooks/useBalanceSession';
import { RealtimeIndicator } from '@/components/common/RealtimeIndicator';
import { CopyableLink } from '@/components/common/CopyableLink';
import { questionTemplates } from '../../../data/templates';
import { categoryMetadata } from '../../../data/categories';
import type { Category, Question } from '../../../types';

interface PageProps {
  params: Promise<{ code: string }>;
}

// QR 코드 컴포넌트
function QRCodeCanvas({ value, size = 180 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 1,
      });
    }
  }, [value, size]);

  return <canvas ref={canvasRef} />;
}

export default function HostDashboardPage({ params }: PageProps) {
  const { code } = use(params);
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { session, isLoading, error, reload, closeSession } = useBalanceSession({
    sessionCode: code,
    isHost: true,
  });

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/balance-game/session/play/${code}`
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 질문 목록 가져오기
  const questions = useMemo(() => {
    if (!session) return [];
    const category = session.categoryId as Category;
    const allQuestions = questionTemplates[category] || [];
    return session.questionIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
  }, [session]);

  // 완료된 참여자 수
  const completedCount = useMemo(() => {
    return session?.participants.filter(p => p.completedAt).length || 0;
  }, [session?.participants]);

  // 답변 비교 통계
  const answerStats = useMemo(() => {
    if (!session || !questions.length) return null;

    const completedParticipants = session.participants.filter(p => p.completedAt);
    if (completedParticipants.length < 2) return null;

    return questions.map(q => {
      const answers = completedParticipants.map(p => ({
        name: p.name,
        choice: p.answers[q.id],
      }));
      const aCount = answers.filter(a => a.choice === 'A').length;
      const bCount = answers.filter(a => a.choice === 'B').length;

      return {
        question: q,
        answers,
        aCount,
        bCount,
        aPercent: Math.round((aCount / answers.length) * 100),
        bPercent: Math.round((bCount / answers.length) * 100),
      };
    });
  }, [session, questions]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || '세션을 찾을 수 없습니다.'}</p>
          <Button onClick={() => router.push('/balance-game')}>홈으로</Button>
        </div>
      </div>
    );
  }

  const categoryMeta = categoryMetadata[session.categoryId as Category];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/balance-game')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span>{categoryMeta?.emoji}</span>
                {session.hostName}의 밸런스 게임
              </h1>
              <p className="text-muted-foreground">{questions.length}개 질문</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RealtimeIndicator isConnected={true} />
            <Button variant="outline" onClick={reload}>
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {/* Session Info & QR */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* QR Code */}
              <div className="flex flex-col items-center p-4 bg-white rounded-lg border">
                <p className="text-sm text-muted-foreground mb-3">QR 코드로 참여</p>
                <QRCodeCanvas value={shareUrl} size={180} />
                <div className="mt-4 text-center">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    코드: {session.code}
                  </Badge>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">초대 링크 (클릭해서 복사)</p>
                  <CopyableLink url={shareUrl} className="w-full" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-3xl font-bold text-blue-700">{session.participants.length}</p>
                    <p className="text-sm text-blue-600">참여자</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-3xl font-bold text-green-700">{completedCount}</p>
                    <p className="text-sm text-green-600">완료</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              참여자 진행상황
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session.participants.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                아직 참여자가 없습니다. 링크를 공유해주세요!
              </p>
            ) : (
              <div className="space-y-4">
                {session.participants.map((participant) => {
                  const progress = (participant.currentQuestionIndex / questions.length) * 100;
                  const isComplete = !!participant.completedAt;

                  return (
                    <div key={participant.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold">
                        {participant.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{participant.name}</span>
                          {isComplete ? (
                            <Badge className="bg-green-500">완료</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {participant.currentQuestionIndex}/{questions.length}
                            </span>
                          )}
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Answer Comparison (when multiple completed) */}
        {answerStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                답변 비교
              </CardTitle>
              <CardDescription>완료한 참여자들의 답변을 비교해보세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {answerStats.map((stat, index) => (
                  <div key={stat.question.id} className="border rounded-lg p-4">
                    <div className="mb-3">
                      <span className="text-sm text-muted-foreground">질문 {index + 1}</span>
                      <h4 className="font-semibold">{stat.question.title}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className={`p-3 rounded-lg ${stat.aCount >= stat.bCount ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
                        <div className="text-sm text-muted-foreground">A</div>
                        <div className="font-semibold">{stat.question.optionA}</div>
                        <div className="text-2xl font-bold text-blue-600">{stat.aPercent}%</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.answers.filter(a => a.choice === 'A').map(a => a.name).join(', ') || '-'}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bCount > stat.aCount ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}>
                        <div className="text-sm text-muted-foreground">B</div>
                        <div className="font-semibold">{stat.question.optionB}</div>
                        <div className="text-2xl font-bold text-red-600">{stat.bPercent}%</div>
                        <div className="text-xs text-muted-foreground">
                          {stat.answers.filter(a => a.choice === 'B').map(a => a.name).join(', ') || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
