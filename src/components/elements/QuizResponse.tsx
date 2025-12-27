'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Timer, Trophy, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import { 
  QuizElementConfig, 
  QuizElementState,
  QuizResponseData,
  isQuizConfig 
} from '@/lib/elements/types';
import type { SessionElement } from '@/types/database';

interface QuizResponseProps {
  element: SessionElement;
  participantId?: string;
  userId?: string;
  className?: string;
}

export function QuizResponse({ 
  element, 
  participantId, 
  userId,
  className 
}: QuizResponseProps) {
  // 1. Config & State Validation
  const config = element.config as unknown as QuizElementConfig;
  const state = element.state as unknown as QuizElementState;
  
  if (!isQuizConfig(config)) {
    return (
      <div className="p-4 border-2 border-dashed border-red-200 rounded-xl bg-red-50 text-red-500 text-center">
        <p className="font-bold">Invalid Quiz Configuration</p>
        <p className="text-xs mt-1">Please check the element settings.</p>
      </div>
    );
  }

  // 2. State Hooks
  const { 
    submitResponse, 
    myResponse, 
    isLoading: isSubmitting 
  } = useElementResponses<QuizResponseData>({
    elementId: element.id,
    sessionId: element.session_id,
    participantId,
    userId,
    responseType: 'answer',
  });

  const { totalCount } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  // 3. Current Question Logic
  const currentQuestionIndex = state.currentQuestionIndex || 0;
  const currentQuestion = config.questions[currentQuestionIndex];
  
  // Is the current question active?
  // In V2, we might want a specific 'isQuestionActive' flag in state, 
  // or derive it from 'isRevealed'. 
  // For now, let's assume if it's not revealed, it's active for answering.
  const isRevealed = state.isRevealed;
  
  // Have I answered THIS specific question?
  // We need to check if myResponse contains data for the current question.
  // Note: The current DB schema stores one response per element per user.
  // For multi-question quizzes, we might need to:
  // a) Update the existing response to append the new answer (array of answers).
  // b) Or, simpler for MVP: Store the last answer in 'data', and maybe 'history' in metadata?
  // Let's assume for this MVP, the 'data' field holds the answer for the CURRENT question context.
  // A better approach for multi-question: `data` is `{ answers: { [qId]: answer } }`.
  
  // Let's refactor `QuizResponseData` in types.ts later to support multiple answers if needed.
  // For now, let's treat `myResponse` as the source of truth. 
  // If `myResponse.data.questionId === currentQuestion.id`, then I have answered.
  const myAnswerData = myResponse?.data as unknown as QuizResponseData | undefined;
  const hasAnsweredCurrent = myAnswerData?.questionId === currentQuestion.id;
  const mySelectedOption = hasAnsweredCurrent ? myAnswerData?.answer : null;

  // 4. Handlers
  const handleSelect = async (optionIndex: number) => {
    if (hasAnsweredCurrent || isRevealed || isSubmitting) return;

    const answerData: QuizResponseData = {
      questionId: currentQuestion.id,
      answer: optionIndex, // Store index as answer for multiple choice
      answeredAt: Date.now(),
    };

    // Calculate score (simple version)
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const score = isCorrect ? (currentQuestion.points || 10) : 0;

    await submitResponse(answerData, {
      score,
      isCorrect,
    });
  };

  // 5. Render Helpers
  const isCorrect = mySelectedOption === currentQuestion.correctAnswer;
  
  return (
    <div className={cn("w-full max-w-md mx-auto space-y-6", className)}>
      {/* Header: Timer & Progress */}
      <div className="flex items-center justify-between text-sm font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-700 font-bold">
            Q{currentQuestionIndex + 1}
          </span>
          <span className="text-slate-400">/ {config.questions.length}</span>
        </div>
        <div className="flex items-center gap-1.5 text-dajaem-green">
          <Timer className="w-4 h-4" />
          <span className="font-mono font-bold">
            {currentQuestion.timeLimit ? `${currentQuestion.timeLimit}s` : '∞'}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <Progress 
        value={((currentQuestionIndex + 1) / config.questions.length) * 100} 
        className="h-1.5 bg-slate-100" 
        indicatorClassName="bg-gradient-to-r from-dajaem-green to-dajaem-teal"
      />

      {/* Question */}
      <div className="text-center py-4">
        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {currentQuestion.text}
        </h3>
        {currentQuestion.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm aspect-video relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={currentQuestion.imageUrl} 
              alt="Question" 
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="grid gap-3">
        <AnimatePresence mode="wait">
          {currentQuestion.options?.map((option, index) => {
            const isSelected = mySelectedOption === index;
            const showCorrectness = isRevealed || (isSelected && isRevealed);
            const isThisCorrect = index === currentQuestion.correctAnswer;
            
            // Determine styling state
            let stateStyle = "border-slate-200 hover:border-dajaem-green/50 hover:bg-slate-50"; // Default
            if (isSelected) {
              stateStyle = "border-dajaem-green bg-dajaem-green/5 text-dajaem-green shadow-glow-green"; // Selected
            }
            if (isRevealed) {
              if (isThisCorrect) {
                stateStyle = "border-dajaem-green bg-dajaem-green text-white shadow-glow-green scale-[1.02]"; // Correct Answer
              } else if (isSelected && !isThisCorrect) {
                stateStyle = "border-red-500 bg-red-50 text-red-500"; // Wrong Selection
              } else {
                stateStyle = "border-slate-100 opacity-50 grayscale"; // Others
              }
            }

            return (
              <motion.button
                key={`${currentQuestion.id}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(index)}
                disabled={hasAnsweredCurrent || isRevealed}
                className={cn(
                  "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-300 ease-out-expo group",
                  "flex items-center justify-between",
                  stateStyle
                )}
              >
                <span className={cn(
                  "font-semibold text-lg", 
                  isRevealed && isThisCorrect ? "text-white" : ""
                )}>
                  {option}
                </span>

                {/* Status Icons */}
                <div className="relative">
                  {isSubmitting && isSelected && !hasAnsweredCurrent && (
                    <Loader2 className="w-5 h-5 animate-spin text-dajaem-green" />
                  )}
                  {hasAnsweredCurrent && isSelected && !isRevealed && (
                    <div className="w-5 h-5 bg-dajaem-green rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {isRevealed && isThisCorrect && (
                    <Check className="w-6 h-6 text-white stroke-[3px]" />
                  )}
                  {isRevealed && isSelected && !isThisCorrect && (
                    <X className="w-6 h-6 text-red-500 stroke-[3px]" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Result / Feedback Message */}
      <AnimatePresence>
        {isRevealed && hasAnsweredCurrent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "p-4 rounded-xl text-center border-2 shadow-lg",
              isCorrect 
                ? "bg-dajaem-green/10 border-dajaem-green/30 text-dajaem-green" 
                : "bg-red-50 border-red-200 text-red-500"
            )}
          >
            <div className="flex flex-col items-center gap-2">
              {isCorrect ? (
                <>
                  <Trophy className="w-8 h-8 fill-dajaem-green/20" />
                  <div>
                    <p className="font-bold text-lg">정답입니다! +{currentQuestion.points}점</p>
                    <p className="text-xs opacity-80">훌륭해요!</p>
                  </div>
                </>
              ) : (
                <>
                  <X className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">아쉽네요!</p>
                    <p className="text-xs opacity-80">다음 문제에서 만회해봐요.</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      {!isRevealed && (
        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest animate-pulse">
            {hasAnsweredCurrent ? "Waiting for results..." : "Select an answer"}
          </p>
        </div>
      )}
    </div>
  );
}
