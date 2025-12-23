'use client';

import { useEffect, useRef, useState } from 'react';
import type { WordCount, ColorScheme } from '../types';

interface WordCloudRendererProps {
  words: WordCount[];
  colorScheme?: ColorScheme;
  className?: string;
  onWordClick?: (word: WordCount) => void;
}

/**
 * 워드 클라우드 렌더러
 * CSS Grid 기반의 간단한 구현
 * 나중에 react-wordcloud로 업그레이드 가능
 */
export function WordCloudRenderer({
  words,
  colorScheme = 'rainbow',
  className = '',
  onWordClick,
}: WordCloudRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  if (words.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <div className="text-center text-gray-400">
          <p className="text-2xl font-medium mb-2">아직 제출된 단어가 없습니다</p>
          <p className="text-lg">참가자들이 단어를 입력하면 여기에 표시됩니다</p>
        </div>
      </div>
    );
  }

  // Calculate font sizes based on frequency
  const maxCount = Math.max(...words.map((w) => w.value));
  const minCount = Math.min(...words.map((w) => w.value));
  const fontSizeRange = { min: 16, max: 80 };

  const calculateFontSize = (count: number): number => {
    if (maxCount === minCount) return fontSizeRange.max;
    const ratio = (count - minCount) / (maxCount - minCount);
    return fontSizeRange.min + ratio * (fontSizeRange.max - fontSizeRange.min);
  };

  const getColorPalette = (scheme: ColorScheme): string[] => {
    const palettes: Record<ColorScheme, string[]> = {
      rainbow: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
      ocean: ['#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8', '#03045E'],
      sunset: ['#FF6B6B', '#FF8E72', '#FFB347', '#FFD93D', '#FF69B4'],
      forest: ['#2D5016', '#4A7C23', '#6B8E23', '#9ACD32', '#98D8C8'],
      mono: ['#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080'],
      custom: ['#3B82F6', '#8B5CF6', '#EC4899'],
    };
    return palettes[scheme];
  };

  const colors = getColorPalette(colorScheme);

  // Random rotation for visual interest
  const getRotation = (index: number): number => {
    const rotations = [-10, -5, 0, 5, 10];
    return rotations[index % rotations.length];
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-wrap items-center justify-center gap-3 p-8 min-h-[400px] ${className}`}
      style={{ lineHeight: 1.5 }}
    >
      {words.map((word, index) => {
        const fontSize = calculateFontSize(word.value);
        const color = colors[index % colors.length];
        const rotation = getRotation(index);

        return (
          <span
            key={`${word.text}-${index}`}
            onClick={() => onWordClick?.(word)}
            className={`inline-block transition-all duration-300 hover:scale-110 ${
              onWordClick ? 'cursor-pointer' : ''
            }`}
            style={{
              fontSize: `${fontSize}px`,
              fontWeight: 700,
              color,
              transform: `rotate(${rotation}deg)`,
              padding: '0.25rem 0.5rem',
              userSelect: 'none',
              animation: `fadeIn 0.5s ease-in-out ${index * 0.05}s both`,
            }}
            title={`${word.text} (${word.value}회)`}
          >
            {word.text}
          </span>
        );
      })}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) rotate(0deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(var(--rotation, 0deg));
          }
        }
      `}</style>
    </div>
  );
}

/**
 * 워드 클라우드 통계 요약
 */
export function WordCloudStats({
  words,
  totalEntries,
}: {
  words: WordCount[];
  totalEntries: number;
}) {
  const uniqueWords = words.length;
  const mostCommon = words[0];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-blue-600">{totalEntries}</p>
        <p className="text-sm text-gray-600 mt-1">총 단어 수</p>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-purple-600">{uniqueWords}</p>
        <p className="text-sm text-gray-600 mt-1">고유 단어</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-2xl font-bold text-green-600 truncate">
          {mostCommon?.text || '-'}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          가장 많은 단어 ({mostCommon?.value || 0}회)
        </p>
      </div>
    </div>
  );
}
