'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { BingoBoard } from './BingoBoard';
import { TraitCheckModal } from './TraitCheckModal';
import { ALL_TRAITS } from '../data/traits';
import { generateBalancedTraits, createBingoCard } from '../utils/bingo';
import type { ViewMode, ParticipantCard } from '../types';

interface ParticipantViewProps {
  mode: ViewMode;
  onBack: () => void;
  onModeChange: (mode: ViewMode) => void;
  sessionCode: string;
  onSessionCodeChange: (code: string) => void;
  initialName?: string;
}

export function ParticipantView({
  mode,
  onBack,
  onModeChange,
  sessionCode,
  onSessionCodeChange,
  initialName = '',
}: ParticipantViewProps) {
  const [joinCode, setJoinCode] = useState(sessionCode);
  const [nickname, setNickname] = useState(initialName);
  const [myCard, setMyCard] = useState<ParticipantCard | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showCheckModal, setShowCheckModal] = useState(false);

  // Auto-join when coming from tabs with initialName already set
  useEffect(() => {
    if (mode === 'participant-join' && initialName && sessionCode && !myCard) {
      // Generate bingo card for participant
      const traits = generateBalancedTraits(ALL_TRAITS, 5, true);
      const participantId = `${Date.now()}-${Math.random()}`;
      const card = createBingoCard(traits, 5, participantId, initialName);

      setMyCard(card);
      onModeChange('participant');
    }
  }, [mode, initialName, sessionCode, myCard, onModeChange]);

  // 참여 화면 (fallback when not coming from tabs)
  if (mode === 'participant-join' && !initialName) {
    const handleJoin = () => {
      if (!joinCode || !nickname) return;

      // Generate bingo card for participant
      const traits = generateBalancedTraits(ALL_TRAITS, 5, true);
      const participantId = `${Date.now()}-${Math.random()}`;
      const card = createBingoCard(traits, 5, participantId, nickname);

      setMyCard(card);
      onSessionCodeChange(joinCode.toUpperCase());
      onModeChange('participant');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">게임 참여하기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="joinCode">세션 코드 (6자리)</Label>
                <Input
                  id="joinCode"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-wider"
                />
              </div>

              <div>
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="이름 또는 닉네임"
                  maxLength={20}
                />
              </div>

              <Button
                onClick={handleJoin}
                disabled={joinCode.length !== 6 || !nickname}
                className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                size="lg"
              >
                참여하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 참가자 빙고판 화면
  if (!myCard) return null;

  const handleCellClick = (row: number, col: number) => {
    const cell = myCard.card[row][col];
    if (cell.isChecked || cell.trait === null) return;

    setSelectedCell({ row, col });
    setShowCheckModal(true);
  };

  const handleCheckConfirm = (checkedByName: string) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;
    const cell = myCard.card[row][col];

    if (cell.isChecked || cell.trait === null) return;

    // Update cell
    cell.isChecked = true;
    cell.checkedBy = checkedByName;
    cell.checkedAt = new Date().toISOString();

    // Update card
    const updatedCard = {
      ...myCard,
      checkedCount: myCard.checkedCount + 1,
    };

    setMyCard(updatedCard);
    setShowCheckModal(false);
    setSelectedCell(null);

    // Check for bingo (simplified - would need full bingo check logic)
    // This is a placeholder
  };

  const totalCells = myCard.card.length * myCard.card.length;
  const progress = (myCard.checkedCount / totalCells) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          나가기
        </Button>

        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{myCard.participantName}</h1>
            <code className="text-sm font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded">
              {sessionCode}
            </code>
          </div>

          {/* Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">진행률</span>
              <span className="font-bold">
                {myCard.checkedCount} / {totalCells}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Bingo Count */}
          {myCard.completedLines.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg p-4 mb-4 text-center animate-pulse">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6" />
                <span className="text-2xl font-black">
                  {myCard.completedLines.length}줄 BINGO!
                </span>
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>

        {/* Bingo Board */}
        <BingoBoard card={myCard} onCellClick={handleCellClick} />

        {/* Instructions */}
        <Card className="mt-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              특성을 가진 사람을 찾아 대화하고, 칸을 터치하여 이름을 입력하세요
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Check Modal */}
      {showCheckModal && selectedCell && (
        <TraitCheckModal
          trait={myCard.card[selectedCell.row][selectedCell.col].trait!}
          onConfirm={handleCheckConfirm}
          onCancel={() => {
            setShowCheckModal(false);
            setSelectedCell(null);
          }}
        />
      )}
    </div>
  );
}
