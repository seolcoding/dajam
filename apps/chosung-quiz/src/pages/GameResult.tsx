import { Button } from '@mini-apps/ui';
import { Card } from '@mini-apps/ui';
import { useGameStore } from '../store/gameStore';
import { categoryLabels } from '../data';
import { Trophy, Target, Clock, Award, RotateCcw, Settings, Share2 } from 'lucide-react';

export function GameResult() {
  const {
    score,
    correctCount,
    questions,
    answers,
    gameConfig,
    resetGame,
    goToSettings
  } = useGameStore();

  const totalQuestions = questions.length;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);
  const avgTime = Math.round(
    answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions
  );

  const handleShare = async () => {
    const text = `초성 퀴즈 결과\n카테고리: ${categoryLabels[gameConfig?.category || 'movie']}\n최종 점수: ${score}점\n정답: ${correctCount}/${totalQuestions}\n정답률: ${accuracy}%`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '초성 퀴즈 결과',
          text: text,
          url: window.location.href
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-yellow-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="relative w-full max-w-2xl p-8 md:p-10 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-white">
        <div className="text-center mb-10">
          {/* Trophy animation */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-50 animate-pulse-ring" />
            <div className="relative inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-2xl animate-pop-in border-4 border-yellow-300">
              <Trophy className="w-16 h-16 text-white drop-shadow-lg" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            게임 종료!
          </h1>
          <p className="text-lg text-gray-600 font-semibold">수고하셨습니다</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="relative bg-gradient-to-br from-purple-100 to-purple-50 p-6 rounded-2xl border-3 border-purple-300 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-purple-700 mb-3">
                <Award className="w-6 h-6 drop-shadow-sm" />
                <span className="text-sm font-black">최종 점수</span>
              </div>
              <div className="text-4xl font-black text-purple-800 drop-shadow-sm">{score}점</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-2xl border-3 border-green-300 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-green-700 mb-3">
                <Target className="w-6 h-6 drop-shadow-sm" />
                <span className="text-sm font-black">정답 개수</span>
              </div>
              <div className="text-4xl font-black text-green-800 drop-shadow-sm">
                {correctCount}<span className="text-2xl text-green-600">/</span>{totalQuestions}
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-2xl border-3 border-blue-300 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <Target className="w-6 h-6 drop-shadow-sm" />
                <span className="text-sm font-black">정답률</span>
              </div>
              <div className="text-4xl font-black text-blue-800 drop-shadow-sm">{accuracy}%</div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-orange-100 to-orange-50 p-6 rounded-2xl border-3 border-orange-300 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-400/20 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-orange-700 mb-3">
                <Clock className="w-6 h-6 drop-shadow-sm" />
                <span className="text-sm font-black">평균 시간</span>
              </div>
              <div className="text-4xl font-black text-orange-800 drop-shadow-sm">{avgTime}초</div>
            </div>
          </div>
        </div>

        {/* Answer Review */}
        <div className="mb-8">
          <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
            정답 확인
          </h3>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-thin">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-3 shadow-md transition-all ${
                  answer.isCorrect
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                    : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="font-black text-gray-800 text-lg">
                      {index + 1}.
                    </span>
                    <span className="mx-2 font-bold text-gray-500">{answer.question.chosung}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className={`font-bold text-lg ${answer.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {answer.question.word}
                    </span>
                  </div>
                  <div className="text-base ml-4">
                    {answer.isCorrect ? (
                      <span className="bg-green-600 text-white font-black px-3 py-1 rounded-full text-sm">
                        +{answer.scoreEarned}점
                      </span>
                    ) : (
                      <span className="text-red-600 font-black text-2xl">✗</span>
                    )}
                  </div>
                </div>
                {!answer.isCorrect && answer.userAnswer && (
                  <div className="text-sm text-gray-600 mt-2 font-semibold">
                    입력: <span className="text-red-600">{answer.userAnswer}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={resetGame}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-6 rounded-xl shadow-lg transform hover:scale-105 transition-all"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            다시 하기
          </Button>

          <Button
            onClick={goToSettings}
            variant="outline"
            className="font-bold py-6 rounded-xl border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transform hover:scale-105 transition-all"
          >
            <Settings className="w-5 h-5 mr-2" />
            설정
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            className="font-bold py-6 rounded-xl border-2 border-gray-300 hover:border-pink-500 hover:bg-pink-50 transform hover:scale-105 transition-all"
          >
            <Share2 className="w-5 h-5 mr-2" />
            공유
          </Button>
        </div>
      </Card>
    </div>
  );
}
