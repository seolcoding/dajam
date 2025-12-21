import type { Hint } from '../types';
import { Lock, LockOpen } from 'lucide-react';

interface HintSectionProps {
  hints: Hint[];
  onUseHint: (level: number) => void;
  usedHints: number[];
}

export function HintSection({ hints, onUseHint, usedHints }: HintSectionProps) {
  return (
    <div className="flex flex-col gap-3 my-6">
      {hints.map((hint) => {
        const isUsed = usedHints.includes(hint.level);

        return (
          <button
            key={hint.level}
            onClick={() => !isUsed && onUseHint(hint.level)}
            disabled={isUsed}
            className={`relative px-5 py-4 rounded-xl font-bold transition-all text-left overflow-hidden ${
              isUsed
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 border-3 border-green-300 text-white shadow-lg cursor-default'
                : 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900 border-3 border-yellow-300 hover:shadow-xl transform hover:scale-102'
            }`}
          >
            {/* Shine effect for unused hints */}
            {!isUsed && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-float" />
            )}

            <div className="relative flex items-center gap-4">
              {isUsed ? (
                <LockOpen className="w-6 h-6 flex-shrink-0 drop-shadow-md" />
              ) : (
                <Lock className="w-6 h-6 flex-shrink-0 drop-shadow-md" />
              )}
              <div className="flex-1">
                {isUsed ? (
                  <div>
                    <div className="text-xs font-semibold opacity-90 mb-1">힌트 {hint.level}</div>
                    <div className="text-base font-bold drop-shadow-sm">{hint.content}</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-base">힌트 {hint.level} 보기</span>
                    <span className="text-sm font-black bg-red-500 text-white px-3 py-1 rounded-full">-50점</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
