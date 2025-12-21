/**
 * useLadderCanvas Hook
 *
 * Canvas 렌더링 및 반응형 처리
 */

import { useEffect, useRef } from 'react';
import type { LadderData } from '../lib/ladder/types';
import { drawLadder, getThemeColors } from '../lib/ladder/renderer';

interface UseLadderCanvasProps {
  ladder: LadderData | null;
  participants: string[];
  results: string[];
  theme?: 'light' | 'dark' | 'colorful';
}

export function useLadderCanvas({
  ladder,
  participants,
  results,
  theme = 'light'
}: UseLadderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ladder) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const config = {
        width: rect.width,
        height: rect.height,
        padding: 40,
        lineWidth: 2,
        colors: getThemeColors(theme)
      };

      drawLadder(ctx, ladder, participants, results, config);
    };

    render();

    const resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [ladder, participants, results, theme]);

  return canvasRef;
}
