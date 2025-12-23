'use client';

/**
 * 이상형 월드컵 호스트 대시보드
 * - 참여자들의 실시간 진행상황 확인
 * - 완료 후 우승자 집계
 */

import { use, useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  Users,
  RefreshCw,
  Trophy,
  Medal,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useWorldcupSession } from '../../../hooks/useWorldcupSession';
import { RealtimeIndicator } from '@/components/common/RealtimeIndicator';
import { CopyableLink } from '@/components/common/CopyableLink';
import { getRoundName } from '../../../utils/tournament';

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

  const {
    session,
    tournament,
    hostName,
    participants,
    isLoading,
    error,
    isConnected,
    completedCount,
    winnerStats,
    reload,
    closeSession,
  } = useWorldcupSession({
    sessionCode: code,
    enabled: true,
  });

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/ideal-worldcup/session/play/${code}`
      : '';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !session || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || '세션을 찾을 수 없습니다.'}</p>
          <Button onClick={() => router.push('/ideal-worldcup')}>홈으로</Button>
        </div>
      </div>
    );
  }

  const totalMatches = tournament.totalRounds - 1; // 전체 매치 수 (16강이면 15매치)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/ideal-worldcup')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Trophy className="w-8 h-8 text-yellow-500" />
                {tournament.title}
              </h1>
              <p className="text-muted-foreground">
                {hostName}의 멀티플레이어 월드컵 • {getRoundName(tournament.totalRounds)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RealtimeIndicator isConnected={isConnected} />
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
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    초대 링크 (클릭해서 복사)
                  </p>
                  <CopyableLink url={shareUrl} className="w-full" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-100">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-3xl font-bold text-blue-700">{participants.length}</p>
                    <p className="text-sm text-blue-600">참여자</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center border border-green-100">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-3xl font-bold text-green-700">{completedCount}</p>
                    <p className="text-sm text-green-600">완료</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-100">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-3xl font-bold text-purple-700">{tournament.totalRounds}</p>
                    <p className="text-sm text-purple-600">토너먼트</p>
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
            <CardDescription>각 참여자의 토너먼트 진행률을 실시간으로 확인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">아직 참여자가 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  QR 코드나 링크를 공유해서 친구들을 초대하세요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {participants.map((participant) => {
                  const progress =
                    (Object.keys(participant.metadata?.selections || {}).length / totalMatches) *
                    100;
                  const isComplete = !!participant.metadata?.completedAt;
                  const currentRound = participant.metadata?.currentRound || tournament.totalRounds;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-white"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-white text-lg">
                        {participant.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-lg truncate">
                            {participant.display_name}
                          </span>
                          {isComplete ? (
                            <Badge className="bg-green-500 flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              완료
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getRoundName(currentRound)} 진행 중
                            </span>
                          )}
                        </div>
                        <Progress value={progress} className="h-2.5" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Object.keys(participant.metadata?.selections || {}).length} / {totalMatches} 매치 완료
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Winner Statistics (when multiple completed) */}
        {winnerStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                우승자 집계
              </CardTitle>
              <CardDescription>
                완료한 참여자들의 우승자를 집계했습니다 ({completedCount}명 완료)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {winnerStats.map((stat, index) => {
                  const percent = Math.round((stat.count / completedCount) * 100);
                  const isTopWinner = index === 0;

                  return (
                    <div
                      key={stat.candidate.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isTopWinner
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Rank */}
                        <div className="flex-shrink-0">
                          {index === 0 && (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {index === 1 && (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                              <Medal className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {index === 2 && (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center">
                              <Medal className="w-6 h-6 text-white" />
                            </div>
                          )}
                          {index > 2 && (
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xl">
                              {index + 1}
                            </div>
                          )}
                        </div>

                        {/* Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md">
                          <img
                            src={stat.candidate.imageUrl}
                            alt={stat.candidate.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h4 className="font-bold text-lg mb-1">{stat.candidate.name}</h4>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl font-bold text-blue-600">{percent}%</span>
                            <span className="text-sm text-muted-foreground">
                              ({stat.count}명 선택)
                            </span>
                          </div>
                          <Progress value={percent} className="h-2 mb-2" />
                          <p className="text-xs text-muted-foreground">
                            {stat.participants.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
