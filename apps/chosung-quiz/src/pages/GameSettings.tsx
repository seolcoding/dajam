import { useState } from 'react';
import { Button } from '@mini-apps/ui';
import { Card } from '@mini-apps/ui';
import { useGameStore } from '../store/gameStore';
import type { Category } from '../types';
import { categoryLabels } from '../data';
import { Film, UtensilsCrossed, Music, BookText } from 'lucide-react';

const categoryIcons = {
  movie: Film,
  food: UtensilsCrossed,
  kpop: Music,
  proverb: BookText
};

export function GameSettings() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('movie');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30);
  const startGame = useGameStore((state) => state.startGame);

  const handleStart = () => {
    startGame({
      category: selectedCategory,
      questionCount,
      timeLimit
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-blue-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <Card className="relative w-full max-w-2xl p-8 md:p-10 bg-white/95 backdrop-blur-sm shadow-2xl border-2 border-white">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
              초성 퀴즈
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-medium">초성을 보고 단어를 맞춰보세요!</p>
        </div>

        <div className="space-y-8">
          {/* Category Selection */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4">
              카테고리 선택
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(categoryLabels) as Category[]).map((category) => {
                const Icon = categoryIcons[category];
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`relative p-6 rounded-2xl border-3 transition-all duration-300 transform ${
                      isSelected
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl scale-105'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 hover:shadow-lg hover:scale-102'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center animate-pop-in">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    <Icon className={`w-12 h-12 mx-auto mb-3 transition-all ${
                      isSelected ? 'text-purple-600 scale-110' : 'text-gray-600'
                    }`} />
                    <span className={`block text-lg font-bold transition-colors ${
                      isSelected ? 'text-purple-700' : 'text-gray-700'
                    }`}>
                      {categoryLabels[category]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
            <label className="block text-base font-bold text-gray-800 mb-4">
              문제 개수: <span className="text-2xl text-blue-600">{questionCount}개</span>
            </label>
            <input
              type="range"
              min="5"
              max="10"
              step="5"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-3 bg-gray-300 rounded-full appearance-none cursor-pointer accent-blue-600 slider-thumb"
            />
            <div className="flex justify-between text-sm font-semibold text-gray-600 mt-2">
              <span>5개</span>
              <span>10개</span>
            </div>
          </div>

          {/* Time Limit */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
            <label className="block text-base font-bold text-gray-800 mb-4">
              제한 시간: <span className="text-2xl text-orange-600">{timeLimit}초</span>
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="15"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full h-3 bg-gray-300 rounded-full appearance-none cursor-pointer accent-orange-600 slider-thumb"
            />
            <div className="flex justify-between text-sm font-semibold text-gray-600 mt-2">
              <span>15초</span>
              <span>30초</span>
              <span>45초</span>
              <span>60초</span>
            </div>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            className="w-full py-8 text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-4 border-white"
          >
            <span className="drop-shadow-md">게임 시작하기</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
