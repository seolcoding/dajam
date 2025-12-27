'use client';

import { AppHeader, AppFooter } from '@/components/layout';
import { WheelCanvas } from './WheelCanvas';
import { ResultModal } from './ResultModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWheelStore } from '../store/wheel-store';
import { useSessionStore } from '../store/session-store';
import { Disc, ArrowLeft, Users } from 'lucide-react';

interface ParticipantViewProps {
  onBack: () => void;
}

export function ParticipantView({ onBack }: ParticipantViewProps) {
  const { sessionCode, participantName } = useSessionStore();
  const {
    items,
    currentRotation,
    currentIndex,
    isSpinning,
    selectedResult,
    setSelectedResult,
  } = useWheelStore();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader
        title="랜덤 뽑기 룰렛"
        description={`세션: ${sessionCode}`}
        icon={Disc}
        iconGradient="from-purple-500 to-pink-500"
        actions={
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            나가기
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Participant Info */}
          <Card className="p-4 mb-6 bg-purple-50 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                {participantName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-semibold text-purple-900">{participantName}</p>
                <p className="text-sm text-purple-600">참여자로 시청 중</p>
              </div>
            </div>
          </Card>

          {/* Wheel Display */}
          <Card className="p-8 bg-white border-gray-200 shadow-sm">
            <div className="aspect-square">
              <WheelCanvas
                items={items}
                rotation={currentRotation}
                onSpin={() => {}} // Participants cannot spin
                isSpinning={isSpinning}
              />
            </div>

            {items.length < 2 && (
              <div className="mt-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">호스트가 항목을 추가할 때까지</p>
                <p>기다려 주세요...</p>
              </div>
            )}

            {items.length >= 2 && !isSpinning && (
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  호스트가 룰렛을 돌리면 실시간으로 확인할 수 있습니다
                </p>
                {currentIndex !== null && items[currentIndex] && (
                  <p className="mt-2 text-lg font-bold text-purple-600">
                    현재 위치: {items[currentIndex].label}
                  </p>
                )}
              </div>
            )}

            {isSpinning && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center px-6 py-3 bg-purple-100 rounded-full">
                  <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse mr-3" />
                  <span className="text-purple-700 font-bold text-xl">회전 중...</span>
                </div>
              </div>
            )}
          </Card>

          {/* Item Count */}
          {items.length > 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              현재 {items.length}개 항목
            </p>
          )}
        </div>
      </main>

      <AppFooter />

      <ResultModal
        result={selectedResult}
        open={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        onDownload={() => {}}
      />
    </div>
  );
}
