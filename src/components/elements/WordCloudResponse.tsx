'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import { useElementAggregates } from '@/lib/realtime/hooks/useElementAggregates';
import { 
  WordCloudElementConfig, 
  WordCloudResponseData,
  isWordCloudConfig 
} from '@/lib/elements/types';
import type { SessionElement } from '@/types/database';

interface WordCloudResponseProps {
  element: SessionElement;
  participantId?: string;
  userId?: string;
  className?: string;
}

export function WordCloudResponse({ 
  element, 
  participantId, 
  userId,
  className 
}: WordCloudResponseProps) {
  // 1. Config Validation
  const config = element.config as unknown as WordCloudElementConfig;
  if (!isWordCloudConfig(config)) {
    return <div className="text-red-500">Invalid Word Cloud Configuration</div>;
  }

  // 2. State Hooks
  const { 
    submitResponse, 
    myResponse, // Note: In Word Cloud, users might submit multiple words.
                // Current hook design assumes one response per user. 
                // We might need to refactor hook or use 'update' to append words.
                // For MVP, let's allow single submission or multiple if DB allows (it doesn't by default unique constraint).
                // WORKAROUND: For Word Cloud, we might rely on the Host's aggregates primarily, 
                // and local state for "what I submitted". 
                // OR, we assume 1 submission = 1 word for now.
    isLoading: isSubmitting 
  } = useElementResponses<WordCloudResponseData>({
    elementId: element.id,
    sessionId: element.session_id,
    participantId,
    userId,
    responseType: 'text', // 'text' type for word cloud
  });

  const { 
    aggregates,
    countMap, 
    totalCount 
  } = useElementAggregates({
    elementId: element.id,
    realtime: true,
  });

  // Local state
  const [inputValue, setInputValue] = useState('');
  const [submittedWords, setSubmittedWords] = useState<string[]>([]); // Track locally for animation

  // 3. Handlers
  const handleSubmit = async () => {
    const word = inputValue.trim();
    if (!word) return;

    if (config.minLength && word.length < config.minLength) {
      alert(`최소 ${config.minLength}글자 이상 입력해주세요.`);
      return;
    }

    // Attempt submit
    // Since useElementResponses enforces 1 response per user, 
    // multiple submissions will fail with "Already responded" unless we update.
    // For a true Word Cloud, we often want multiple words.
    // Strategy: If responded, we UPDATE the response by appending the word to an array in 'data'.
    
    try {
      if (myResponse) {
        // Update existing response
        const currentData = myResponse.data as unknown as { words: string[] };
        const newWords = [...(currentData.words || []), word];
        
        // This requires 'updateResponse' to be exposed and working. 
        // Let's assume useElementResponses supports update.
        // But wait, the hook returns 'hasResponded' which blocks UI in some cases.
        // We'll skip useElementResponses's internal check and call submit/update manually?
        // Actually, let's stick to 1 word per person for the MVP Prototype to ensure stability first.
        // It's a "One Word" challenge.
        alert("한 단어만 제출할 수 있습니다 (프로토타입 제한)");
        return;
      } 

      await submitResponse({ word });
      setSubmittedWords(prev => [...prev, word]);
      setInputValue('');
    } catch (e) {
      console.error(e);
    }
  };

  // 4. Word Cloud Visualization (Simple CSS Scale)
  // Normalize sizes: min 12px, max 48px
  const maxCount = Math.max(...aggregates.map(a => a.count), 1);
  
  const getFontSize = (count: number) => {
    const minSize = 14;
    const maxSize = 60;
    const scale = (count / maxCount);
    return minSize + (scale * (maxSize - minSize));
  };

  const getColor = (index: number) => {
    const colors = [
      'text-dajaem-green-600', 
      'text-dajaem-teal-600', 
      'text-dajaem-yellow-600',
      'text-blue-500',
      'text-purple-500',
      'text-pink-500'
    ];
    return colors[index % colors.length];
  };

  // 5. Render
  const hasSubmitted = !!myResponse;

  return (
    <div className={cn("w-full max-w-lg mx-auto flex flex-col h-full", className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-dajaem-green/10 rounded-full mb-3">
          <Cloud className="w-8 h-8 text-dajaem-green" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {element.title || config.prompt || "워드 클라우드"}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {hasSubmitted ? "참여해주셔서 감사합니다!" : "생각나는 단어를 입력해주세요"}
        </p>
      </div>

      {/* Cloud Display Area */}
      <Card className="flex-1 min-h-[300px] p-6 bg-slate-50/50 flex flex-wrap items-center justify-center content-center gap-x-4 gap-y-2 overflow-hidden relative">
        {aggregates.length === 0 && (
          <div className="text-slate-400 text-sm animate-pulse">
            첫 번째 단어를 기다리고 있어요...
          </div>
        )}
        
        <AnimatePresence>
          {aggregates.map((agg, i) => (
            <motion.span
              key={agg.aggregate_key}
              layout
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 20,
                delay: i * 0.05 
              }}
              className={cn(
                "font-bold leading-none select-none cursor-default mix-blend-multiply dark:mix-blend-normal",
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
      </Card>

      {/* Input Area */}
      <div className="mt-6">
        {!hasSubmitted ? (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="단어 입력..."
              className="h-12 text-lg"
              maxLength={config.maxLength || 20}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={isSubmitting}
            />
            <Button 
              size="lg" 
              className="h-12 w-12 bg-dajaem-green hover:bg-dajaem-green-600 shadow-glow-green"
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center p-4 bg-dajaem-green/5 rounded-xl border border-dajaem-green/20">
            <p className="text-dajaem-green font-medium">
              "{myResponse.data && (myResponse.data as any).word}" 제출됨
            </p>
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest">
          <span>Total Words: {totalCount}</span>
          <span>Max Length: {config.maxLength}</span>
        </div>
      </div>
    </div>
  );
}
