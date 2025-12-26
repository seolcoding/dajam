'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, Lock, Unlock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import { useSessionElements } from '@/lib/realtime/hooks/useSessionElements';
import type { SessionElement } from '@/types/database';
import type { PollElementConfig, PollElementState } from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface PollResultsProps {
  element: SessionElement;
  sessionId: string;
  /** 결과 숨김/공개 컨트롤 표시 */
  showControls?: boolean;
  /** 컴팩트 모드 */
  compact?: boolean;
  className?: string;
}

// ============================================
// Color Palette
// ============================================

const BAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-pink-500',
];

// ============================================
// Component
// ============================================

export function PollResults({
  element,
  sessionId,
  showControls = true,
  compact = false,
  className,
}: PollResultsProps) {
  const config = element.config as unknown as PollElementConfig;
  const state = (element.state || {}) as unknown as PollElementState;

  // 집계 데이터
  const {
    aggregates,
    totalCount,
    getCountByKey,
    getPercentageByKey,
    getSortedByCount,
    isLoading,
    reload: reloadAggregates,
  } = useElementAggregates({
    elementId: element.id,
  });

  // Element 상태 업데이트용
  const { updateElementState } = useSessionElements({
    sessionId,
  });

  // 정렬된 결과
  const sortedResults = useMemo(() => {
    return config.options.map((option, index) => ({
      ...option,
      count: getCountByKey(option.id),
      percentage: getPercentageByKey(option.id),
      colorClass: BAR_COLORS[index % BAR_COLORS.length],
      originalIndex: index,
    })).sort((a, b) => b.count - a.count);
  }, [config.options, getCountByKey, getPercentageByKey]);

  // 최다 득표
  const maxCount = sortedResults.length > 0 ? sortedResults[0].count : 0;

  // ============================================
  // Handlers
  // ============================================

  const handleToggleOpen = async () => {
    await updateElementState(element.id, {
      ...state,
      isOpen: !state.isOpen,
      closedAt: state.isOpen ? new Date().toISOString() : undefined,
    });
  };

  // ============================================
  // Render
  // ============================================

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-4', className)}>
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {element.title && (
            <h3 className={cn('font-bold', compact ? 'text-lg' : 'text-xl')}>
              {element.title}
            </h3>
          )}
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <Users className="w-4 h-4" />
            <span>{totalCount}명 참여</span>
            {state.isOpen === false && (
              <span className="text-amber-600 font-medium">(투표 마감)</span>
            )}
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => reloadAggregates()}
              className="gap-1"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant={state.isOpen === false ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleOpen}
              className="gap-1"
            >
              {state.isOpen === false ? (
                <>
                  <Unlock className="w-4 h-4" />
                  투표 열기
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  투표 마감
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {sortedResults.map((option, index) => {
          const isWinner = option.count === maxCount && maxCount > 0;

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative overflow-hidden rounded-xl',
                compact ? 'p-3' : 'p-4',
                isWinner && index === 0 ? 'ring-2 ring-yellow-400' : ''
              )}
            >
              {/* Background bar */}
              <div className="absolute inset-0 bg-gray-100" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${option.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={cn('absolute inset-0', option.colorClass, 'opacity-20')}
              />

              {/* Content */}
              <div className="relative flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      index === 0 && maxCount > 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-200 text-gray-600'
                    )}
                  >
                    {index + 1}
                  </div>
                  <span className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
                    {option.text}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Count */}
                  <div className="text-right">
                    <span className={cn('font-bold', compact ? 'text-lg' : 'text-xl')}>
                      {option.count}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">표</span>
                  </div>

                  {/* Percentage */}
                  <div
                    className={cn(
                      'font-bold px-3 py-1 rounded-full text-white min-w-[60px] text-center',
                      option.colorClass
                    )}
                  >
                    {option.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>아직 투표가 없습니다</p>
        </div>
      )}

      {/* Live indicator */}
      {config.showResultsLive && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          실시간 업데이트 중
        </div>
      )}
    </div>
  );
}

export default PollResults;
