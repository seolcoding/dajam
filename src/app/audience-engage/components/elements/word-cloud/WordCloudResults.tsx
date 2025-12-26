'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Users, Lock, Unlock, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import type { SessionElement } from '@/types/database';
import type {
  WordCloudElementConfig,
  WordCloudElementState,
  WordCloudResponseData,
  WordCloudResult,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface WordCloudResultsProps {
  element: SessionElement;
  sessionId: string;
  showControls?: boolean;
  maxWords?: number;
  className?: string;
}

// ============================================
// Color Palette
// ============================================

const WORD_COLORS = [
  'text-blue-600',
  'text-emerald-600',
  'text-purple-600',
  'text-rose-600',
  'text-amber-600',
  'text-cyan-600',
  'text-pink-600',
  'text-indigo-600',
  'text-orange-600',
  'text-teal-600',
];

// ============================================
// Component
// ============================================

export function WordCloudResults({
  element,
  sessionId,
  showControls = true,
  maxWords = 50,
  className,
}: WordCloudResultsProps) {
  const config = element.config as unknown as WordCloudElementConfig;
  const state = (element.state || {}) as unknown as WordCloudElementState;

  const isOpen = state.isOpen !== false;

  // 응답 훅
  const {
    responses,
    isLoading,
    reload: reloadResponses,
  } = useElementResponses({
    elementId: element.id,
    sessionId,
  });

  // Element 상태 업데이트용
  const { updateElementState } = useSessionElements({
    sessionId,
  });

  // ============================================
  // Computed Data
  // ============================================

  // 단어 집계
  const wordResults = useMemo((): WordCloudResult[] => {
    const wordMap = new Map<string, { count: number; participants: Set<string> }>();

    responses.forEach((r) => {
      const data = r.data as unknown as WordCloudResponseData;
      const word = config.caseSensitive ? data.word : data.word.toLowerCase();
      const participantKey = r.participant_id || r.user_id || r.anonymous_id || r.id;

      const existing = wordMap.get(word);
      if (existing) {
        existing.count += 1;
        existing.participants.add(participantKey);
      } else {
        wordMap.set(word, {
          count: 1,
          participants: new Set([participantKey]),
        });
      }
    });

    return Array.from(wordMap.entries())
      .map(([text, data]) => ({
        text,
        count: data.count,
        participants: Array.from(data.participants),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, maxWords);
  }, [responses, config.caseSensitive, maxWords]);

  const totalWords = responses.length;
  const uniqueWords = wordResults.length;
  const maxCount = wordResults.length > 0 ? wordResults[0].count : 0;

  // 폰트 크기 계산 (count 기반)
  const getFontSize = useCallback(
    (count: number): number => {
      if (maxCount === 0) return 16;
      const minSize = 14;
      const maxSize = 48;
      const ratio = count / maxCount;
      return Math.floor(minSize + ratio * (maxSize - minSize));
    },
    [maxCount]
  );

  // ============================================
  // Handlers
  // ============================================

  const handleToggleOpen = async () => {
    await updateElementState(element.id, {
      ...state,
      isOpen: !isOpen,
      totalWords,
      uniqueWords,
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['단어', '횟수', '참여자 수'],
      ...wordResults.map((w) => [w.text, w.count, w.participants.length]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wordcloud_${element.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================
  // Render
  // ============================================

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {element.title && <h3 className="text-xl font-bold">{element.title}</h3>}
          <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {totalWords}개 단어
            </span>
            <span>{uniqueWords}개 고유</span>
            {!isOpen && (
              <span className="text-amber-600 font-medium">(수집 마감)</span>
            )}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => reloadResponses()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant={!isOpen ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleOpen}
              className="gap-1"
            >
              {!isOpen ? (
                <>
                  <Unlock className="w-4 h-4" />
                  수집 열기
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  수집 마감
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Word Cloud Visualization */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 min-h-[300px] flex items-center justify-center">
        {wordResults.length === 0 ? (
          <div className="text-center text-gray-500">
            <Cloud className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">아직 수집된 단어가 없습니다</p>
            <p className="text-sm mt-1">{config.prompt}</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-3 max-w-3xl">
            {wordResults.map((word, index) => {
              const fontSize = getFontSize(word.count);
              const colorClass = WORD_COLORS[index % WORD_COLORS.length];

              return (
                <motion.span
                  key={word.text}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02, type: 'spring', stiffness: 200 }}
                  className={cn(
                    'font-bold cursor-default hover:opacity-80 transition-opacity',
                    colorClass
                  )}
                  style={{ fontSize: `${fontSize}px` }}
                  title={`${word.text}: ${word.count}회 (${word.participants.length}명)`}
                >
                  {word.text}
                </motion.span>
              );
            })}
          </div>
        )}
      </div>

      {/* Word List */}
      {wordResults.length > 0 && (
        <div className="border rounded-xl p-4 max-h-64 overflow-y-auto">
          <h4 className="font-medium text-gray-700 mb-3">단어 순위</h4>
          <div className="space-y-2">
            {wordResults.slice(0, 20).map((word, index) => (
              <div
                key={word.text}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-medium text-gray-500">
                    {index + 1}
                  </span>
                  <span className="font-medium">{word.text}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">
                    {word.participants.length}명
                  </span>
                  <span className="font-bold text-blue-600">{word.count}회</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live indicator */}
      {isOpen && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          실시간 수집 중
        </div>
      )}
    </div>
  );
}

export default WordCloudResults;
