/**
 * LadderCanvas Component
 *
 * Canvas를 사용한 사다리 렌더링 및 애니메이션
 */

import { useEffect } from 'react';
import { useLadderCanvas } from '../../hooks/useLadderCanvas';
import { usePathAnimation } from '../../hooks/usePathAnimation';
import type { LadderData } from '../../lib/ladder/types';

interface LadderCanvasProps {
  ladder: LadderData | null;
  participants: string[];
  results: string[];
  theme?: 'light' | 'dark' | 'colorful';
  onParticipantClick?: (index: number) => void;
  onAnimationComplete?: (resultColumn: number) => void;
  animationTrigger?: { index: number } | null;
}

export function LadderCanvas({
  ladder,
  participants,
  results,
  theme = 'light',
  onParticipantClick,
  onAnimationComplete,
  animationTrigger
}: LadderCanvasProps) {
  const canvasRef = useLadderCanvas({
    ladder,
    participants,
    results,
    theme
  });

  const { animate, isAnimating } = usePathAnimation({
    canvasRef,
    ladder,
    participants,
    results,
    theme,
    onComplete: onAnimationComplete
  });

  // Trigger animation when animationTrigger changes
  useEffect(() => {
    if (animationTrigger && !isAnimating) {
      animate(animationTrigger.index);
    }
  }, [animationTrigger, animate, isAnimating]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ladder || !onParticipantClick || isAnimating) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const padding = 40;
    const usableWidth = rect.width - padding * 2;
    const columnGap = usableWidth / (ladder.columnCount - 1);

    // 상단 참가자 영역 클릭 감지 (y < padding + 40)
    if (y < padding + 40) {
      for (let i = 0; i < ladder.columnCount; i++) {
        const colX = padding + i * columnGap;
        if (Math.abs(x - colX) < columnGap / 3) {
          onParticipantClick(i);
          break;
        }
      }
    }
  };

  if (!ladder) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gradient-to-br from-purple-50/50 to-pink-50/50 rounded-xl border-2 border-dashed border-purple-300">
        <div className="text-center space-y-4 px-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-4xl">🪜</span>
          </div>
          <p className="text-lg font-semibold text-gray-700">
            사다리를 생성해주세요
          </p>
          <p className="text-sm text-gray-500">
            참가자와 결과를 입력한 후<br />
            '사다리 생성' 버튼을 눌러주세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg">
          👆 참가자를 클릭하세요
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-[500px] rounded-xl border-2 border-purple-200 cursor-pointer touch-none bg-white shadow-inner hover:shadow-lg transition-shadow"
        onClick={handleCanvasClick}
      />

      {isAnimating && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-pink-500 text-white font-bold rounded-full shadow-lg animate-pulse">
          경로 추적 중...
        </div>
      )}

      <div className="mt-4 text-center space-y-2">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">참가자</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">결과</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500 border-2 border-white shadow-sm"></div>
            <span className="text-gray-600">경로</span>
          </div>
        </div>
      </div>
    </div>
  );
}
