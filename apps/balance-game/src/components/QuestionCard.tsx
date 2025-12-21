import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Question } from '../types';
import { Card } from '@mini-apps/ui';
import { Zap } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onSelect: (choice: 'A' | 'B') => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onSelect }) => {
  const [hoveredChoice, setHoveredChoice] = useState<'A' | 'B' | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setSwipeOffset(eventData.deltaX);
    },
    onSwipedLeft: () => {
      handleSelect('B');
    },
    onSwipedRight: () => {
      handleSelect('A');
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  const handleSelect = (choice: 'A' | 'B') => {
    setSelectedChoice(choice);
    setIsAnimating(true);
    setTimeout(() => {
      onSelect(choice);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Question title with bold typography */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-black text-gray-900 mb-4 leading-tight">
          {question.title}
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Zap className="w-5 h-5" />
          <p className="text-lg font-medium">둘 중 하나를 선택하세요</p>
        </div>
      </div>

      {/* VS Layout with choices */}
      <div
        {...handlers}
        className="relative"
      >
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center">
          {/* Choice A */}
          <button
            onClick={() => handleSelect('A')}
            onMouseEnter={() => setHoveredChoice('A')}
            onMouseLeave={() => setHoveredChoice(null)}
            disabled={isAnimating}
            className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
              selectedChoice === 'A'
                ? 'scale-110 shadow-2xl ring-8 ring-blue-500/50'
                : selectedChoice === 'B'
                ? 'scale-90 opacity-30 blur-sm'
                : hoveredChoice === 'A'
                ? 'scale-105 shadow-2xl'
                : 'scale-100 shadow-lg hover:shadow-xl'
            }`}
            style={{
              transform: swipeOffset > 50 ? `scale(1.05) translateX(${swipeOffset * 0.1}px)` : undefined,
            }}
          >
            <Card className="border-0 bg-white overflow-hidden">
              {/* Choice letter badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-2xl">A</span>
                </div>
              </div>

              {/* Image */}
              {question.imageA && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={question.imageA}
                    alt={question.optionA}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/90 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className={`p-8 ${!question.imageA ? 'min-h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100' : ''}`}>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-gray-900 leading-tight">
                    {question.optionA}
                  </h3>

                  {/* Hover effect indicator */}
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    hoveredChoice === 'A' || selectedChoice === 'A'
                      ? 'w-full bg-blue-600'
                      : 'w-0 bg-blue-600'
                  }`} />
                </div>
              </div>

              {/* Depth texture effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-blue-500/5 to-blue-500/10 pointer-events-none" />

              {/* Selection glow */}
              {selectedChoice === 'A' && (
                <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
              )}
            </Card>
          </button>

          {/* VS indicator */}
          <div className="hidden md:block relative">
            <div className={`w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center shadow-2xl transition-all duration-500 ${
              isAnimating ? 'scale-125 rotate-180' : 'scale-100'
            }`}>
              <span className="text-white font-black text-3xl">VS</span>
            </div>

            {/* Animated sparks */}
            {(hoveredChoice || isAnimating) && (
              <>
                <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-yellow-400 animate-ping" />
                <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-yellow-400 animate-ping delay-75" />
              </>
            )}
          </div>

          {/* Choice B */}
          <button
            onClick={() => handleSelect('B')}
            onMouseEnter={() => setHoveredChoice('B')}
            onMouseLeave={() => setHoveredChoice(null)}
            disabled={isAnimating}
            className={`group relative overflow-hidden rounded-2xl transition-all duration-500 ${
              selectedChoice === 'B'
                ? 'scale-110 shadow-2xl ring-8 ring-purple-500/50'
                : selectedChoice === 'A'
                ? 'scale-90 opacity-30 blur-sm'
                : hoveredChoice === 'B'
                ? 'scale-105 shadow-2xl'
                : 'scale-100 shadow-lg hover:shadow-xl'
            }`}
            style={{
              transform: swipeOffset < -50 ? `scale(1.05) translateX(${swipeOffset * 0.1}px)` : undefined,
            }}
          >
            <Card className="border-0 bg-white overflow-hidden">
              {/* Choice letter badge */}
              <div className="absolute top-4 right-4 z-10">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-2xl">B</span>
                </div>
              </div>

              {/* Image */}
              {question.imageB && (
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={question.imageB}
                    alt={question.optionB}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-600/90 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className={`p-8 ${!question.imageB ? 'min-h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100' : ''}`}>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-gray-900 leading-tight">
                    {question.optionB}
                  </h3>

                  {/* Hover effect indicator */}
                  <div className={`h-2 rounded-full transition-all duration-300 ${
                    hoveredChoice === 'B' || selectedChoice === 'B'
                      ? 'w-full bg-purple-600'
                      : 'w-0 bg-purple-600'
                  }`} />
                </div>
              </div>

              {/* Depth texture effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/5 to-purple-500/10 pointer-events-none" />

              {/* Selection glow */}
              {selectedChoice === 'B' && (
                <div className="absolute inset-0 bg-purple-500/20 animate-pulse" />
              )}
            </Card>
          </button>
        </div>

        {/* Mobile VS indicator */}
        <div className="md:hidden flex justify-center my-6">
          <div className={`w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center shadow-xl transition-all duration-500 ${
            isAnimating ? 'scale-125 rotate-180' : 'scale-100'
          }`}>
            <span className="text-white font-black text-xl">VS</span>
          </div>
        </div>

        {/* Mobile swipe guide */}
        <p className="text-center text-gray-400 text-sm mt-8 md:hidden">
          왼쪽 스와이프: B 선택 | 오른쪽 스와이프: A 선택
        </p>
      </div>
    </div>
  );
};

export default QuestionCard;
