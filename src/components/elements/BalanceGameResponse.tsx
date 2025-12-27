'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Swords } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import { 
  BalanceGameElementConfig, 
  BalanceGameResponseData,
  isBalanceGameConfig,
  BalanceGameElementState
} from '@/lib/elements/types';
import type { SessionElement } from '@/types/database';

interface BalanceGameResponseProps {
  element: SessionElement;
  participantId?: string;
  userId?: string;
  className?: string;
}

export function BalanceGameResponse({ 
  element, 
  participantId, 
  userId,
  className 
}: BalanceGameResponseProps) {
  const config = element.config as unknown as BalanceGameElementConfig;
  const state = element.state as unknown as BalanceGameElementState;
  
  if (!isBalanceGameConfig(config)) {
    return <div className="text-red-500 text-center p-4">Invalid Balance Game Configuration</div>;
  }

  const { 
    submitResponse, 
    myResponse, 
    isLoading: isSubmitting 
  } = useElementResponses<BalanceGameResponseData>({
    elementId: element.id,
    sessionId: element.session_id,
    participantId,
    userId,
    responseType: 'choice',
  });

  const { getPercentageByKey } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  const currentQuestionIndex = state.currentQuestionIndex || 0;
  const currentQuestion = config.questions[currentQuestionIndex];

  // 내 응답 확인
  const myAnswerData = myResponse?.data as unknown as BalanceGameResponseData | undefined;
  const hasAnswered = !!myAnswerData && myAnswerData.questionId === currentQuestion.id;
  const myChoice = hasAnswered ? myAnswerData?.choice : null;

  const handleSelect = async (choice: 'a' | 'b') => {
    if (hasAnswered || isSubmitting) return;
    await submitResponse({
      questionId: currentQuestion.id,
      choice,
    });
  };

  const percentageA = getPercentageByKey('a');
  const percentageB = getPercentageByKey('b');

  return (
    <div className={cn("w-full max-w-lg mx-auto flex flex-col items-center", className)}>
      <div className="text-center mb-8">
        <span className="inline-block bg-dajaem-yellow/20 text-dajaem-yellow-700 px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-widest">
          Balance Game {currentQuestionIndex + 1}/{config.questions.length}
        </span>
        <h3 className="text-2xl font-black text-slate-900 leading-tight">
          당신의 선택은?
        </h3>
      </div>

      <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VS Badge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full border-4 border-slate-100 flex items-center justify-center shadow-lg hidden md:flex">
          <span className="text-dajaem-red font-black italic">VS</span>
        </div>

        {/* Option A */}
        <OptionCard
          id="a"
          text={currentQuestion.optionA.text}
          imageUrl={currentQuestion.optionA.imageUrl}
          color={currentQuestion.optionA.color || "#03C75A"}
          percentage={percentageA}
          isSelected={myChoice === 'a'}
          showResult={hasAnswered}
          onSelect={() => handleSelect('a')}
          disabled={hasAnswered || isSubmitting}
        />

        {/* Option B */}
        <OptionCard
          id="b"
          text={currentQuestion.optionB.text}
          imageUrl={currentQuestion.optionB.imageUrl}
          color={currentQuestion.optionB.color || "#0066FF"}
          percentage={percentageB}
          isSelected={myChoice === 'b'}
          showResult={hasAnswered}
          onSelect={() => handleSelect('b')}
          disabled={hasAnswered || isSubmitting}
        />
      </div>

      <AnimatePresence>
        {isSubmitting && !hasAnswered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-2 text-dajaem-green font-medium"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            선택을 전송하고 있어요...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OptionCard({ 
  id, text, imageUrl, color, percentage, isSelected, showResult, onSelect, disabled 
}: any) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "relative group w-full aspect-[4/5] md:aspect-square rounded-3xl overflow-hidden border-4 transition-all duration-500",
        isSelected ? "border-white shadow-2xl z-10" : "border-transparent",
        !disabled && "hover:shadow-glow-green/20"
      )}
      style={{ backgroundColor: color }}
    >
      {imageUrl && (
        <img src={imageUrl} alt={text} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
      )}
      
      {/* Percentage Overlay */}
      {showResult && (
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${percentage}%` }}
          className="absolute bottom-0 left-0 right-0 bg-white/20 backdrop-blur-sm z-0"
        />
      )}

      <div className="absolute inset-0 p-6 flex flex-col items-center justify-center text-center gap-4 z-10">
        {isSelected && (
          <div className="bg-white text-slate-900 p-1.5 rounded-full shadow-lg">
            <Check className="w-4 h-4 stroke-[4px]" style={{ color: color }} />
          </div>
        )}
        
        <h4 className="text-white text-xl md:text-2xl font-black drop-shadow-md">
          {text}
        </h4>

        {showResult && (
          <div className="mt-2 flex flex-col items-center">
            <span className="text-white text-4xl font-black drop-shadow-lg">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
}
