'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Users, Sparkles, ArrowLeft, Trophy, Home } from 'lucide-react';
import Confetti from 'react-confetti';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuizStore } from '../store/quizStore';
import { defaultQuizzes, calculateScore } from '../data/quizzes';
import HostView from './HostView';
import ParticipantView from './ParticipantView';
import Leaderboard from './Leaderboard';
import type { Quiz, ParticipantAnswer } from '../types';
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
    setRole('participant');
    setViewMode('select-quiz'); // 간단히 하기 위해 코드 입력 대신 퀴즈 선택
  };

  const handleParticipantJoin = () => {
    if (!nickname.trim() || !selectedQuizId) return;

    const selectedQuiz = defaultQuizzes.find((q) => q.id === selectedQuizId);
    if (!selectedQuiz) return;

    setQuiz(selectedQuiz);

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
  };

  // 홈 화면
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex flex-col">
        <AppHeader
          title="실시간 퀴즈쇼"
          description="Kahoot 스타일 실시간 퀴즈 게임"
          icon={Trophy}
          iconGradient="from-yellow-500 to-orange-500"
        />
        <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">

          {/* 액션 버튼 */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/95 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer" onClick={handleCreateSession}>
              <CardHeader>
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center">호스트로 시작</CardTitle>
                <CardDescription className="text-center text-lg">
                  퀴즈를 만들고 게임을 진행하세요
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm hover:scale-105 transition-transform cursor-pointer" onClick={handleJoinSession}>
              <CardHeader>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl text-center">참가자로 입장</CardTitle>
                <CardDescription className="text-center text-lg">
                  코드를 입력하고 게임에 참여하세요
                </CardDescription>
              </CardHeader>
            </Card>
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
              {role === 'host' ? '퀴즈 선택' : '닉네임 입력'}
            </h2>
          </div>

          {role === 'participant' && (
            <Card className="max-w-md mx-auto mb-8">
              <CardHeader>
                <CardTitle>닉네임</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="닉네임을 입력하세요"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                />
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  if (role === 'host') {
                    handleQuizSelect(quiz.id);
                  } else {
                    setSelectedQuizId(quiz.id);
                  }
                }}
              >
                <CardHeader>
                  <CardTitle>{quiz.title}</CardTitle>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{quiz.questions.length}문제</span>
                    <span>
                      {quiz.questions.reduce((sum, q) => sum + q.points, 0).toLocaleString()}점
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {role === 'participant' && selectedQuizId && nickname.trim() && (
            <div className="fixed bottom-8 left-0 right-0 flex justify-center">
              <Button
                size="lg"
                onClick={handleParticipantJoin}
                className="bg-green-600 hover:bg-green-700 text-white text-xl px-12 py-6"
              >
                참여하기
              </Button>
            </div>
          )}
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
