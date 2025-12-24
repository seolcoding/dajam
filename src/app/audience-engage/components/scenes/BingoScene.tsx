'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabase } from '@/hooks/useSupabase';
import { Users, RotateCcw, Sparkles, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BingoSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

// 휴먼빙고 기본 아이템
const DEFAULT_BINGO_ITEMS = [
  '안경 쓴 사람', '커피를 좋아하는 사람', '반려동물이 있는 사람',
  '해외여행 다녀온 사람', '운동을 좋아하는 사람', '요리를 잘하는 사람',
  '음악을 듣는 사람', '책을 좋아하는 사람', '게임을 좋아하는 사람',
  '영화 마니아', '아침형 인간', '야행성 인간',
  '첫째인 사람', '막내인 사람', '외동인 사람',
  '자취하는 사람', '대중교통 출퇴근', '자동차 출퇴근',
  '결혼한 사람', '연애 중인 사람', '솔로인 사람',
  '수영할 줄 아는 사람', '자전거 타는 사람', '등산 좋아하는 사람',
  '카페 자주 가는 사람',
];

interface BingoCell {
  value: string;
  isMarked: boolean;
}

interface BingoWinner {
  participantId: string;
  participantName: string;
  lineCount: number;
  timestamp: string;
}

/**
 * BingoScene - 휴먼빙고 Scene for audience-engage
 *
 * 호스트: 빙고 진행 상황 및 우승자 표시
 * 참여자: 빙고 카드에서 해당 항목 마킹
 */
export function BingoScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: BingoSceneProps) {
  const supabase = useSupabase();
  const gridSize = 5;

  // Host state
  const [winners, setWinners] = useState<BingoWinner[]>([]);
  const [participantCount, setParticipantCount] = useState(0);

  // Participant state - 랜덤 셔플된 빙고 카드
  const [bingoCard, setBingoCard] = useState<BingoCell[][]>([]);
  const [bingoLines, setBingoLines] = useState(0);
  const [hasReportedBingo, setHasReportedBingo] = useState(false);

  // Initialize bingo card for participant
  useEffect(() => {
    if (isHost) return;

    // Shuffle items and create grid
    const shuffled = [...DEFAULT_BINGO_ITEMS].sort(() => Math.random() - 0.5);
    const grid: BingoCell[][] = [];

    for (let i = 0; i < gridSize; i++) {
      const row: BingoCell[] = [];
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j;
        // Center is free
        if (i === 2 && j === 2) {
          row.push({ value: 'FREE', isMarked: true });
        } else {
          row.push({ value: shuffled[idx] || '빈칸', isMarked: false });
        }
      }
      grid.push(row);
    }

    setBingoCard(grid);
  }, [isHost, gridSize]);

  // Check for bingo lines
  const checkBingoLines = useCallback((card: BingoCell[][]): number => {
    if (card.length === 0) return 0;

    let lines = 0;

    // Check rows
    for (let i = 0; i < gridSize; i++) {
      if (card[i].every(cell => cell.isMarked)) lines++;
    }

    // Check columns
    for (let j = 0; j < gridSize; j++) {
      if (card.every(row => row[j].isMarked)) lines++;
    }

    // Check diagonals
    let diag1 = true, diag2 = true;
    for (let i = 0; i < gridSize; i++) {
      if (!card[i][i].isMarked) diag1 = false;
      if (!card[i][gridSize - 1 - i].isMarked) diag2 = false;
    }
    if (diag1) lines++;
    if (diag2) lines++;

    return lines;
  }, [gridSize]);

  // Toggle cell mark
  const handleCellClick = useCallback((row: number, col: number) => {
    if (isHost) return;
    if (row === 2 && col === 2) return; // FREE cell

    setBingoCard(prev => {
      const newCard = prev.map((r, ri) =>
        r.map((cell, ci) =>
          ri === row && ci === col
            ? { ...cell, isMarked: !cell.isMarked }
            : cell
        )
      );

      // Check lines
      const lines = checkBingoLines(newCard);
      setBingoLines(lines);

      return newCard;
    });
  }, [isHost, checkBingoLines]);

  // Report bingo to host
  const reportBingo = useCallback(async () => {
    if (!supabase || !sessionId || hasReportedBingo || bingoLines < 1) return;

    const winner: BingoWinner = {
      participantId: participantId || 'anonymous',
      participantName: participantName || '익명',
      lineCount: bingoLines,
      timestamp: new Date().toISOString(),
    };

    await supabase
      .channel(`bingo:${sessionId}`)
      .send({
        type: 'broadcast',
        event: 'bingo',
        payload: winner,
      });

    setHasReportedBingo(true);
  }, [supabase, sessionId, participantId, participantName, bingoLines, hasReportedBingo]);

  // Subscribe to bingo events (host)
  useEffect(() => {
    if (!isHost || !supabase || !sessionId) return;

    const channel = supabase
      .channel(`bingo:${sessionId}`)
      .on('broadcast', { event: 'bingo' }, (payload: { payload: BingoWinner }) => {
        setWinners(prev => {
          const filtered = prev.filter(w => w.participantId !== payload.payload.participantId);
          return [...filtered, payload.payload].sort((a, b) =>
            b.lineCount - a.lineCount || new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );
        });
      })
      .on('broadcast', { event: 'join' }, () => {
        setParticipantCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isHost, supabase, sessionId]);

  // Reset card
  const handleReset = () => {
    const shuffled = [...DEFAULT_BINGO_ITEMS].sort(() => Math.random() - 0.5);
    const grid: BingoCell[][] = [];

    for (let i = 0; i < gridSize; i++) {
      const row: BingoCell[] = [];
      for (let j = 0; j < gridSize; j++) {
        const idx = i * gridSize + j;
        if (i === 2 && j === 2) {
          row.push({ value: 'FREE', isMarked: true });
        } else {
          row.push({ value: shuffled[idx] || '빈칸', isMarked: false });
        }
      }
      grid.push(row);
    }

    setBingoCard(grid);
    setBingoLines(0);
    setHasReportedBingo(false);
  };

  // Host View
  if (isHost) {
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardContent className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">휴먼 빙고</h3>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {winners.length}명 빙고!
            </Badge>
          </div>

          {winners.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <p className="text-4xl mb-4">🎱</p>
                <p className="text-muted-foreground">
                  참여자들이 빙고를 외치면
                  <br />여기에 표시됩니다
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  주변 사람들과 대화하면서
                  <br />조건에 맞는 사람을 찾아보세요!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Winners Podium */}
              <div className="grid grid-cols-3 gap-2">
                {winners.slice(0, 3).map((winner, i) => (
                  <div
                    key={winner.participantId}
                    className={cn(
                      "text-center p-3 rounded-lg",
                      i === 0 ? "bg-yellow-100 ring-2 ring-yellow-400" :
                      i === 1 ? "bg-gray-100" :
                      "bg-orange-50"
                    )}
                  >
                    <p className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</p>
                    <p className="font-medium text-sm truncate">{winner.participantName}</p>
                    <p className="text-xs text-muted-foreground">{winner.lineCount}줄</p>
                  </div>
                ))}
              </div>

              {/* Other Winners */}
              {winners.length > 3 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">다른 참여자</h4>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {winners.slice(3).map((w, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-white/50 rounded px-2 py-1">
                        <span>{w.participantName}</span>
                        <Badge variant="secondary">{w.lineCount}줄</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Participant View
  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-yellow-50 to-orange-50">
      <CardContent className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">휴먼 빙고</h3>
            {bingoLines > 0 && (
              <Badge className="bg-yellow-500">{bingoLines}줄!</Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <Shuffle className="w-4 h-4" />
            </Button>
            {bingoLines > 0 && !hasReportedBingo && (
              <Button size="sm" onClick={reportBingo} className="bg-yellow-500 hover:bg-yellow-600">
                <Sparkles className="w-4 h-4 mr-1" />
                빙고!
              </Button>
            )}
          </div>
        </div>

        {/* Bingo Grid */}
        <div className="flex-1 grid grid-cols-5 gap-1">
          {bingoCard.map((row, ri) =>
            row.map((cell, ci) => (
              <button
                key={`${ri}-${ci}`}
                onClick={() => handleCellClick(ri, ci)}
                className={cn(
                  "aspect-square rounded-lg text-xs font-medium p-1",
                  "flex items-center justify-center text-center",
                  "transition-all",
                  cell.isMarked
                    ? "bg-yellow-400 text-yellow-900 ring-2 ring-yellow-500"
                    : "bg-white hover:bg-yellow-50 border border-yellow-200",
                  ri === 2 && ci === 2 && "bg-yellow-300"
                )}
              >
                {cell.value === 'FREE' ? '⭐' : cell.value}
              </button>
            ))
          )}
        </div>

        {/* Instructions */}
        <p className="text-xs text-muted-foreground text-center mt-2">
          주변 사람들과 대화해서 조건에 맞는 칸을 터치하세요!
        </p>
      </CardContent>
    </Card>
  );
}

export default BingoScene;
