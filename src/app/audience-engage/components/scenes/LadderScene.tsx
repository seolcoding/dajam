'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useSupabase } from '@/hooks/useSupabase';
import { Users, Play, RotateCcw, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LadderSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

interface Player {
  id: string;
  name: string;
}

interface LadderResult {
  playerId: string;
  playerName: string;
  resultIndex: number;
  resultLabel: string;
}

/**
 * LadderScene - 사다리타기 Scene for audience-engage
 *
 * 호스트: 사다리 설정 및 결과 관리
 * 참여자: 자신의 사다리 선택 및 결과 확인
 */
export function LadderScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: LadderSceneProps) {
  const supabase = useSupabase();

  // Host state
  const [players, setPlayers] = useState<Player[]>([]);
  const [resultLabels, setResultLabels] = useState<string[]>(['당첨', '꽝', '꽝', '꽝']);
  const [results, setResults] = useState<LadderResult[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Participant state
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [myResult, setMyResult] = useState<LadderResult | null>(null);
  const [hasSelected, setHasSelected] = useState(false);

  // Subscribe to ladder events
  useEffect(() => {
    if (!supabase || !sessionId) return;

    const channel = supabase
      .channel(`ladder:${sessionId}`)
      .on('broadcast', { event: 'player-join' }, (payload: { payload: Player }) => {
        if (isHost) {
          setPlayers(prev => {
            if (prev.find(p => p.id === payload.payload.id)) return prev;
            return [...prev, payload.payload];
          });
        }
      })
      .on('broadcast', { event: 'result' }, (payload: { payload: LadderResult }) => {
        if (!isHost && payload.payload.playerId === participantId) {
          setMyResult(payload.payload);
        }
        if (isHost) {
          setResults(prev => [...prev, payload.payload]);
        }
      })
      .on('broadcast', { event: 'game-start' }, () => {
        setIsPlaying(true);
        setShowResults(false);
      })
      .on('broadcast', { event: 'show-results' }, () => {
        setShowResults(true);
      })
      .subscribe();

    // Participant joins automatically
    if (!isHost && participantId && participantName) {
      channel.send({
        type: 'broadcast',
        event: 'player-join',
        payload: { id: participantId, name: participantName },
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sessionId, isHost, participantId, participantName]);

  // Host: Start game
  const handleStartGame = async () => {
    if (!supabase) return;

    await supabase.channel(`ladder:${sessionId}`).send({
      type: 'broadcast',
      event: 'game-start',
      payload: {},
    });
    setIsPlaying(true);
    setResults([]);
    setShowResults(false);
  };

  // Host: Show results
  const handleShowResults = async () => {
    if (!supabase) return;

    // Shuffle results
    const shuffledLabels = [...resultLabels].sort(() => Math.random() - 0.5);

    // Assign results to players
    const newResults: LadderResult[] = players.map((player, index) => ({
      playerId: player.id,
      playerName: player.name,
      resultIndex: index,
      resultLabel: shuffledLabels[index % shuffledLabels.length],
    }));

    // Broadcast each result
    for (const result of newResults) {
      await supabase.channel(`ladder:${sessionId}`).send({
        type: 'broadcast',
        event: 'result',
        payload: result,
      });
    }

    await supabase.channel(`ladder:${sessionId}`).send({
      type: 'broadcast',
      event: 'show-results',
      payload: {},
    });

    setResults(newResults);
    setShowResults(true);
  };

  // Host: Reset game
  const handleReset = () => {
    setPlayers([]);
    setResults([]);
    setIsPlaying(false);
    setShowResults(false);
  };

  // Participant: Select ladder
  const handleSelect = async (index: number) => {
    if (hasSelected) return;
    setSelectedIndex(index);
    setHasSelected(true);
  };

  // Host View
  if (isHost) {
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">사다리타기</h3>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" />
              {players.length}명 참여
            </Badge>
          </div>

          {/* Result Labels Input */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">결과 라벨</label>
            <div className="flex gap-2 flex-wrap">
              {resultLabels.map((label, i) => (
                <Input
                  key={i}
                  value={label}
                  onChange={(e) => {
                    const newLabels = [...resultLabels];
                    newLabels[i] = e.target.value;
                    setResultLabels(newLabels);
                  }}
                  className="w-20 text-center"
                  disabled={isPlaying}
                />
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResultLabels([...resultLabels, '꽝'])}
                disabled={isPlaying}
              >
                +
              </Button>
            </div>
          </div>

          {/* Players */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">참여자</label>
            {players.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                참여자를 기다리는 중...
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {players.map((player) => (
                  <Badge key={player.id} variant="secondary">
                    {player.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          {showResults && results.length > 0 && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">결과</label>
              <div className="space-y-2">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-lg",
                      result.resultLabel === '당첨' ? "bg-yellow-100" : "bg-gray-100"
                    )}
                  >
                    <span>{result.playerName}</span>
                    <Badge
                      variant={result.resultLabel === '당첨' ? 'default' : 'secondary'}
                      className={result.resultLabel === '당첨' ? 'bg-yellow-500' : ''}
                    >
                      {result.resultLabel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 mt-auto">
            {!isPlaying ? (
              <Button onClick={handleStartGame} disabled={players.length < 2}>
                <Play className="w-4 h-4 mr-1" />
                게임 시작
              </Button>
            ) : !showResults ? (
              <Button onClick={handleShowResults}>
                <Shuffle className="w-4 h-4 mr-1" />
                결과 공개
              </Button>
            ) : (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-1" />
                다시하기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Participant View - Result
  if (myResult) {
    return (
      <Card className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-6xl mb-4">{myResult.resultLabel === '당첨' ? '🎉' : '😅'}</p>
          <h3 className="text-2xl font-bold mb-2">{myResult.resultLabel}</h3>
          <p className="text-muted-foreground">
            {myResult.resultLabel === '당첨'
              ? '축하합니다!'
              : '다음 기회에!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Participant View - Selection
  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardContent className="flex-1 flex flex-col p-6">
        <h3 className="text-lg font-semibold mb-4 text-center">사다리타기</h3>

        {!isPlaying ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <p className="text-4xl mb-4">🪜</p>
              <p className="text-muted-foreground">
                게임 시작을 기다리는 중...
              </p>
            </div>
          </div>
        ) : hasSelected ? (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <p className="text-4xl mb-4">⏳</p>
              <p className="text-muted-foreground">
                결과 발표를 기다리는 중...
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-muted-foreground mb-4">
              사다리를 선택하세요!
            </p>
            <div className="flex-1 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={cn(
                      "w-16 h-24 rounded-lg border-2 flex flex-col items-center justify-center",
                      "transition-all hover:scale-105",
                      selectedIndex === i
                        ? "border-blue-500 bg-blue-100"
                        : "border-gray-300 bg-white hover:border-blue-300"
                    )}
                  >
                    <span className="text-2xl">🪜</span>
                    <span className="text-xs mt-1">{i + 1}번</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default LadderScene;
