'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Plus, Play } from 'lucide-react';
import { useRealtimeSession } from '@/lib/realtime';
import { useSupabase } from '@/hooks/useSupabase';
import { HostView } from './HostView';
import { ParticipantView } from './ParticipantView';
import { questionTemplates, categoryMetadata, type QuestionCategory } from '../data/questions';
import type { ThisOrThatConfig, ThisOrThatQuestion, VoteCount, QuestionStatus } from '../types';
import type { Json } from '@/types/database';

type ViewMode = 'home' | 'host' | 'participant';

interface Vote {
  id: string;
  session_id: string;
  question_id: string;
  participant_id: string;
  choice: 'A' | 'B';
  created_at: string;
}

export default function ThisOrThatApp() {
  const router = useRouter();
  const supabase = useSupabase();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [myParticipantId, setMyParticipantId] = useState<string | null>(null);

  // Host setup
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('icebreaker');
  const [selectedQuestions, setSelectedQuestions] = useState<ThisOrThatQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus>('waiting');

  // Realtime session
  const {
    session,
    participants,
    data: votes,
    isLoading,
    error,
    connectionStatus,
    createSession,
    joinSession,
    loadData,
  } = useRealtimeSession<ThisOrThatConfig, Vote>({
    appType: 'this-or-that',
    sessionCode: viewMode === 'home' ? '' : sessionCode,
    enabled: viewMode !== 'home' && !!sessionCode,
    dataTable: 'votes',
    dataEvent: 'INSERT',
    transformConfig: (config: Json) => config as unknown as ThisOrThatConfig,
    transformData: (rows: unknown[]) => rows as Vote[],
  });

  const config = session?.config as ThisOrThatConfig | null;
  const questions = config?.questions || selectedQuestions;
  const currentQuestion = questions[currentQuestionIndex] || null;

  // 현재 질문에 대한 투표 집계
  const currentVotes = useMemo(() => {
    if (!currentQuestion) return [];
    return votes.filter(v => v.question_id === currentQuestion.id);
  }, [votes, currentQuestion]);

  const voteCount: VoteCount = useMemo(() => {
    const count = { A: 0, B: 0 };
    currentVotes.forEach(vote => {
      if (vote.choice === 'A') count.A++;
      else if (vote.choice === 'B') count.B++;
    });
    return count;
  }, [currentVotes]);

  // 내가 투표했는지 확인
  const hasVoted = useMemo(() => {
    if (!myParticipantId || !currentQuestion) return false;
    return currentVotes.some(v => v.participant_id === myParticipantId);
  }, [currentVotes, myParticipantId, currentQuestion]);

  // 호스트 세션 생성
  const handleCreateSession = async () => {
    if (selectedQuestions.length === 0) {
      alert('최소 1개 이상의 질문을 선택하세요.');
      return;
    }

    const config: ThisOrThatConfig = {
      title: 'This or That',
      questions: selectedQuestions,
    };

    const code = await createSession({
      appType: 'this-or-that',
      title: 'This or That Session',
      config,
    });

    if (code) {
      setSessionCode(code);
      setViewMode('host');
      setCurrentQuestionIndex(0);
      setQuestionStatus('waiting');
    }
  };

  // 참여자 참여
  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !participantName.trim()) return;

    const participant = await joinSession({
      displayName: participantName.trim(),
      metadata: {},
    });

    if (participant) {
      setMyParticipantId(participant.id);
      setViewMode('participant');
    } else {
      alert('세션 참여에 실패했습니다. 코드를 확인하세요.');
    }
  };

  // 투표 제출
  const handleVote = async (choice: 'A' | 'B') => {
    if (!session?.id || !currentQuestion || !myParticipantId || hasVoted) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('votes')
        .insert({
          session_id: session.id,
          question_id: currentQuestion.id,
          participant_id: myParticipantId,
          choice,
        });

      if (error) {
        console.error('Vote error:', error);
      }
    } catch (err) {
      console.error('Failed to submit vote:', err);
    }
  };

  // 호스트 컨트롤
  const handleStartVoting = () => setQuestionStatus('voting');
  const handleShowResult = () => setQuestionStatus('result');
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStatus('waiting');
    }
  };

  const handleEndSession = () => {
    setViewMode('home');
    setSessionCode('');
    setCurrentQuestionIndex(0);
    setQuestionStatus('waiting');
  };

  // 질문 선택 토글
  const toggleQuestion = (question: ThisOrThatQuestion) => {
    setSelectedQuestions(prev => {
      const exists = prev.find(q => q.id === question.id);
      if (exists) {
        return prev.filter(q => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  // 카테고리 질문 전체 선택
  const selectAllInCategory = () => {
    const categoryQuestions = questionTemplates[selectedCategory];
    setSelectedQuestions(prev => {
      const newIds: string[] = categoryQuestions.map(q => q.id);
      const filtered = prev.filter(q => !newIds.includes(q.id));
      return [...filtered, ...categoryQuestions];
    });
  };

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/this-or-that?code=${sessionCode}`
    : '';

  // Home View
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">This or That</h1>
            <p className="text-xl text-muted-foreground">
              실시간 그룹 투표 게임
            </p>
          </div>

          <Tabs defaultValue="host" className="max-w-2xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="host" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                호스트 (발표자)
              </TabsTrigger>
              <TabsTrigger value="join" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                참여하기
              </TabsTrigger>
            </TabsList>

            {/* Host Setup */}
            <TabsContent value="host" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>세션 생성</CardTitle>
                  <CardDescription>
                    질문을 선택하고 세션을 시작하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Category Selection */}
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(categoryMetadata).map(([key, meta]) => (
                        <Button
                          key={key}
                          variant={selectedCategory === key ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(key as QuestionCategory)}
                        >
                          <span className="mr-2">{meta.emoji}</span>
                          {meta.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Question Selection */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>질문 선택 ({selectedQuestions.length}개)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllInCategory}
                      >
                        전체 선택
                      </Button>
                    </div>
                    <div className="grid gap-2 max-h-64 overflow-y-auto p-2 border rounded-lg">
                      {questionTemplates[selectedCategory].map(q => {
                        const isSelected = selectedQuestions.some(sq => sq.id === q.id);
                        return (
                          <button
                            key={q.id}
                            onClick={() => toggleQuestion(q)}
                            className={`
                              text-left p-3 rounded-lg border-2 transition-all
                              ${isSelected
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            <div className="font-medium">{q.text}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {q.optionA} vs {q.optionB}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateSession}
                    disabled={selectedQuestions.length === 0}
                    size="lg"
                    className="w-full"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    세션 시작 ({selectedQuestions.length}개 질문)
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participant Join */}
            <TabsContent value="join" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>세션 참여</CardTitle>
                  <CardDescription>
                    6자리 코드를 입력하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">세션 코드</Label>
                    <Input
                      id="code"
                      placeholder="ABC123"
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                      maxLength={6}
                      className="text-center text-2xl tracking-wider"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      placeholder="이름을 입력하세요"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      maxLength={20}
                    />
                  </div>

                  <Button
                    onClick={handleJoinSession}
                    disabled={!sessionCode.trim() || !participantName.trim()}
                    size="lg"
                    className="w-full"
                  >
                    참여하기
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Host View
  if (viewMode === 'host') {
    return (
      <HostView
        sessionCode={sessionCode}
        shareUrl={shareUrl}
        currentQuestion={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        participants={participants}
        voteCount={voteCount}
        status={questionStatus}
        onStartVoting={handleStartVoting}
        onShowResult={handleShowResult}
        onNextQuestion={handleNextQuestion}
        onEndSession={handleEndSession}
      />
    );
  }

  // Participant View
  if (viewMode === 'participant') {
    return (
      <ParticipantView
        sessionCode={sessionCode}
        currentQuestion={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        hasVoted={hasVoted}
        onVote={handleVote}
        status={questionStatus}
      />
    );
  }

  return null;
}
