'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Cloud, Trophy, Users, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import { 
  PollElementConfig, 
  QuizElementConfig, 
  WordCloudElementConfig,
  BalanceGameElementConfig,
  BalanceGameElementState,
  isPollConfig,
  isQuizConfig,
  isWordCloudConfig,
  isBalanceGameConfig,
  QuizElementState
} from '@/lib/elements/types';
import type { SessionElement } from '@/types/database';

interface HostActiveElementProps {
  element: SessionElement;
  onClose: () => void;
}

export function HostActiveElement({ element, onClose }: HostActiveElementProps) {
  // Render based on type
  return (
    <Card className="h-full flex flex-col overflow-hidden bg-white shadow-lg border-2 border-dajaem-green/20 relative">
      <div className="absolute top-4 right-4 z-10">
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-50 hover:text-red-500">
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[400px]">
        {element.element_type === 'poll' && <HostPollView element={element} />}
        {element.element_type === 'quiz' && <HostQuizView element={element} />}
        {element.element_type === 'word_cloud' && <HostWordCloudView element={element} />}
        {element.element_type === 'balance_game' && <HostBalanceGameView element={element} />}
      </div>
    </Card>
  );
}

// ============================================================================
// Host Balance Game View
// ============================================================================

function HostBalanceGameView({ element }: { element: SessionElement }) {
  const config = element.config as unknown as BalanceGameElementConfig;
  const state = element.state as unknown as BalanceGameElementState;
  const { totalCount, getPercentageByKey } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  const currentQuestion = config.questions[state.currentQuestionIndex || 0];
  const perA = getPercentageByKey('a');
  const perB = getPercentageByKey('b');

  if (!isBalanceGameConfig(config)) return <div>Invalid Config</div>;

  return (
    <div className="w-full max-w-4xl space-y-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-2">밸런스 게임 진행 중</h2>
        <p className="text-xl text-slate-500 font-medium">{totalCount}명 참여 완료</p>
      </div>

      <div className="flex items-stretch justify-center gap-8 h-[300px]">
        <div className="flex-1 flex flex-col items-center justify-end gap-4">
          <div className="text-2xl font-bold text-slate-700">{currentQuestion.optionA.text}</div>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${perA + 10}%` }}
            className="w-full rounded-t-3xl shadow-glow-green"
            style={{ backgroundColor: currentQuestion.optionA.color || '#03C75A' }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-white text-5xl font-black">{Math.round(perA)}%</span>
            </div>
          </motion.div>
        </div>

        <div className="w-px bg-slate-200 self-center h-full relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 border-2 rounded-full font-black text-dajaem-red italic">VS</div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-end gap-4">
          <div className="text-2xl font-bold text-slate-700">{currentQuestion.optionB.text}</div>
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${perB + 10}%` }}
            className="w-full rounded-t-3xl shadow-glow-blue"
            style={{ backgroundColor: currentQuestion.optionB.color || '#0066FF' }}
          >
            <div className="h-full flex items-center justify-center">
              <span className="text-white text-5xl font-black">{Math.round(perB)}%</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Host Poll View
// ============================================================================

function HostPollView({ element }: { element: SessionElement }) {
  const config = element.config as unknown as PollElementConfig;
  const { totalCount, getPercentageByKey, countMap } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  if (!isPollConfig(config)) return <div>Invalid Config</div>;

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="text-center space-y-2">
        <BadgeIcon icon={BarChart3} />
        <h2 className="text-3xl font-bold text-slate-900">{element.title}</h2>
        <p className="text-slate-500 font-medium">{totalCount}명 참여 중</p>
      </div>

      <div className="space-y-4">
        {config.options.map((option, index) => {
          const percentage = getPercentageByKey(option.id);
          const count = countMap[option.id] || 0;

          return (
            <div key={option.id} className="space-y-2">
              <div className="flex justify-between items-end px-1">
                <span className="font-bold text-lg text-slate-700">{option.text}</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-dajaem-green font-display">{Math.round(percentage)}%</span>
                  <span className="text-sm text-slate-400 ml-2 font-medium">({count}명)</span>
                </div>
              </div>
              <div className="h-6 bg-slate-100 rounded-full overflow-hidden relative">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-dajaem-green"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ type: "spring", stiffness: 50, damping: 15 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Host Quiz View
// ============================================================================

function HostQuizView({ element }: { element: SessionElement }) {
  const config = element.config as unknown as QuizElementConfig;
  const state = element.state as unknown as QuizElementState;
  const { totalCount } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  const currentQuestionIndex = state.currentQuestionIndex || 0;
  const currentQuestion = config.questions[currentQuestionIndex];

  if (!isQuizConfig(config)) return <div>Invalid Config</div>;

  return (
    <div className="w-full max-w-3xl text-center space-y-8">
      <div className="space-y-4">
        <BadgeIcon icon={Trophy} />
        <div className="inline-block bg-dajaem-green/10 text-dajaem-green px-3 py-1 rounded-full text-sm font-bold">
          Q{currentQuestionIndex + 1} / {config.questions.length}
        </div>
        <h2 className="text-4xl font-bold text-slate-900 leading-tight">
          {currentQuestion.text}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        {currentQuestion.options?.map((option, index) => (
          <div 
            key={index}
            className={cn(
              "p-6 rounded-2xl border-2 text-xl font-bold transition-all",
              state.isRevealed && index === currentQuestion.correctAnswer
                ? "bg-dajaem-green text-white border-dajaem-green shadow-glow-green scale-105"
                : "bg-white border-slate-200 text-slate-700 opacity-50"
            )}
          >
            {option}
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center gap-8 text-slate-500">
        <div className="flex flex-col items-center">
          <Users className="w-6 h-6 mb-1" />
          <span className="text-2xl font-bold text-slate-900">{totalCount}</span>
          <span className="text-xs uppercase tracking-wider">Answers</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Host Word Cloud View
// ============================================================================

function HostWordCloudView({ element }: { element: SessionElement }) {
  const config = element.config as unknown as WordCloudElementConfig;
  const { aggregates, totalCount } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  if (!isWordCloudConfig(config)) return <div>Invalid Config</div>;

  // Simple Word Cloud Logic (Same as Participant but bigger)
  const maxCount = Math.max(...aggregates.map(a => a.count), 1);
  
  const getFontSize = (count: number) => {
    const minSize = 24;
    const maxSize = 96;
    const scale = (count / maxCount);
    return minSize + (scale * (maxSize - minSize));
  };

  const getColor = (index: number) => {
    const colors = [
      'text-dajaem-green-600', 
      'text-dajaem-teal-600', 
      'text-dajaem-yellow-600',
      'text-blue-600',
      'text-purple-600',
      'text-pink-600'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center mb-8 flex-shrink-0">
        <BadgeIcon icon={Cloud} />
        <h2 className="text-3xl font-bold text-slate-900 mt-2">{element.title || "워드 클라우드"}</h2>
        <p className="text-slate-500 font-medium">{totalCount}개의 단어가 모였습니다</p>
      </div>

      <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-x-8 gap-y-4 p-4 overflow-hidden">
        <AnimatePresence>
          {aggregates.map((agg, i) => (
            <motion.span
              key={agg.aggregate_key}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: i * 0.05 
              }}
              className={cn(
                "font-bold leading-none select-none cursor-default",
                getColor(i)
              )}
              style={{ 
                fontSize: `${getFontSize(agg.count)}px`,
                zIndex: Math.floor(agg.count * 10)
              }}
            >
              {agg.aggregate_key}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper
function BadgeIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="inline-flex items-center justify-center p-4 bg-dajaem-green/10 rounded-full mb-2">
      <Icon className="w-8 h-8 text-dajaem-green" />
    </div>
  );
}
