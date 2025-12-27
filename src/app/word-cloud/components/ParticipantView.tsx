'use client';

import { useState, useEffect, useRef } from 'react';
import { useWordCloudStore } from '../store/wordCloudStore';
import { Send, Check, Sparkles, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WordEntry, WordValidationResult } from '../types';
import { getSuggestions, normalizeWord } from '../utils/wordNormalizer';

interface ParticipantViewProps {
  sessionCode: string;
  onSubmitWord: (word: string) => Promise<boolean>;
}

export function ParticipantView({ sessionCode, onSubmitWord }: ParticipantViewProps) {
  const { session, submittedWords, participantName } = useWordCloudStore();
  const [inputWord, setInputWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 입력 변경 시 추천 단어 업데이트
  useEffect(() => {
    if (inputWord.length >= 1) {
      const newSuggestions = getSuggestions(inputWord, 5);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputWord]);

  // 추천 단어 선택
  const handleSelectSuggestion = (suggestion: string) => {
    setInputWord(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">세션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (session.status === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">입력이 마감되었습니다</h2>
          <p className="text-gray-600">
            호스트가 단어 수집을 종료했습니다.
            <br />
            결과는 호스트 화면에서 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  const validateWord = (word: string): WordValidationResult => {
    const trimmed = word.trim();
    const { settings } = session;

    if (trimmed.length === 0) {
      return { valid: false, error: '단어를 입력해주세요.' };
    }

    if (trimmed.length < settings.minWordLength) {
      return {
        valid: false,
        error: `최소 ${settings.minWordLength}글자 이상 입력해주세요.`,
      };
    }

    if (trimmed.length > settings.maxWordLength) {
      return {
        valid: false,
        error: `최대 ${settings.maxWordLength}글자까지 입력 가능합니다.`,
      };
    }

    if (
      !settings.allowDuplicates &&
      submittedWords.some((w) => w.toLowerCase() === trimmed.toLowerCase())
    ) {
      return {
        valid: false,
        error: '이미 제출한 단어입니다.',
      };
    }

    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = inputWord.trim();
    const validation = validateWord(trimmed);

    if (!validation.valid) {
      setValidationError(validation.error || '유효하지 않은 단어입니다.');
      return;
    }

    // Check max words limit
    if (submittedWords.length >= session.settings.maxWordsPerPerson) {
      setValidationError(
        `최대 ${session.settings.maxWordsPerPerson}개까지만 제출할 수 있습니다.`
      );
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    const success = await onSubmitWord(trimmed);

    if (success) {
      setInputWord('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } else {
      setValidationError('단어 제출에 실패했습니다. 다시 시도해주세요.');
    }

    setIsSubmitting(false);
  };

  const remainingWords =
    session.settings.maxWordsPerPerson - submittedWords.length;
  const canSubmitMore = remainingWords > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header - Fixed at top */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles size={18} className="text-white" fill="currentColor" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {sessionCode}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-600">
              {participantName || '참가자'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="max-w-2xl mx-auto">
          {/* Question */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 text-center leading-tight">
              {session.title}
            </h1>
          </div>

          {/* Success Animation */}
          {showSuccess && (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-6 animate-in slide-in-from-bottom">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={24} className="text-white" strokeWidth={3} />
                </div>
                <p className="text-xl font-bold text-green-700">단어가 제출되었습니다!</p>
              </div>
            </div>
          )}

          {/* Submitted Words List */}
          {submittedWords.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                내가 입력한 단어
              </h3>
              <div className="space-y-2">
                {submittedWords.map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                  >
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-lg font-medium text-gray-900">{word}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600 text-center">
                {canSubmitMore ? (
                  <span>
                    앞으로 <strong className="text-blue-600">{remainingWords}개</strong>{' '}
                    더 입력할 수 있습니다
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    모든 단어를 제출했습니다!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Form - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
            {validationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {validationError}
              </div>
            )}

            <div className="relative">
              {/* 추천 단어 목록 */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <Lightbulb size={16} className="text-amber-500" />
                    <span className="text-sm font-medium text-gray-600">추천 단어</span>
                  </div>
                  <div className="p-2 flex flex-wrap gap-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputWord}
                  onChange={(e) => {
                    setInputWord(e.target.value);
                    setValidationError(null);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    // 딜레이로 클릭 이벤트 처리 후 숨김
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder={
                    canSubmitMore
                      ? '단어를 입력하세요...'
                      : '더 이상 입력할 수 없습니다'
                  }
                  disabled={!canSubmitMore || isSubmitting}
                  className="flex-1 text-lg h-14 px-4 border-2 focus:border-blue-500"
                  maxLength={session.settings.maxWordLength}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={!canSubmitMore || isSubmitting || !inputWord.trim()}
                  className="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send size={24} />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {inputWord.length} / {session.settings.maxWordLength}자
              </span>
              <span>
                {submittedWords.length} / {session.settings.maxWordsPerPerson}개 제출
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
