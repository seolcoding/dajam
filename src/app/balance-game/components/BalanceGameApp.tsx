'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { categoryMetadata } from '../data/categories';
import { questionTemplates } from '../data/templates';
import type { Category, Question } from '../types';
import { Plus, Shuffle, ArrowLeft, Sparkles, RefreshCw, Home, Users, Scale, Presentation } from 'lucide-react';
import QuestionCard from './QuestionCard';
import ResultChart from './ResultChart';
import ShareButton from './ShareButton';
import CustomQuestionForm from './CustomQuestionForm';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AppHeader, AppFooter } from '@/components/layout';
import { MultiplayerEntry } from '@/components/entry';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getQuestionById,
  saveVote,
  incrementVote,
  getQuestionStats,
  getVotes,
  saveCustomQuestion
} from '../utils/storage';

type ViewMode = 'home' | 'game' | 'result' | 'create';
type GameMode = 'solo' | 'session';

const BalanceGameApp: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [stats, setStats] = useState<{ A: number; B: number } | null>(null);
  const [myChoice, setMyChoice] = useState<'A' | 'B' | undefined>(undefined);
  const [fadeIn, setFadeIn] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);

  // Handle URL changes
  useEffect(() => {
    const view = searchParams.get('view') || 'home';
    const id = searchParams.get('id');

    if (view === 'game' && id) {
      loadQuestion(id);
      setViewMode('game');
    } else if (view === 'result' && id) {
      loadResult(id);
      setViewMode('result');
    } else if (view === 'create') {
      setViewMode('create');
    } else {
      setViewMode('home');
    }

    // Trigger fade in animation
    setTimeout(() => setFadeIn(true), 50);
  }, [searchParams]);

  const loadQuestion = (id: string) => {
    // Find template question
    let found: Question | null = null;
    for (const category in questionTemplates) {
      const questions = questionTemplates[category as keyof typeof questionTemplates];
      found = questions.find((q) => q.id === id) || null;
      if (found) break;
    }

    // Find custom question
    if (!found) {
      found = getQuestionById(id);
    }

    setCurrentQuestion(found);
  };

  const loadResult = (id: string) => {
    // Find question
    let found: Question | null = null;
    for (const category in questionTemplates) {
      const questions = questionTemplates[category as keyof typeof questionTemplates];
      found = questions.find((q) => q.id === id) || null;
      if (found) break;
    }

    if (!found) {
      found = getQuestionById(id);
    }

    setCurrentQuestion(found);

    // Get statistics
    if (found) {
      const voteStats = getQuestionStats(found.id);
      setStats(voteStats);

      const votes = getVotes();
      setMyChoice(votes[found.id]);
    }
  };

  const navigateTo = (view: ViewMode, id?: string) => {
    const params = new URLSearchParams();
    params.set('view', view);
    if (id) params.set('id', id);
    router.push(`?${params.toString()}`);
  };

  const handleRandomQuestion = () => {
    const categories = Object.keys(questionTemplates) as Category[];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const questions = questionTemplates[randomCategory];
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    navigateTo('game', randomQuestion.id);
  };

  const handleCategorySelect = (category: Category) => {
    const questions = questionTemplates[category];
    if (questions.length > 0) {
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      navigateTo('game', randomQuestion.id);
    }
  };

  const handleSelect = (choice: 'A' | 'B') => {
    if (!currentQuestion) return;

    saveVote(currentQuestion.id, choice);
    incrementVote(currentQuestion.id, choice);
    navigateTo('result', currentQuestion.id);
  };

  const handleQuestionCreate = (question: Question) => {
    saveCustomQuestion(question);
    const url = `${window.location.origin}/balance-game?view=game&id=${question.id}`;
    setShareUrl(url);
    setQuestionId(question.id);
  };

  const handlePlayAgain = () => {
    navigateTo('home');
  };

  // Session mode handlers
  const handleHostStart = () => {
    router.push('/balance-game/session/create');
  };

  const handleParticipantJoin = ({ code }: { code: string; name: string }) => {
    router.push(`/balance-game/session/play/${code}`);
  };

  // Render Home Page
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AppHeader
          title="밸런스 게임"
          description="A vs B, 당신의 선택은?"
          icon={Scale}
          iconGradient="from-blue-500 to-purple-600"
          variant="compact"
        />
        <div className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">

          {/* Mode Selector Tabs */}
          <div className="max-w-lg mx-auto mb-8">
            <Tabs value={gameMode} onValueChange={(v) => setGameMode(v as GameMode)}>
              <TabsList className="grid w-full grid-cols-2 h-auto p-1">
                <TabsTrigger
                  value="solo"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-white"
                >
                  <Scale className="w-4 h-4" />
                  <span className="font-semibold">혼자 플레이</span>
                </TabsTrigger>
                <TabsTrigger
                  value="session"
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-white"
                >
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">세션 모드</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Solo Mode Content */}
          {gameMode === 'solo' && (
            <>
              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                <button
                  onClick={handleRandomQuestion}
                  className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition shadow-lg"
                >
                  <Shuffle size={24} />
                  랜덤 질문
                </button>
                <button
                  onClick={() => navigateTo('create')}
                  className="flex items-center gap-2 px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-bold text-lg transition shadow-lg"
                >
                  <Plus size={24} />
                  질문 만들기
                </button>
              </div>

              {/* Category grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {(Object.keys(categoryMetadata) as Category[]).map((category) => {
                  const meta = categoryMetadata[category];
                  const questionCount = questionTemplates[category]?.length || 0;

                  return (
                    <button
                      key={category}
                      onClick={() => handleCategorySelect(category)}
                      className={`
                        ${meta.color} text-white p-8 rounded-2xl shadow-lg
                        hover:scale-105 transition-transform cursor-pointer
                        flex flex-col items-center gap-4
                      `}
                    >
                      <div className="text-6xl">{meta.emoji}</div>
                      <div className="text-2xl font-bold">{meta.label}</div>
                      <div className="text-sm opacity-90">{questionCount}개 질문</div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Session Mode Content */}
          {gameMode === 'session' && (
            <>
              <MultiplayerEntry
                onHostStart={handleHostStart}
                onParticipantJoin={handleParticipantJoin}
                hostTitle="밸런스 게임 세션 시작"
                hostDescription="호스트가 되어 질문을 컨트롤하세요"
                participantTitle="세션 참여"
                participantDescription="호스트가 공유한 6자리 코드로 참여하세요"
                hostButtonText="세션 시작하기"
                participantButtonText="참여하기"
                requireName={false}
                featureBadges={['실시간 투표', '결과 공유', '프레젠테이션 모드']}
              />

              {/* Feature Cards */}
              <div className="max-w-lg mx-auto mt-12 grid gap-4">
                <FeatureCard
                  emoji="🎤"
                  title="프레젠테이션 모드"
                  description="발표자용 대화면에서 투표 현황을 실시간으로 확인"
                />
                <FeatureCard
                  emoji="📱"
                  title="모바일 최적화"
                  description="참여자는 모바일에서 간편하게 투표"
                />
                <FeatureCard
                  emoji="📊"
                  title="실시간 결과"
                  description="투표 결과를 즉시 시각화하여 공유"
                />
              </div>
            </>
          )}
        </div>
        <AppFooter variant="compact" />
      </div>
    );
  }

  // Render Game Page
  if (viewMode === 'game') {
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900 mb-2">질문을 찾을 수 없습니다</p>
              <p className="text-gray-600">존재하지 않는 질문이거나 삭제된 질문입니다.</p>
            </div>
            <Button
              onClick={() => navigateTo('home')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-white py-8 px-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <Button
            variant="ghost"
            onClick={() => navigateTo('home')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            돌아가기
          </Button>
        </div>

        {/* Question card with fade-in animation */}
        <div className={`transition-all duration-700 ${
          fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <QuestionCard question={currentQuestion} onSelect={handleSelect} />
        </div>
      </div>
    );
  }

  // Render Result Page
  if (viewMode === 'result') {
    if (!currentQuestion || !stats) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-6">
            <LoadingSpinner />
            <p className="text-xl font-semibold text-gray-600">결과를 불러오는 중...</p>
          </div>
        </div>
      );
    }

    const totalVotes = stats.A + stats.B;
    const percentageA = (stats.A / totalVotes) * 100;
    const percentageB = (stats.B / totalVotes) * 100;

    return (
      <div className="min-h-screen bg-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className={`flex items-center justify-between mb-12 transition-all duration-500 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <Button
              variant="ghost"
              onClick={() => navigateTo('home')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              돌아가기
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={handlePlayAgain}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                다른 질문 하기
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo('home')}
              >
                <Home className="w-5 h-5 mr-2" />
                홈으로
              </Button>
            </div>
          </div>

          {/* Result chart with staggered animation */}
          <div className={`transition-all duration-700 delay-150 ${
            fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <ResultChart question={currentQuestion} stats={stats} myChoice={myChoice} />
          </div>

          {/* Share buttons with delayed animation */}
          {myChoice && (
            <div className={`mt-12 transition-all duration-700 delay-300 ${
              fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <ShareButton
                imageOptions={{
                  question: currentQuestion,
                  myChoice,
                  stats,
                  percentageA,
                  percentageB,
                }}
                questionId={currentQuestion.id}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Create Page
  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              돌아가기
            </button>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles size={24} />
              <h1 className="text-2xl font-bold">나만의 질문 만들기</h1>
            </div>
          </div>

          {/* Form */}
          <CustomQuestionForm onSubmit={handleQuestionCreate} />

          {/* Share URL */}
          {shareUrl && questionId && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-green-600">질문이 생성되었습니다!</h3>
              <p className="text-gray-700 mb-2">아래 링크를 공유하세요:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('링크가 복사되었습니다!');
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  복사
                </button>
              </div>
              <button
                onClick={() => navigateTo('game', questionId)}
                className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                바로 플레이하기
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

// Simple Feature Card Component
function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200">
      <span className="text-2xl">{emoji}</span>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

export default BalanceGameApp;
