'use client';

/**
 * 이상형 월드컵 참여자 플레이 페이지
 * - 참여자가 자신의 토너먼트 진행
 * - 실시간으로 호스트에게 진행상황 전송
 */

import { use, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Trophy, Home, Users } from 'lucide-react';
import { useWorldcupSession } from '../../../hooks/useWorldcupSession';
import type { WorldcupParticipant } from '../../../hooks/useWorldcupSession';
import type { Match, Candidate } from '../../../types';
import { createBracket, advanceToNextRound } from '../../../utils/tournament';
import MatchView from '../../../components/play/MatchView';
import ResultView from '../../../components/result/ResultView';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function PlayPage({ params }: PageProps) {
  const { code } = use(params);
  const router = useRouter();

  const { session, tournament, hostName, isLoading, error, joinSession, submitSelection } = useWorldcupSession({
    sessionCode: code,
    enabled: true,
  });

  const [name, setName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [myParticipant, setMyParticipant] = useState<WorldcupParticipant | null>(null);

  // 로컬 게임 상태 (각 참여자가 독립적으로 진행)
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [history, setHistory] = useState<Candidate[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [winner, setWinner] = useState<Candidate | null>(null);
  const [runnerUp, setRunnerUp] = useState<Candidate | null>(null);

  // 게임 초기화
  const initializeGame = useCallback(() => {
    if (!tournament) return;

    const initialMatches = createBracket(tournament.candidates, tournament.totalRounds);
    setCurrentRound(tournament.totalRounds);
    setCurrentMatchIndex(0);
    setMatches(initialMatches);
    setAllMatches(initialMatches);
    setHistory([]);
    setIsComplete(false);
    setWinner(null);
    setRunnerUp(null);
  }, [tournament]);

  // 참여하기
  const handleJoin = async () => {
    if (!name.trim()) return;
    setIsJoining(true);

    const participant = await joinSession(name.trim());

    if (participant) {
      setMyParticipant(participant);
      initializeGame();
    }

    setIsJoining(false);
  };

  // 승자 선택
  const handleSelectWinner = useCallback(
    async (candidateId: string) => {
      if (!tournament || !myParticipant) return;

      const currentMatch = matches[currentMatchIndex];
      if (!currentMatch) return;

      const selectedWinner =
        currentMatch.candidateA.id === candidateId
          ? currentMatch.candidateA
          : currentMatch.candidateB;

      // 현재 매치에 승자 설정
      currentMatch.winner = selectedWinner;

      // 히스토리에 추가
      const newHistory = [...history, selectedWinner];
      setHistory(newHistory);

      // 다음 매치로 이동
      let nextMatchIndex = currentMatchIndex + 1;
      let newMatches = [...matches];
      let newRound = currentRound;
      let newAllMatches = [...allMatches];
      let finalWinner: Candidate | undefined;
      let finalRunnerUp: Candidate | undefined;
      let tournamentComplete = false;

      // 현재 라운드의 모든 매치가 완료되었는지 확인
      if (nextMatchIndex >= matches.length) {
        // 다음 라운드로 진행
        const nextRoundMatches = advanceToNextRound(matches);

        if (nextRoundMatches.length === 0) {
          // 토너먼트 완료
          const finalMatch = matches[0];
          const loser =
            finalMatch.candidateA.id === selectedWinner.id
              ? finalMatch.candidateB
              : finalMatch.candidateA;

          finalWinner = selectedWinner;
          finalRunnerUp = loser;
          tournamentComplete = true;

          setIsComplete(true);
          setWinner(selectedWinner);
          setRunnerUp(loser);
        } else {
          // 다음 라운드 설정
          newRound = nextRoundMatches[0].round;
          newMatches = nextRoundMatches;
          newAllMatches = [...newAllMatches, ...nextRoundMatches];
          nextMatchIndex = 0;
        }
      }

      // 로컬 상태 업데이트
      setCurrentRound(newRound);
      setCurrentMatchIndex(nextMatchIndex);
      setMatches(newMatches);
      setAllMatches(newAllMatches);

      // 서버에 진행상황 전송
      await submitSelection(
        myParticipant.id,
        currentMatch.id,
        selectedWinner.id,
        newRound,
        nextMatchIndex,
        tournamentComplete,
        finalWinner,
        finalRunnerUp
      );
    },
    [tournament, myParticipant, matches, currentMatchIndex, currentRound, allMatches, history, submitSelection]
  );

  // 뒤로가기
  const handleGoBack = useCallback(() => {
    if (history.length === 0) return;

    // 히스토리에서 마지막 선택 제거
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    // 이전 매치로 돌아가기
    let prevMatchIndex = currentMatchIndex - 1;
    let prevRound = currentRound;
    let prevMatches = [...matches];

    if (prevMatchIndex < 0) {
      // 이전 라운드로 돌아가기
      const prevRoundNumber = currentRound * 2;
      const prevRoundMatches = allMatches.filter((m) => m.round === prevRoundNumber);

      if (prevRoundMatches.length > 0) {
        prevRound = prevRoundNumber;
        prevMatches = prevRoundMatches;
        prevMatchIndex = prevMatches.length - 1;
      } else {
        return; // 더 이상 뒤로 갈 수 없음
      }
    }

    // 이전 매치의 승자 제거
    if (prevMatches[prevMatchIndex]) {
      prevMatches[prevMatchIndex].winner = undefined;
    }

    setCurrentRound(prevRound);
    setCurrentMatchIndex(prevMatchIndex);
    setMatches(prevMatches);
    setIsComplete(false);
    setWinner(null);
    setRunnerUp(null);
  }, [history, currentMatchIndex, currentRound, matches, allMatches]);

  // 로딩
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 에러
  if (error || !session || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">{error || '세션을 찾을 수 없습니다.'}</p>
          <Button onClick={() => router.push('/ideal-worldcup')}>홈으로</Button>
        </div>
      </div>
    );
  }

  // 참여 전: 이름 입력
  if (!myParticipant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">{hostName}의 이상형 월드컵</CardTitle>
            <p className="text-muted-foreground mt-2">{tournament.title}</p>
            <Badge variant="outline" className="mt-3 text-lg px-4 py-2">
              {tournament.totalRounds}강 토너먼트
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="w-4 h-4" />
                <p className="text-sm font-medium">멀티플레이어 모드</p>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                다른 참여자들과 함께 각자의 이상형을 선택해보세요
              </p>
            </div>

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
  if (isComplete && winner) {
    const result = {
      id: '',
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      winner,
      runnerUp: runnerUp || undefined,
      completedAt: new Date(),
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <ResultView
            result={result}
            onRestart={initializeGame}
            onHome={() => router.push('/ideal-worldcup')}
          />

          {/* Multiplayer Info */}
          <Card className="max-w-2xl mx-auto mt-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <p className="text-sm">멀티플레이어 세션</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  호스트 대시보드에서 다른 참여자들의 선택을 확인할 수 있습니다
                </p>
                <Button variant="outline" onClick={() => router.push('/ideal-worldcup')}>
                  <Home className="w-4 h-4 mr-2" />
                  홈으로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 플레이 중
  const currentMatch = matches[currentMatchIndex];

  if (!currentMatch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">매치를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <MatchView
      match={currentMatch}
      currentMatchIndex={currentMatchIndex}
      totalMatches={matches.length}
      currentRound={currentRound}
      onSelectWinner={handleSelectWinner}
      onGoBack={handleGoBack}
      canGoBack={history.length > 0}
    />
  );
}
