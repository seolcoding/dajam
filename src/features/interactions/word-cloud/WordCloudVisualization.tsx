'use client';

import { useEffect, useRef, useState } from 'react';
import type { WordCount, ColorScheme } from './types';
import { COLOR_PALETTES } from './types';

export interface WordCloudVisualizationProps {
  words: WordCount[];
  colorScheme?: ColorScheme;
  className?: string;
  onWordClick?: (word: WordCount) => void;
}

/**
 * 워드 클라우드 시각화 컴포넌트
 * CSS 기반의 간단한 구현 - audience-engage와 독립 앱에서 공유
 */
export function WordCloudVisualization({
  words,
  colorScheme = 'rainbow',
  className = '',
  onWordClick,
}: WordCloudVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setContainerSize] = useState({ width: 0, height: 0 });

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

  const colors = COLOR_PALETTES[colorScheme];

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
              animation: `wordCloudFadeIn 0.5s ease-in-out ${index * 0.05}s both`,
            }}
            title={`${word.text} (${word.value}회)`}
          >
            {word.text}
          </span>
        );
      })}

      <style jsx>{`
        @keyframes wordCloudFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8) rotate(0deg);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export interface WordCloudStatsProps {
  words: WordCount[];
  totalEntries: number;
}

/**
 * 워드 클라우드 통계 요약 컴포넌트
 */
export function WordCloudStats({ words, totalEntries }: WordCloudStatsProps) {
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

export default WordCloudVisualization;
