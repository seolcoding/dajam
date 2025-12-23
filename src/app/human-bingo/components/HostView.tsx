'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Users, Clock, Copy, CheckCircle2 } from 'lucide-react';
import { generateSessionCode } from '@/lib/realtime/utils';
import { ALL_TRAITS } from '../data/traits';
import { generateBalancedTraits, createBingoCard, sortLeaderboard } from '../utils/bingo';
import type { ViewMode, GridSize, WinCondition, ParticipantCard, SessionSettings } from '../types';

interface HostViewProps {
  mode: ViewMode;
  onBack: () => void;
  onModeChange: (mode: ViewMode) => void;
  sessionCode: string;
  onSessionCodeChange: (code: string) => void;
}

export function HostView({ mode, onBack, onModeChange, sessionCode, onSessionCodeChange }: HostViewProps) {
  // Setup state
  const [title, setTitle] = useState('Human Bingo');
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [timeLimit, setTimeLimit] = useState<number>(15);
  const [winCondition, setWinCondition] = useState<WinCondition>('single-line');

  // Game state
  const [participants, setParticipants] = useState<ParticipantCard[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Setup 화면
  if (mode === 'host-setup') {
    const handleStartSession = () => {
      const code = generateSessionCode();
      onSessionCodeChange(code);
      onModeChange('host');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Human Bingo 세션 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 세션 제목 */}
              <div>
                <Label htmlFor="title">세션 제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 신입 환영 빙고"
                />
              </div>

              {/* 빙고판 크기 */}
              <div>
                <Label htmlFor="gridSize">빙고판 크기</Label>
                <Select value={String(gridSize)} onValueChange={(v) => setGridSize(Number(v) as GridSize)}>
                  <SelectTrigger id="gridSize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3x3 (9칸)</SelectItem>
                    <SelectItem value="4">4x4 (16칸)</SelectItem>
                    <SelectItem value="5">5x5 (25칸, 추천)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 제한 시간 */}
              <div>
                <Label htmlFor="timeLimit">제한 시간 (분)</Label>
                <Select value={String(timeLimit)} onValueChange={(v) => setTimeLimit(Number(v))}>
                  <SelectTrigger id="timeLimit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10분</SelectItem>
                    <SelectItem value="15">15분 (추천)</SelectItem>
                    <SelectItem value="20">20분</SelectItem>
                    <SelectItem value="30">30분</SelectItem>
                    <SelectItem value="0">제한 없음</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 승리 조건 */}
              <div>
                <Label htmlFor="winCondition">승리 조건</Label>
                <Select value={winCondition} onValueChange={(v) => setWinCondition(v as WinCondition)}>
                  <SelectTrigger id="winCondition">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-line">1줄 완성</SelectItem>
                    <SelectItem value="two-lines">2줄 완성</SelectItem>
                    <SelectItem value="three-lines">3줄 완성</SelectItem>
                    <SelectItem value="full-house">전체 완성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleStartSession} className="w-full" size="lg">
                세션 생성하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 타이머
  useEffect(() => {
    if (isStarted && startTime && timeLimit > 0) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        const remaining = Math.max(0, timeLimit * 60 - elapsed);
        setRemainingTime(remaining);

        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isStarted, startTime, timeLimit]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = () => {
    setIsStarted(true);
    setStartTime(new Date());
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const leaderboard = sortLeaderboard(participants).map((p, index) => ({
    ...p,
    rank: index + 1,
  }));

  const bingoAchievers = participants.filter(p => p.completedLines.length > 0);
  const avgChecked = participants.length > 0
    ? (participants.reduce((sum, p) => sum + p.checkedCount, 0) / participants.length).toFixed(1)
    : '0';

  // 호스트 대시보드
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black mb-2">{title}</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg text-gray-600 dark:text-gray-300">세션 코드:</span>
            <code className="text-2xl font-mono font-bold bg-white dark:bg-gray-800 px-4 py-2 rounded-lg">
              {sessionCode}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 진행 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                진행 현황
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">참가자</div>
                  <div className="text-3xl font-bold">{participants.length}명</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">평균 체크</div>
                  <div className="text-3xl font-bold">{avgChecked}개</div>
                </div>
                <div className="bg-pink-50 dark:bg-pink-900/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">빙고 달성</div>
                  <div className="text-3xl font-bold">{bingoAchievers.length}명</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">남은 시간</div>
                  <div className="text-3xl font-bold">
                    {isStarted && timeLimit > 0 ? formatTime(remainingTime) : timeLimit > 0 ? `${timeLimit}분` : '무제한'}
                  </div>
                </div>
              </div>

              {!isStarted && (
                <Button onClick={handleStartGame} className="w-full" size="lg">
                  게임 시작하기
                </Button>
              )}

              {isStarted && remainingTime === 0 && timeLimit > 0 && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg text-center">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">시간 종료!</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 리더보드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                리더보드
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  아직 참가자가 없습니다
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.participantId}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                          entry.rank === 2 ? 'bg-gray-300 text-gray-900' :
                          entry.rank === 3 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <div className="font-bold">{entry.participantName}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {entry.completedLines.length}줄 • {entry.checkedCount}개 체크
                          </div>
                        </div>
                      </div>
                      {entry.bingoAt && (
                        <div className="text-sm text-green-600 dark:text-green-400 font-bold">
                          BINGO!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 게임 설정 정보 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>게임 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">빙고판 크기:</span>
                <span className="ml-2 font-bold">{gridSize}x{gridSize}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">제한 시간:</span>
                <span className="ml-2 font-bold">{timeLimit > 0 ? `${timeLimit}분` : '무제한'}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">승리 조건:</span>
                <span className="ml-2 font-bold">
                  {winCondition === 'single-line' ? '1줄' :
                   winCondition === 'two-lines' ? '2줄' :
                   winCondition === 'three-lines' ? '3줄' : '전체 완성'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
