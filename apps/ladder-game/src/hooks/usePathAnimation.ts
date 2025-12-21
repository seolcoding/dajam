/**
 * usePathAnimation Hook
 *
 * 경로 추적 애니메이션
 */

import { useCallback, useState, useRef } from 'react';
import type { LadderData, CanvasConfig } from '../lib/ladder/types';
import { tracePath, calculateTotalDistance, getPointAtDistance } from '../lib/ladder/tracer';
import { drawLadder, drawHighlightedPath, drawMarker, getThemeColors } from '../lib/ladder/renderer';
import { easeInOut, calculateAnimationDuration } from '../lib/ladder/easing';

interface UsePathAnimationProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  ladder: LadderData | null;
  participants: string[];
  results: string[];
  theme?: 'light' | 'dark' | 'colorful';
  onComplete?: (resultColumn: number) => void;
}

export function usePathAnimation({
  canvasRef,
  ladder,
  participants,
  results,
  theme = 'light',
  onComplete
}: UsePathAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const animate = useCallback((startColumn: number) => {
    if (!canvasRef.current || !ladder) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const config: CanvasConfig = {
      width: rect.width,
      height: rect.height,
      padding: 40,
      lineWidth: 2,
      colors: getThemeColors(theme)
    };

    const { path, endColumn } = tracePath(startColumn, ladder, config);
    const totalDistance = calculateTotalDistance(path);
    const duration = calculateAnimationDuration(totalDistance);
    const startTime = performance.now();

    setIsAnimating(true);

    function drawFrame(currentTime: number) {
      if (!ctx) return;

      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOut(rawProgress);
      setProgress(easedProgress);

      const currentDistance = totalDistance * easedProgress;
      const currentPoint = getPointAtDistance(path, currentDistance);

      // 캔버스 다시 그리기
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (ladder) {
        drawLadder(ctx, ladder, participants, results, config);
      }

      // 지나간 경로 강조
      drawHighlightedPath(ctx, path, currentPoint, config);

      // 현재 위치 마커
      drawMarker(ctx, currentPoint.x, currentPoint.y, config);

      if (rawProgress < 1) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      } else {
        setIsAnimating(false);
        setProgress(0);
        onComplete?.(endColumn);
      }
    }

    animationFrameRef.current = requestAnimationFrame(drawFrame);
  }, [canvasRef, ladder, participants, results, theme, onComplete]);

  const cancel = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      setIsAnimating(false);
      setProgress(0);
    }
  }, []);

  return { animate, cancel, isAnimating, progress };
}
