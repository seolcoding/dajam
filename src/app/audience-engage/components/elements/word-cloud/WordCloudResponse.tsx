'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useElementResponses } from '@/lib/realtime/hooks/useElementResponses';
import type { SessionElement } from '@/types/database';
import type {
  WordCloudElementConfig,
  WordCloudElementState,
  WordCloudResponseData,
} from '@/lib/elements/types';

// ============================================
// Types
// ============================================

interface WordCloudResponseProps {
  element: SessionElement;
  sessionId: string;
  participantId?: string;
  userId?: string;
  anonymousId?: string;
  displayName?: string;
  className?: string;
}

// ============================================
// Component
// ============================================

export function WordCloudResponse({
  element,
  sessionId,
  participantId,
  userId,
  anonymousId,
  displayName,
  className,
}: WordCloudResponseProps) {
  const config = element.config as unknown as WordCloudElementConfig;
  const state = (element.state || {}) as unknown as WordCloudElementState;

  // 로컬 상태
  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);

  // 응답 훅
  const {
    responses,
    submitResponse,
    error: responseError,
  } = useElementResponses<WordCloudResponseData>({
    elementId: element.id,
    sessionId,
    participantId,
    userId,
    anonymousId,
    responseType: 'text',
  });

  // 내가 제출한 단어 목록
  const myWords = useMemo(() => {
    const myResponses = responses.filter((r) => {
      if (participantId && r.participant_id === participantId) return true;
      if (userId && r.user_id === userId) return true;
      if (anonymousId && r.anonymous_id === anonymousId) return true;
      return false;
    });
    return myResponses.map((r) => (r.data as unknown as WordCloudResponseData).word);
  }, [responses, participantId, userId, anonymousId]);

  const canSubmitMore = myWords.length < config.maxWordsPerPerson;
  const isOpen = state.isOpen !== false; // 기본값 true

  // ============================================
  // Handlers
  // ============================================

  const handleSubmit = useCallback(async () => {
    const word = inputValue.trim();

    if (!word) return;

    // 유효성 검사
    if (word.length < config.minLength) {
      alert(`최소 ${config.minLength}자 이상 입력해주세요.`);
      return;
    }

    if (word.length > config.maxLength) {
      alert(`최대 ${config.maxLength}자까지 입력할 수 있습니다.`);
      return;
    }

    // 중복 체크 (대소문자 무시)
    if (!config.allowDuplicates) {
      const normalizedWord = config.caseSensitive ? word : word.toLowerCase();
      const existingWords = myWords.map((w) =>
        config.caseSensitive ? w : w.toLowerCase()
      );
      if (existingWords.includes(normalizedWord)) {
        alert('이미 제출한 단어입니다.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const responseData: WordCloudResponseData = {
        word: config.caseSensitive ? word : word.toLowerCase(),
      };

      await submitResponse(responseData, { displayName });
      setSubmittedWords((prev) => [...prev, word]);
      setInputValue('');
    } finally {
      setIsSubmitting(false);
    }
  }, [inputValue, config, myWords, submitResponse, displayName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  // ============================================
  // Render: 마감됨
  // ============================================

  if (!isOpen) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">단어 수집 마감</h3>
        <p className="text-gray-500">총 {state.totalWords || 0}개의 단어가 수집되었습니다</p>

        {myWords.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">내가 제출한 단어</p>
            <div className="flex flex-wrap justify-center gap-2">
              {myWords.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // Render: 입력 UI
  // ============================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Prompt */}
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{config.prompt}</h3>
        <p className="text-gray-500">
          {config.maxWordsPerPerson - myWords.length}개 더 제출할 수 있습니다
        </p>
      </div>

      {/* Input */}
      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="단어를 입력하세요"
          disabled={!canSubmitMore || isSubmitting}
          className="pr-12 py-6 text-lg text-center rounded-xl"
          maxLength={config.maxLength}
        />
        <Button
          onClick={handleSubmit}
          disabled={!inputValue.trim() || !canSubmitMore || isSubmitting}
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Character count */}
      <div className="flex justify-between text-sm text-gray-400">
        <span>
          {config.minLength}~{config.maxLength}자
        </span>
        <span>
          {inputValue.length} / {config.maxLength}
        </span>
      </div>

      {/* Error */}
      {responseError && (
        <p className="text-sm text-red-500 text-center">{responseError}</p>
      )}

      {/* My submitted words */}
      {myWords.length > 0 && (
        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500 mb-3 text-center">
            내가 제출한 단어 ({myWords.length}/{config.maxWordsPerPerson})
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <AnimatePresence>
              {myWords.map((word, index) => (
                <motion.span
                  key={`${word}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-medium shadow-md"
                >
                  {word}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Max reached */}
      {!canSubmitMore && (
        <div className="text-center py-4 bg-emerald-50 rounded-xl">
          <Check className="w-6 h-6 mx-auto text-emerald-500 mb-2" />
          <p className="text-emerald-700 font-medium">
            최대 제출 수에 도달했습니다
          </p>
        </div>
      )}
    </div>
  );
}

export default WordCloudResponse;
