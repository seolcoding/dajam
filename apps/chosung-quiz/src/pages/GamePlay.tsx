import { useState, useEffect, useRef } from 'react';
import { Button } from '@mini-apps/ui';
import { Input } from '@mini-apps/ui';
import { Card } from '@mini-apps/ui';
import { Progress } from '@mini-apps/ui';
import { useGameStore } from '../store/gameStore';
import { Timer } from '../components/Timer';
import { ChosungDisplay } from '../components/ChosungDisplay';
import { HintSection } from '../components/HintSection';
import { categoryLabels } from '../data';
import { ArrowRight, SkipForward, Trophy } from 'lucide-react';

export function GamePlay() {
  const {
    questions,
    currentQuestionIndex,
    score,
    correctCount,
    usedHints,
    gameConfig,
    submitAnswer,
    useHint,
    skipQuestion
  } = useGameStore();

  const [userAnswer, setUserAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(gameConfig?.timeLimit || 30);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // Reset timer when question changes
    setTimeRemaining(gameConfig?.timeLimit || 30);
    setUserAnswer('');
    setShowFeedback(false);
    // Focus input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [currentQuestionIndex, gameConfig?.timeLimit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || showFeedback) return;

    const correct = userAnswer.trim() === currentQuestion.word;
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      submitAnswer(userAnswer, timeRemaining);
    }, 1500);
  };

  const handleTimeUp = () => {
    if (!showFeedback) {
      setIsCorrect(false);
      setShowFeedback(true);
      setTimeout(() => {
        skipQuestion();
      }, 1500);
    }
  };

  const handleSkip = () => {
    if (!showFeedback) {
      skipQuestion();
    }
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/3 w-36 h-36 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="relative w-full max-w-3xl p-6 md:p-8 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Timer
              duration={gameConfig?.timeLimit || 30}
              onTimeUp={handleTimeUp}
              onTick={setTimeRemaining}
            />
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-1">
                {categoryLabels[gameConfig?.category || 'movie']}
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-500 drop-shadow-md" />
                {score}점
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-600 mb-1">문제</div>
            <div className="text-3xl font-black text-purple-600">
              {currentQuestionIndex + 1}<span className="text-gray-400">/</span>{questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-3 bg-gray-200" />
        </div>

        {/* Chosung Display */}
        <ChosungDisplay chosung={currentQuestion.chosung} />

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`text-center py-6 px-8 rounded-2xl mb-6 transform transition-all ${
              isCorrect
                ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-4 border-green-300 text-white shadow-2xl animate-success-burst'
                : 'bg-gradient-to-br from-red-400 to-rose-500 border-4 border-red-300 text-white shadow-2xl animate-shake'
            }`}
          >
            <div className="text-3xl font-black mb-2 drop-shadow-md">
              {isCorrect ? '정답입니다!' : '아쉽네요!'}
            </div>
            <div className="text-2xl font-bold">
              정답: <span className="font-black drop-shadow-md">{currentQuestion.word}</span>
            </div>
            {isCorrect && (
              <div className="mt-2 text-sm font-semibold opacity-90">
                멋져요! 계속 도전하세요!
              </div>
            )}
          </div>
        )}

        {/* Answer Input */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="정답을 입력하세요"
              disabled={showFeedback}
              className="flex-1 text-lg py-6"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={!userAnswer.trim() || showFeedback}
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </form>

        {/* Hints */}
        <HintSection
          hints={currentQuestion.hints}
          onUseHint={useHint}
          usedHints={usedHints}
        />

        {/* Skip Button */}
        <Button
          onClick={handleSkip}
          variant="outline"
          disabled={showFeedback}
          className="w-full mt-4"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          패스하기
        </Button>

        {/* Score Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          정답: {correctCount} / {currentQuestionIndex + 1}
        </div>
      </Card>
    </div>
  );
}
