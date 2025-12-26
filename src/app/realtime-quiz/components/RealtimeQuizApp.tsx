'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Users, Sparkles, ArrowLeft, Trophy, Home, Monitor, Smartphone, Loader2 } from 'lucide-react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionCodeInput } from '@/components/entry';
import { useQuizStore } from '../store/quizStore';
import { defaultQuizzes, calculateScore } from '../data/quizzes';
import HostView from './HostView';
import ParticipantView from './ParticipantView';
import Leaderboard from './Leaderboard';
import type { ParticipantAnswer } from '../types';
import { AppHeader, AppFooter } from '@/components/layout';

type ViewMode = 'home' | 'select-quiz' | 'waiting' | 'countdown' | 'playing' | 'leaderboard' | 'finished';
type Role = 'host' | 'participant';

export default function RealtimeQuizApp() {
  const router = useRouter();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [role, setRole] = useState<Role | null>(null);

  // Form state
  const [sessionCode, setSessionCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);

  // Quiz store
  const {
    quiz,
    currentQuestion,
    currentQuestionIndex,
    gameState,
    timeLeft,
    countdownValue,
    participants,
    myParticipantId,
    currentAnswers,
    leaderboard,
    setQuiz,
    setGameState,
    setTimeLeft,
    setCountdownValue,
    startQuestion,
    nextQuestion,
    addParticipant,
    setMyParticipantId,
    submitAnswer,
    calculateLeaderboard,
    reset,
  } = useQuizStore();

  // 타이머 효과
  useEffect(() => {
    if (gameState !== 'question' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, setTimeLeft]);

  // 시간 종료 처리
  useEffect(() => {
    if (gameState === 'question' && timeLeft === 0) {
      handleQuestionEnd();
    }
  }, [gameState, timeLeft]);

  // 카운트다운 효과
  useEffect(() => {
    if (gameState !== 'countdown') return;

    if (countdownValue > 0) {
      const timer = setTimeout(() => {
        setCountdownValue(countdownValue - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // 카운트다운 종료, 첫 질문 시작
      startQuestion(0);
    }
  }, [gameState, countdownValue, setCountdownValue, startQuestion]);

  // 호스트: 퀴즈 선택 및 세션 생성
  const handleCreateSession = () => {
    setRole('host');
    setViewMode('select-quiz');
  };

  const handleQuizSelect = (quizId: string) => {
    const selectedQuiz = defaultQuizzes.find((q) => q.id === quizId);
    if (!selectedQuiz) return;

    setQuiz(selectedQuiz);
    setSelectedQuizId(quizId);

    // 실제로는 Supabase에서 세션 생성해야 함
    // 여기서는 로컬 모드로 시뮬레이션
    const mockCode = generateMockCode();
    setSessionCode(mockCode);
    setViewMode('waiting');
  };

  // 참가자: 세션 참여
  const handleJoinSession = () => {
    if (!nickname.trim() || sessionCode.length !== 6) return;

    setIsJoining(true);
    
    // 실제로는 Supabase에서 세션 조회해야 함
    // 여기서는 로컬 모드로 시뮬레이션 - 첫 번째 퀴즈 선택
    const selectedQuiz = defaultQuizzes[0];
    if (!selectedQuiz) {
      setIsJoining(false);
      return;
    }

    setQuiz(selectedQuiz);
    setRole('participant');

    // 참가자 ID 생성
    const participantId = `participant-${Date.now()}`;
    setMyParticipantId(participantId);

    // 참가자 추가
    addParticipant({
      id: participantId,
      nickname: nickname.trim(),
      totalScore: 0,
      correctCount: 0,
      currentStreak: 0,
      answers: {},
      isReady: true,
      joinedAt: new Date().toISOString(),
    });

    setViewMode('waiting');
    setIsJoining(false);
  };

  // 게임 시작
  const handleStartGame = () => {
    setGameState('countdown');
    setCountdownValue(3);
    setViewMode('countdown');
  };

  // 질문 종료 처리
  const handleQuestionEnd = () => {
    setGameState('revealing');
    calculateLeaderboard();

    // 2초 후 리더보드 표시
    setTimeout(() => {
      if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
        setViewMode('leaderboard');
      } else {
        setViewMode('finished');
      }
    }, 2000);
  };

  // 다음 질문으로
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      nextQuestion();
      setViewMode('playing');
    } else {
      setViewMode('finished');
    }
  };

  // 참가자: 답변 제출
  const handleAnswer = (answerIndex: number) => {
    if (!currentQuestion || !myParticipantId || !quiz) return;

    const participant = participants.find((p) => p.id === myParticipantId);
    if (!participant) return;

    const isCorrect = answerIndex === currentQuestion.correctIndex;
    const scoreResult = calculateScore(
      isCorrect,
      timeLeft,
      currentQuestion.timeLimit,
      currentQuestion.points,
      participant.currentStreak,
      quiz.settings
    );

    const answer: ParticipantAnswer = {
      participantId: myParticipantId,
      questionId: currentQuestion.id,
      answerIndex,
      timeLeft,
      isCorrect,
      pointsEarned: scoreResult.totalPoints,
      submittedAt: new Date().toISOString(),
    };

    submitAnswer(myParticipantId, answer);
  };

  // 다시 시작
  const handleRestart = () => {
    reset();
    setViewMode('home');
    setRole(null);
    setSessionCode('');
    setNickname('');
    setSelectedQuizId('');
    setIsJoining(false);
  };

  // 홈 화면
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <AppHeader
          title="실시간 퀴즈쇼"
          description="Kahoot 스타일 실시간 퀴즈 게임"
          icon={Trophy}
          iconGradient="from-yellow-500 to-orange-500"
          variant="compact"
        />
        <div className="flex-1 container mx-auto px-6 py-12">
          {/* Main Entry Tabs */}
          <Tabs defaultValue="host" className="max-w-lg mx-auto mb-12">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="host" className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                호스트 (발표자)
              </TabsTrigger>
              <TabsTrigger value="participant" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                참여하기
              </TabsTrigger>
            </TabsList>

            {/* Host Tab */}
            <TabsContent value="host" className="mt-6">
              <Card className="border-2 border-dajaem-green/20">
                <CardHeader>
                  <CardTitle>퀴즈 세션 만들기</CardTitle>
                  <CardDescription>
                    퀴즈를 선택하고 게임을 진행하세요
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleCreateSession}
                    size="lg"
                    className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    퀴즈 선택하기
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participant Tab */}
            <TabsContent value="participant" className="mt-6">
              <Card className="border-2 border-dajaem-green/20">
                <CardHeader>
                  <CardTitle>퀴즈 참여</CardTitle>
                  <CardDescription>
                    코드를 입력하고 닉네임을 설정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SessionCodeInput
                    value={sessionCode}
                    onChange={setSessionCode}
                    label="세션 코드"
                    placeholder="ABC123"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="nickname">닉네임</Label>
                    <Input
                      id="nickname"
                      placeholder="닉네임을 입력하세요"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={20}
                    />
                  </div>

                  <Button
                    onClick={handleJoinSession}
                    disabled={sessionCode.length !== 6 || !nickname.trim() || isJoining}
                    size="lg"
                    className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        참여 중...
                      </>
                    ) : (
                      <>
                        <Users className="w-5 h-5 mr-2" />
                        참여하기
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 기능 소개 */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Trophy size={32} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">실시간 경쟁</h3>
              <p className="text-gray-600">
                Kahoot 스타일로 실시간 퀴즈 대결을 즐기세요. 점수와 순위가 바로 업데이트됩니다.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">다양한 퀴즈</h3>
              <p className="text-gray-600">
                일반 상식, IT, 역사 등 다양한 주제의 퀴즈를 제공합니다.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">간편한 참여</h3>
              <p className="text-gray-600">
                6자리 코드만 입력하면 앱 설치 없이 바로 참여할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
        <AppFooter variant="compact" />
      </div>
    );
  }

  // 퀴즈 선택 화면
  if (viewMode === 'select-quiz') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-8">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleRestart}
            className="text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            돌아가기
          </Button>

          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-white mb-4">
              퀴즈 선택
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultQuizzes.map((quizItem) => (
              <Card
                key={quizItem.id}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleQuizSelect(quizItem.id)}
              >
                <CardHeader>
                  <CardTitle>{quizItem.title}</CardTitle>
                  <CardDescription>{quizItem.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{quizItem.questions.length}문제</span>
                    <span>
                      {quizItem.questions.reduce((sum, q) => sum + q.points, 0).toLocaleString()}점
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 대기 화면
  if (viewMode === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-black mb-4">{quiz?.title}</h2>
          <div className="text-3xl font-bold mb-8">
            세션 코드: <span className="text-yellow-300">{sessionCode}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8">
            <h3 className="text-2xl font-bold mb-4">참가자 ({participants.length}명)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {participants.map((p) => (
                <div key={p.id} className="bg-white/20 rounded-lg p-4">
                  <div className="text-xl font-bold">{p.nickname}</div>
                </div>
              ))}
            </div>
          </div>

          {role === 'host' && participants.length > 0 && (
            <Button
              size="lg"
              onClick={handleStartGame}
              className="bg-green-600 hover:bg-green-700 text-white text-2xl px-16 py-8"
            >
              <Play className="w-8 h-8 mr-3" />
              게임 시작
            </Button>
          )}

          {role === 'participant' && (
            <div className="text-2xl">호스트가 게임을 시작할 때까지 기다려주세요...</div>
          )}
        </div>
      </div>
    );
  }

  // 카운트다운
  if (viewMode === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          {countdownValue > 0 ? (
            <div className="text-9xl font-black text-white animate-bounce">
              {countdownValue}
            </div>
          ) : (
            <div className="text-9xl font-black text-yellow-300 animate-pulse">GO!</div>
          )}
        </div>
      </div>
    );
  }

  // 게임 진행 중
  if (viewMode === 'playing' && currentQuestion && quiz) {
    const answeredCount = currentAnswers.size;
    const myAnswer = myParticipantId ? currentAnswers.get(myParticipantId) : undefined;

    if (role === 'host') {
      return (
        <HostView
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          timeLeft={timeLeft}
          answeredCount={answeredCount}
          totalParticipants={participants.length}
          showAnswer={gameState === 'revealing'}
        />
      );
    }

    return (
      <ParticipantView
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={quiz.questions.length}
        timeLeft={timeLeft}
        onAnswer={handleAnswer}
        hasAnswered={!!myAnswer}
        isCorrect={myAnswer?.isCorrect}
        pointsEarned={myAnswer?.pointsEarned}
        correctAnswer={gameState === 'revealing' ? currentQuestion.correctIndex : undefined}
      />
    );
  }

  // 리더보드
  if (viewMode === 'leaderboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8">
        <Leaderboard leaderboard={leaderboard} />

        {role === 'host' && (
          <div className="fixed bottom-8 left-0 right-0 flex justify-center">
            <Button
              size="lg"
              onClick={handleNextQuestion}
              className="bg-blue-600 hover:bg-blue-700 text-white text-2xl px-12 py-6"
            >
              다음 문제
            </Button>
          </div>
        )}
      </div>
    );
  }

  // 게임 종료
  if (viewMode === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 p-8 relative overflow-hidden">
        <Confetti width={typeof window !== 'undefined' ? window.innerWidth : 0} height={typeof window !== 'undefined' ? window.innerHeight : 0} />

        <div className="relative z-10">
          <Leaderboard leaderboard={leaderboard} isGameEnd={true} />

          <div className="mt-12 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={handleRestart}
              className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-8 py-6"
            >
              <Home className="w-6 h-6 mr-2" />
              처음으로
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// 유틸리티
function generateMockCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
