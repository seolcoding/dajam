'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, RefreshCw } from 'lucide-react';
import { WordCloudVisualization } from '@/features/interactions';
import { useSupabase } from '@/hooks/useSupabase';
import type { WordCount, ColorScheme } from '@/features/interactions';

export interface WordCloudSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

interface WordCloudState {
  question: string;
  words: WordCount[];
  colorScheme: ColorScheme;
  isActive: boolean;
  maxWords: number;
}

/**
 * WordCloudScene - Word Cloud wrapper for audience-engage
 */
export function WordCloudScene({
  sessionId,
  isHost,
  participantId,
  participantName,
}: WordCloudSceneProps) {
  const supabase = useSupabase();
  const [state, setState] = useState<WordCloudState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const [submittedWords, setSubmittedWords] = useState<string[]>([]);

  // Load session state
  useEffect(() => {
    if (!supabase || !sessionId) return;

    const loadState = async () => {
      setIsLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('word_cloud_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load word cloud state:', error);
        }

        if (data) {
          setState({
            question: data.question || '한 단어로 표현해주세요',
            words: data.words || [],
            colorScheme: data.color_scheme || 'rainbow',
            isActive: data.is_active ?? true,
            maxWords: data.max_words || 3,
          });
        } else {
          // Default state
          setState({
            question: '한 단어로 표현해주세요',
            words: [],
            colorScheme: 'rainbow',
            isActive: true,
            maxWords: 3,
          });
        }

        // Load participant's submitted words
        if (participantId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: wordData } = await (supabase as any)
            .from('word_cloud_submissions')
            .select('word')
            .eq('session_id', sessionId)
            .eq('participant_id', participantId);

          if (wordData) {
            setSubmittedWords(wordData.map((w: { word: string }) => w.word));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadState();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`word-cloud:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'word_cloud_submissions',
          filter: `session_id=eq.${sessionId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.new) {
            const word = payload.new.word;
            setState((prev) => {
              if (!prev) return prev;
              const existingWord = prev.words.find((w) => w.text.toLowerCase() === word.toLowerCase());
              if (existingWord) {
                return {
                  ...prev,
                  words: prev.words.map((w) =>
                    w.text.toLowerCase() === word.toLowerCase()
                      ? { ...w, value: w.value + 1 }
                      : w
                  ),
                };
              } else {
                return {
                  ...prev,
                  words: [...prev.words, { text: word, value: 1 }],
                };
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sessionId, participantId]);

  // Submit word (participant)
  const handleSubmitWord = useCallback(async () => {
    if (!supabase || !participantId || !inputValue.trim()) return;
    if (submittedWords.length >= (state?.maxWords || 3)) return;

    const word = inputValue.trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('word_cloud_submissions').insert({
      session_id: sessionId,
      participant_id: participantId,
      word,
    });

    setSubmittedWords((prev) => [...prev, word]);
    setInputValue('');
  }, [supabase, sessionId, participantId, inputValue, submittedWords, state?.maxWords]);

  // Clear words (host)
  const handleClearWords = useCallback(async () => {
    if (!supabase || !isHost) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('word_cloud_submissions')
      .delete()
      .eq('session_id', sessionId);

    setState((prev) => (prev ? { ...prev, words: [] } : prev));
  }, [supabase, sessionId, isHost]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  const remainingWords = (state?.maxWords || 3) - submittedWords.length;

  // Host view - Show word cloud visualization
  if (isHost) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-green-50 to-teal-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{state?.question}</h2>
            <p className="text-sm text-muted-foreground">
              {state?.words.length || 0}개의 단어가 제출되었습니다
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearWords}>
            <RefreshCw className="w-4 h-4 mr-1" />
            초기화
          </Button>
        </div>
        <div className="flex-1 bg-white rounded-lg shadow-inner">
          <WordCloudVisualization
            words={state?.words || []}
            colorScheme={state?.colorScheme}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  // Participant view - Submit words
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">{state?.question}</h2>
        <Badge variant="outline">
          남은 횟수: {remainingWords}/{state?.maxWords || 3}
        </Badge>
      </div>

      {/* Word cloud preview */}
      <div className="flex-1 bg-white rounded-lg shadow-inner mb-4 min-h-[200px]">
        <WordCloudVisualization
          words={state?.words || []}
          colorScheme={state?.colorScheme}
          className="h-full"
        />
      </div>

      {/* Input */}
      {remainingWords > 0 && state?.isActive ? (
        <div className="flex gap-2">
          <Input
            placeholder="단어를 입력하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmitWord();
              }
            }}
            maxLength={20}
          />
          <Button onClick={handleSubmitWord} disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          {remainingWords <= 0 ? '모든 단어를 제출했습니다' : '제출이 종료되었습니다'}
        </div>
      )}

      {/* Submitted words */}
      {submittedWords.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {submittedWords.map((word, i) => (
            <Badge key={i} variant="secondary">
              {word}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default WordCloudScene;
