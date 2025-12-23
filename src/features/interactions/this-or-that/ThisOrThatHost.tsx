'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Play,
  SkipForward,
  BarChart3,
  QrCode as QrCodeIcon,
  X,
} from 'lucide-react';
import QRCode from 'qrcode';
import type { ThisOrThatQuestion, VoteCount, QuestionStatus } from './types';

export interface ThisOrThatHostProps {
  sessionCode: string;
  shareUrl: string;
  currentQuestion: ThisOrThatQuestion | null;
  questionNumber: number;
  totalQuestions: number;
  participants: Array<{ id: string; display_name: string }>;
  voteCount: VoteCount;
  status: QuestionStatus;
  onStartVoting: () => void;
  onShowResult: () => void;
  onNextQuestion: () => void;
  onEndSession: () => void;
}

/**
 * This or That 호스트 뷰 컴포넌트
 * - QR 코드 및 세션 코드 표시
 * - 질문과 선택지 표시
 * - 실시간 투표 현황
 * - audience-engage와 독립 앱에서 공유
 */
export function ThisOrThatHost({
  sessionCode,
  shareUrl,
  currentQuestion,
  questionNumber,
  totalQuestions,
  participants,
  voteCount,
  status,
  onStartVoting,
  onShowResult,
  onNextQuestion,
  onEndSession,
}: ThisOrThatHostProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // QR 코드 생성
  useEffect(() => {
    if (canvasRef.current && shareUrl) {
      QRCode.toCanvas(canvasRef.current, shareUrl, {
        width: 200,
        margin: 2,
      });
    }
  }, [shareUrl]);

  const totalVotes = voteCount.A + voteCount.B;
  const percentA = totalVotes > 0 ? Math.round((voteCount.A / totalVotes) * 100) : 0;
  const percentB = totalVotes > 0 ? Math.round((voteCount.B / totalVotes) * 100) : 0;
  const votedCount = totalVotes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header - Session Info & QR */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">This or That</h1>
                <p className="text-slate-300 text-lg mt-1">
                  실시간 그룹 투표
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={onEndSession}
                size="lg"
              >
                <X className="w-5 h-5 mr-2" />
                세션 종료
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-2xl px-6 py-3">
                코드: {sessionCode}
              </Badge>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-6 h-6" />
                <span className="text-xl font-semibold">{participants.length}명</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <BarChart3 className="w-6 h-6" />
                <span className="text-xl font-semibold">{votedCount}표</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <Card className="bg-white">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <QrCodeIcon className="w-6 h-6 text-slate-600" />
                <canvas ref={canvasRef} />
                <p className="text-sm text-slate-600 font-medium">
                  QR 스캔으로 참여
                </p>
                <p className="text-xs text-slate-500 break-all">
                  {shareUrl}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {totalQuestions > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">진행 상황</span>
              <span className="text-slate-300 font-medium">
                {questionNumber} / {totalQuestions}
              </span>
            </div>
            <Progress
              value={(questionNumber / totalQuestions) * 100}
              className="h-3 bg-slate-700"
            />
          </div>
        )}

        {/* Main Content */}
        {currentQuestion ? (
          <div className="space-y-6">
            {/* Question */}
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="text-sm text-slate-400 mb-2">질문 {questionNumber}</div>
                <h2 className="text-5xl font-bold mb-4">{currentQuestion.text}</h2>
                <div className="text-slate-400">
                  {status === 'waiting' && '투표를 시작하세요'}
                  {status === 'voting' && '투표 진행 중...'}
                  {status === 'result' && '결과 확인'}
                </div>
              </CardContent>
            </Card>

            {/* Voting Options & Results */}
            <div className="grid grid-cols-2 gap-6">
              {/* Option A */}
              <Card className={`
                transition-all duration-300
                ${status === 'result' && percentA > percentB
                  ? 'bg-blue-500 border-blue-400 ring-4 ring-blue-400 ring-opacity-50'
                  : 'bg-slate-800 border-slate-700'
                }
              `}>
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-8xl mb-4">🅰️</div>
                  <div className="text-4xl font-bold mb-6">
                    {currentQuestion.optionA}
                  </div>

                  {status !== 'waiting' && (
                    <>
                      <div className="text-6xl font-black mb-4">
                        {percentA}%
                      </div>
                      <div className="text-2xl text-slate-300">
                        {voteCount.A}표
                      </div>
                      {status === 'result' && (
                        <Progress
                          value={percentA}
                          className="mt-4 h-4 bg-slate-700"
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Option B */}
              <Card className={`
                transition-all duration-300
                ${status === 'result' && percentB > percentA
                  ? 'bg-pink-500 border-pink-400 ring-4 ring-pink-400 ring-opacity-50'
                  : 'bg-slate-800 border-slate-700'
                }
              `}>
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-8xl mb-4">🅱️</div>
                  <div className="text-4xl font-bold mb-6">
                    {currentQuestion.optionB}
                  </div>

                  {status !== 'waiting' && (
                    <>
                      <div className="text-6xl font-black mb-4">
                        {percentB}%
                      </div>
                      <div className="text-2xl text-slate-300">
                        {voteCount.B}表
                      </div>
                      {status === 'result' && (
                        <Progress
                          value={percentB}
                          className="mt-4 h-4 bg-slate-700"
                        />
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {status === 'waiting' && (
                <Button
                  onClick={onStartVoting}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-xl px-8 py-6"
                >
                  <Play className="w-6 h-6 mr-2" />
                  투표 시작
                </Button>
              )}

              {status === 'voting' && (
                <Button
                  onClick={onShowResult}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xl px-8 py-6"
                >
                  <BarChart3 className="w-6 h-6 mr-2" />
                  결과 보기
                </Button>
              )}

              {status === 'result' && questionNumber < totalQuestions && (
                <Button
                  onClick={onNextQuestion}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xl px-8 py-6"
                >
                  <SkipForward className="w-6 h-6 mr-2" />
                  다음 질문
                </Button>
              )}

              {status === 'result' && questionNumber >= totalQuestions && (
                <div className="text-center">
                  <p className="text-2xl text-green-400 mb-4">
                    모든 질문이 완료되었습니다!
                  </p>
                  <Button
                    onClick={onEndSession}
                    size="lg"
                    variant="destructive"
                    className="text-xl px-8 py-6"
                  >
                    세션 종료
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Users className="w-20 h-20 mx-auto mb-6 text-slate-500" />
              <h2 className="text-3xl font-bold mb-4">참여자 대기 중...</h2>
              <p className="text-slate-400 text-xl">
                QR 코드를 스캔하거나 코드를 입력하여 참여하세요
              </p>
            </CardContent>
          </Card>
        )}

        {/* Participants List */}
        {participants.length > 0 && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 pb-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                참여자 ({participants.length}명)
              </h3>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <Badge
                    key={p.id}
                    variant="secondary"
                    className="text-lg px-4 py-2"
                  >
                    {p.display_name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ThisOrThatHost;
