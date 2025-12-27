'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import { 
  PollElementConfig, 
  PollResponseData, 
  isPollConfig 
} from '@/lib/elements/types';
import type { SessionElement } from '@/types/database';

interface PollResponseProps {
  element: SessionElement;
  participantId?: string;
  userId?: string;
  className?: string;
}

export function PollResponse({ 
  element, 
  participantId, 
  userId,
  className 
}: PollResponseProps) {
  // 1. Config Validation
  const config = element.config;
  if (!isPollConfig(config)) {
    return <div className="text-red-500">Invalid Poll Configuration</div>;
  }

  // 2. State Hooks
  const { 
    submitResponse, 
    hasResponded, 
    myResponse, 
    isLoading: isSubmitting 
  } = useElementResponses<PollResponseData>({
    elementId: element.id,
    sessionId: element.session_id,
    participantId,
    userId,
    responseType: 'vote',
  });

  const { 
    totalCount, 
    getPercentageByKey, 
    countMap 
  } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  // Local state for multiple selection
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // 3. Handlers
  const handleSelect = (optionId: string) => {
    if (hasResponded) return;

    if (config.type === 'single') {
      handleSubmit(optionId);
    } else if (config.type === 'multiple') {
      setSelectedOptions(prev => {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId);
        }
        if (config.maxSelections && prev.length >= config.maxSelections) {
          return prev;
        }
        return [...prev, optionId];
      });
    }
  };

  const handleSubmit = async (optionId?: string) => {
    // Single choice immediate submit
    if (config.type === 'single' && optionId) {
      await submitResponse({ selectedOption: optionId });
      return;
    }

    // Multiple choice manual submit
    if (config.type === 'multiple' && selectedOptions.length > 0) {
      await submitResponse({ 
        selectedOption: 'multiple', // legacy fallback
        selectedOptions 
      });
    }
  };

  // 4. Render Helpers
  const showResults = hasResponded || config.showResultsLive;
  
  const getMySelection = (optionId: string) => {
    if (!myResponse) return false;
    const data = myResponse.data as unknown as PollResponseData;
    if (config.type === 'single') {
      return data.selectedOption === optionId;
    }
    return data.selectedOptions?.includes(optionId);
  };

  const isSelected = (optionId: string) => {
    if (hasResponded) return getMySelection(optionId);
    return selectedOptions.includes(optionId);
  };

  return (
    <div className={cn("w-full max-w-md mx-auto space-y-4", className)}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {element.title || '투표해주세요'}
        </h3>
        {element.description && (
          <p className="text-sm text-slate-500 mt-2">{element.description}</p>
        )}
        {config.type === 'multiple' && !hasResponded && (
          <p className="text-xs text-blue-500 mt-1">
            여러 개 선택 가능 {config.maxSelections ? `(최대 ${config.maxSelections}개)` : ''}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {config.options.map((option) => {
          const percentage = getPercentageByKey(option.id);
          const count = countMap[option.id] || 0;
          const selected = isSelected(option.id);
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={!hasResponded ? { scale: 1.01 } : {}}
              whileTap={!hasResponded ? { scale: 0.99 } : {}}
            >
              <Card
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-normal ease-out-expo border-2",
                  hasResponded 
                    ? "cursor-default hover:bg-transparent" 
                    : "hover:border-dajaem-green/50 hover:shadow-glow-green",
                  selected 
                    ? "border-dajaem-green bg-dajaem-green/5 shadow-glow-green" 
                    : "border-transparent bg-slate-50 dark:bg-slate-800"
                )}
                onClick={() => handleSelect(option.id)}
              >
                {/* Result Bar Background */}
                {showResults && (
                  <motion.div
                    className="absolute inset-0 bg-dajaem-green/10 z-0"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}

                <div className="relative z-10 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Checkbox/Radio Indicator */}
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-fast",
                      config.type === 'multiple' ? "rounded-md" : "rounded-full",
                      selected 
                        ? "bg-dajaem-green border-dajaem-green text-white scale-110" 
                        : "border-slate-300 dark:border-slate-600"
                    )}>
                      {selected && <Check className="w-3 h-3 stroke-[3px]" />}
                    </div>
                    
                    <span className={cn(
                      "font-semibold transition-colors",
                      selected ? "text-dajaem-green" : "text-slate-700 dark:text-slate-200"
                    )}>
                      {option.text}
                    </span>
                  </div>

                  {/* Percentage/Count */}
                  {showResults && (
                    <div className="text-right">
                      <span className="font-bold text-dajaem-green font-display text-lg">
                        {Math.round(percentage)}%
                      </span>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {count} VOTES
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Multiple Choice Submit Button */}
      {config.type === 'multiple' && !hasResponded && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pt-4"
        >
          <Button 
            className="w-full h-12 text-lg font-bold bg-dajaem-green hover:bg-dajaem-green-600 text-white shadow-glow-green active:animate-press" 
            size="lg"
            disabled={selectedOptions.length === 0 || isSubmitting}
            onClick={() => handleSubmit()}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Check className="w-5 h-5 mr-2 stroke-[3px]" />
            )}
            투표 제출하기
          </Button>
        </motion.div>
      )}

      {/* Footer Info */}
      <div className="mt-6 flex justify-between items-center text-[11px] font-medium text-slate-400 uppercase tracking-widest">
        <span className="flex items-center gap-1.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", showResults ? "bg-dajaem-green animate-pulse" : "bg-slate-300")} />
          {showResults ? `TOTAL ${totalCount} PARTICIPANTS` : 'VOTING IN PROGRESS'}
        </span>
        {config.allowAnonymous && <span>ANONYMOUS POLL</span>}
      </div>
    </div>
  );
}
