'use client';

/**
 * WheelMode - 범용 랜덤 뽑기 룰렛 모드
 * 기존 RandomPickerClient의 핵심 기능을 모드 컴포넌트로 분리
 */

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useWheelStore } from '../store/wheel-store';
import { useSessionStore } from '../store/session-store';
import { SpinAnimator } from '../lib/spin-animator';
import { WheelCanvas } from '../components/WheelCanvas';
import { ItemInput } from '../components/ItemInput';
import { ItemList } from '../components/ItemList';
import { BulkInput } from '../components/BulkInput';
import { ResultModal } from '../components/ResultModal';
import { HistoryPanel } from '../components/HistoryPanel';
import { SettingsPanel } from '../components/SettingsPanel';
import { QRCodeShare } from '@/components/entry';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import type { SpinResult } from '../types';

interface WheelModeProps {
  isSessionMode?: boolean;
  onBack?: () => void;
  isHost?: boolean;
}

export function WheelMode({
  isSessionMode = false,
  isHost = true,
}: WheelModeProps) {
  const { sessionCode } = useSessionStore();
  const {
    items,
    currentRotation,
    currentIndex,
    isSpinning,
    history,
    settings,
    selectedResult,
    addItem,
    addItems,
    removeItem,
    updateItem,
    clearItems,
    setCurrentRotation,
    setCurrentIndex,
    setIsSpinning,
    addResult,
    setSelectedResult,
    clearHistory,
    updateSettings,
    loadFromStorage,
  } = useWheelStore();

  const animatorRef = useRef(new SpinAnimator());

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleSpin = () => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);

    animatorRef.current.spin(
      currentRotation,
      items,
      (rotation, index) => {
        setCurrentRotation(rotation);
        setCurrentIndex(index);
      },
      (selectedItem) => {
        const result: SpinResult = {
          id: crypto.randomUUID(),
          selectedItem,
          timestamp: Date.now(),
          rotation: currentRotation,
          itemsSnapshot: items,
        };

        setIsSpinning(false);
        addResult(result);
        setSelectedResult(result);

        // Confetti effect
        if (settings.confettiEnabled) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      }
    );
  };

  const handleDownloadImage = () => {
    alert('이미지 다운로드 기능은 추후 구현 예정입니다.');
  };

  // 세션 URL 생성 (클라이언트에서만)
  const sessionUrl = typeof window !== 'undefined' && sessionCode
    ? `${window.location.origin}/random-picker?mode=wheel&join=${sessionCode}`
    : '';

  // 참여자 모드일 경우 읽기 전용 뷰
  if (isSessionMode && !isHost) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 bg-white border-gray-200 shadow-sm max-w-2xl mx-auto">
          <div className="aspect-square">
            <WheelCanvas
              items={items}
              rotation={currentRotation}
              onSpin={() => {}}
              isSpinning={isSpinning}
            />
          </div>
          <div className="mt-6 text-center text-gray-600">
            호스트가 룰렛을 돌리면 결과를 함께 확인할 수 있습니다
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end gap-2 mb-4">
        <HistoryPanel history={history} onClear={clearHistory} />
        <SettingsPanel settings={settings} onUpdate={updateSettings} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-6">
        {/* Left Panel: Items */}
        <div className="space-y-4">
          <Card className="p-5 bg-white border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">항목 관리</h2>
            <div className="space-y-3">
              <ItemInput onAdd={addItem} disabled={isSpinning} />
              <BulkInput onAdd={addItems} disabled={isSpinning} />
              {items.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-100"
                  onClick={clearItems}
                  disabled={isSpinning}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  전체 삭제
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-5 bg-white border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                항목 목록 ({items.length})
              </h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  항목을 추가해주세요
                </div>
              ) : (
                <ItemList
                  items={items}
                  onRemove={removeItem}
                  onUpdate={updateItem}
                  disabled={isSpinning}
                />
              )}
            </div>
          </Card>

          {/* Session QR Code (Host Mode Only) */}
          {isSessionMode && sessionCode && sessionUrl && (
            <QRCodeShare
              url={sessionUrl}
              sessionCode={sessionCode}
              size={160}
              title="참여자 초대"
              description="QR 코드를 스캔하거나 코드를 입력하세요"
            />
          )}
        </div>

        {/* Right Panel: Wheel */}
        <Card className="p-8 bg-white border-gray-200 shadow-sm">
          <div className="aspect-square max-w-2xl mx-auto">
            <WheelCanvas
              items={items}
              rotation={currentRotation}
              onSpin={handleSpin}
              isSpinning={isSpinning}
            />
          </div>

          {items.length >= 2 && (
            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={handleSpin}
                disabled={isSpinning}
                className="px-16 py-6 text-lg font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md"
              >
                {isSpinning ? '회전 중...' : 'SPIN!'}
              </Button>
              {currentIndex !== null && items[currentIndex] && (
                <div className="mt-4 text-gray-600 font-medium">
                  현재 위치: {items[currentIndex].label}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <ResultModal
        result={selectedResult}
        open={!!selectedResult}
        onClose={() => setSelectedResult(null)}
        onDownload={handleDownloadImage}
      />
    </div>
  );
}
