'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import type { SessionElement } from '@/types/database';
import type {
  PollElementConfig,
  PollResponseData,
  isPollConfig,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface PollResponseProps {
  element: SessionElement;
  sessionId: string;
  participantId?: string;
  userId?: string;
  anonymousId?: string;
  displayName?: string;
  /** 투표 후 결과 표시 여부 */
  showResultsAfterVote?: boolean;
  /** 커스텀 스타일링 */
  className?: string;
}

// ============================================
// Color Palette
// ============================================

const OPTION_COLORS = [
  'bg-blue-500 hover:bg-blue-600',
  'bg-emerald-500 hover:bg-emerald-600',
  'bg-amber-500 hover:bg-amber-600',
  'bg-rose-500 hover:bg-rose-600',
  'bg-purple-500 hover:bg-purple-600',
  'bg-cyan-500 hover:bg-cyan-600',
  'bg-orange-500 hover:bg-orange-600',
  'bg-pink-500 hover:bg-pink-600',
];

const OPTION_COLORS_LIGHT = [
  'bg-blue-100 border-blue-300',
  'bg-emerald-100 border-emerald-300',
  'bg-amber-100 border-amber-300',
  'bg-rose-100 border-rose-300',
  'bg-purple-100 border-purple-300',
  'bg-cyan-100 border-cyan-300',
  'bg-orange-100 border-orange-300',
  'bg-pink-100 border-pink-300',
];

// ============================================
// Component
// ============================================

export function PollResponse({
  element,
  sessionId,
  participantId,
  userId,
  anonymousId,
  displayName,
  showResultsAfterVote = true,
  className,
}: PollResponseProps) {
  const config = element.config as unknown as PollElementConfig;

  // 로컬 선택 상태
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 응답 훅
  const {
    hasResponded,
    myResponse,
    submitResponse,
    error: responseError,
  } = useElementResponses<PollResponseData>({
    elementId: element.id,
    sessionId,
    participantId,
    userId,
    anonymousId,
    responseType: 'vote',
  });

  // 집계 훅 (결과 표시용)
  const {
    totalCount,
    getCountByKey,
    getPercentageByKey,
  } = useElementAggregates({
    elementId: element.id,
    enabled: hasResponded && showResultsAfterVote,
  });

  // Config 유효성 검사
  const isValidConfig = useMemo(() => {
    if (!config || typeof config !== 'object') return false;
    return Array.isArray(config.options) && config.options.length > 0;
  }, [config]);

  if (!isValidConfig) {
    return (
      <div className="text-center text-gray-500 py-8">
        투표 설정이 올바르지 않습니다.
      </div>
    );
  }

  // ============================================
  // Handlers
  // ============================================

  const handleSelectOption = (optionId: string) => {
    if (hasResponded || isSubmitting) return;

    if (config.type === 'single') {
      setSelectedOptions([optionId]);
    } else if (config.type === 'multiple') {
      setSelectedOptions((prev) => {
        if (prev.includes(optionId)) {
          return prev.filter((id) => id !== optionId);
        }
        // maxSelections 제한 체크
        const maxSelections = config.maxSelections || config.options.length;
        if (prev.length >= maxSelections) {
          return prev;
        }
        return [...prev, optionId];
      });
    }
  };

  const handleSubmit = async () => {
    if (selectedOptions.length === 0 || isSubmitting || hasResponded) return;

    setIsSubmitting(true);

    try {
      const responseData: PollResponseData = {
        selectedOption: selectedOptions[0],
        selectedOptions: config.type === 'multiple' ? selectedOptions : undefined,
      };

      await submitResponse(responseData, { displayName });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================
  // Render: 이미 투표한 경우 결과 표시
  // ============================================

  if (hasResponded && showResultsAfterVote) {
    const mySelectedOptions = myResponse?.data
      ? ((myResponse.data as unknown as PollResponseData).selectedOptions ||
          [(myResponse.data as unknown as PollResponseData).selectedOption])
      : [];

    return (
      <div className={cn('space-y-4', className)}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-emerald-600 font-medium">
            <Check className="w-5 h-5" />
            투표 완료
          </div>
          <p className="text-sm text-gray-500 mt-1">
            총 {totalCount}명 참여
          </p>
        </div>

        <div className="space-y-3">
          {config.options.map((option, index) => {
            const count = getCountByKey(option.id);
            const percentage = getPercentageByKey(option.id);
            const isMyChoice = mySelectedOptions.includes(option.id);
            const colorClass = OPTION_COLORS_LIGHT[index % OPTION_COLORS_LIGHT.length];

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative rounded-xl p-4 border-2 overflow-hidden',
                  colorClass,
                  isMyChoice && 'ring-2 ring-offset-2 ring-blue-500'
                )}
              >
                {/* Progress bar background */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="absolute inset-0 bg-current opacity-20"
                />

                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {isMyChoice && (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="font-medium text-gray-800">{option.text}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-lg">{percentage.toFixed(1)}%</span>
                    <span className="text-sm text-gray-500 ml-2">({count}표)</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================
  // Render: 투표 UI
  // ============================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Title */}
      {element.title && (
        <h3 className="text-xl font-bold text-center mb-6">{element.title}</h3>
      )}

      {/* Description */}
      {element.description && (
        <p className="text-gray-600 text-center mb-4">{element.description}</p>
      )}

      {/* Type indicator */}
      {config.type === 'multiple' && (
        <p className="text-sm text-gray-500 text-center">
          {config.maxSelections
            ? `최대 ${config.maxSelections}개 선택 가능`
            : '복수 선택 가능'}
        </p>
      )}

      {/* Options */}
      <div className="space-y-3">
        <AnimatePresence>
          {config.options.map((option, index) => {
            const isSelected = selectedOptions.includes(option.id);
            const colorClass = OPTION_COLORS[index % OPTION_COLORS.length];

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectOption(option.id)}
                disabled={isSubmitting || hasResponded}
                className={cn(
                  'w-full p-4 rounded-xl text-left transition-all duration-200',
                  'border-2 font-medium',
                  isSelected
                    ? `${colorClass} text-white border-transparent scale-[1.02] shadow-lg`
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md',
                  (isSubmitting || hasResponded) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      isSelected
                        ? 'bg-white border-white'
                        : 'border-gray-300'
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          'w-3 h-3 rounded-full',
                          OPTION_COLORS[index % OPTION_COLORS.length].split(' ')[0]
                        )}
                      />
                    )}
                  </div>
                  <span>{option.text}</span>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Error */}
      {responseError && (
        <p className="text-sm text-red-500 text-center">{responseError}</p>
      )}

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        disabled={selectedOptions.length === 0 || isSubmitting || hasResponded}
        className="w-full py-6 text-lg font-bold rounded-xl"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            제출 중...
          </>
        ) : (
          '투표하기'
        )}
      </Button>

      {/* Anonymous indicator */}
      {config.allowAnonymous && (
        <p className="text-xs text-gray-400 text-center">
          익명 투표입니다
        </p>
      )}
    </div>
  );
}

export default PollResponse;
