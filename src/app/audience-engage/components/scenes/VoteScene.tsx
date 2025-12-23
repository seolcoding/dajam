'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Check, BarChart3 } from 'lucide-react';
import { useSupabase } from '@/hooks/useSupabase';
import { motion, AnimatePresence } from 'framer-motion';

export interface VoteSceneProps {
  sessionId: string;
  isHost: boolean;
  participantId?: string;
  participantName?: string;
}

interface VoteOption {
  id: string;
  text: string;
  votes: number;
}

interface VoteState {
  question: string;
  options: VoteOption[];
  isActive: boolean;
  showResults: boolean;
  totalVotes: number;
}

/**
 * VoteScene - Live Voting wrapper for audience-engage
 */
export function VoteScene({
  sessionId,
  isHost,
  participantId,
}: VoteSceneProps) {
  const supabase = useSupabase();
  const [state, setState] = useState<VoteState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Load session state
  useEffect(() => {
    if (!supabase || !sessionId) return;

    const loadState = async () => {
      setIsLoading(true);
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
          .from('vote_sessions')
          .select('*')
          .eq('session_id', sessionId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to load vote state:', error);
        }

        if (data) {
          const totalVotes = data.options?.reduce(
            (sum: number, opt: VoteOption) => sum + (opt.votes || 0),
            0
          ) || 0;

          setState({
            question: data.question || '투표해주세요',
            options: data.options || [],
            isActive: data.is_active ?? true,
            showResults: data.show_results ?? false,
            totalVotes,
          });

          // Check if participant already voted
          if (participantId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: voteData } = await (supabase as any)
              .from('vote_submissions')
              .select('option_id')
              .eq('session_id', sessionId)
              .eq('participant_id', participantId)
              .single();

            if (voteData) {
              setSelectedOption(voteData.option_id);
              setHasVoted(true);
            }
          }
        } else {
          // Default state
          setState({
            question: '투표해주세요',
            options: [],
            isActive: true,
            showResults: false,
            totalVotes: 0,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadState();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`vote:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vote_sessions',
          filter: `session_id=eq.${sessionId}`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          if (payload.new) {
            const data = payload.new;
            const totalVotes = data.options?.reduce(
              (sum: number, opt: VoteOption) => sum + (opt.votes || 0),
              0
            ) || 0;

            setState({
              question: data.question || '투표해주세요',
              options: data.options || [],
              isActive: data.is_active ?? true,
              showResults: data.show_results ?? false,
              totalVotes,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, sessionId, participantId]);

  // Submit vote (participant)
  const handleVote = useCallback(
    async (optionId: string) => {
      if (!supabase || !participantId || hasVoted || !state?.isActive) return;

      setSelectedOption(optionId);
      setHasVoted(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('vote_submissions').insert({
        session_id: sessionId,
        participant_id: participantId,
        option_id: optionId,
      });

      // Increment vote count (use RPC for atomic update)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).rpc('increment_vote', {
        p_session_id: sessionId,
        p_option_id: optionId,
      });
    },
    [supabase, sessionId, participantId, hasVoted, state?.isActive]
  );

  // Toggle results visibility (host)
  const handleToggleResults = useCallback(async () => {
    if (!supabase || !isHost) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('vote_sessions')
      .update({ show_results: !state?.showResults })
      .eq('session_id', sessionId);
  }, [supabase, sessionId, isHost, state?.showResults]);

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

  // No data
  if (!state || state.options.length === 0) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardContent className="text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-xl font-semibold mb-2">실시간 투표</p>
          <p className="text-muted-foreground mb-4">
            {isHost ? '투표를 설정하세요' : '투표가 시작되면 참여할 수 있습니다'}
          </p>
          {isHost && <Button variant="outline">투표 만들기</Button>}
        </CardContent>
      </Card>
    );
  }

  const showResults = isHost || state.showResults || hasVoted;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{state.question}</h2>
        {isHost && (
          <Button variant="outline" size="sm" onClick={handleToggleResults}>
            <BarChart3 className="w-4 h-4 mr-1" />
            {state.showResults ? '결과 숨기기' : '결과 보기'}
          </Button>
        )}
      </div>

      {/* Total votes */}
      <Badge variant="secondary" className="w-fit mb-4">
        총 {state.totalVotes}표
      </Badge>

      {/* Options */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        <AnimatePresence>
          {state.options.map((option, index) => {
            const percentage = state.totalVotes > 0
              ? Math.round((option.votes / state.totalVotes) * 100)
              : 0;
            const isSelected = selectedOption === option.id;

            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted || !state.isActive}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                    ${hasVoted || !state.isActive ? 'cursor-default' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{option.text}</span>
                    {isSelected && <Check className="w-5 h-5 text-blue-500" />}
                  </div>

                  {showResults && (
                    <>
                      <Progress value={percentage} className="h-2 mb-1" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{option.votes}표</span>
                        <span>{percentage}%</span>
                      </div>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Status */}
      {!state.isActive && (
        <div className="text-center py-4 text-muted-foreground">
          투표가 종료되었습니다
        </div>
      )}
    </div>
  );
}

export default VoteScene;
