'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  previousLeaderboard?: LeaderboardEntry[];
  isGameEnd?: boolean;
  maxDisplay?: number;
}

export default function Leaderboard({
  leaderboard,
  previousLeaderboard = [],
  isGameEnd = false,
  maxDisplay = 10,
}: LeaderboardProps) {
  // 순위 변화 계산
  const getRankChange = (participantId: string, currentRank: number): number => {
    if (!previousLeaderboard.length) return 0;
    const previous = previousLeaderboard.find((p) => p.participantId === participantId);
    if (!previous) return 0;
    return previous.rank - currentRank; // 양수면 상승, 음수면 하락
  };

  // 상위 N명만 표시
  const displayedLeaderboard = leaderboard.slice(0, maxDisplay);

  // 메달 아이콘
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}.`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <h2 className="text-4xl font-black text-gray-900">
            {isGameEnd ? '최종 순위' : '리더보드'}
          </h2>
          <Trophy className="w-10 h-10 text-yellow-500" />
        </div>
        <p className="text-gray-600 text-lg">
          {isGameEnd ? '게임이 종료되었습니다!' : '현재 순위'}
        </p>
      </div>

      {/* 리더보드 목록 */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayedLeaderboard.map((entry, index) => {
            const rankChange = getRankChange(entry.participantId, entry.rank);
            const isTop3 = entry.rank <= 3;

            return (
              <motion.div
                key={entry.participantId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                className={`
                  relative p-4 rounded-xl shadow-lg
                  ${
                    isTop3
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400'
                      : 'bg-white border border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  {/* 순위 */}
                  <div
                    className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${isTop3 ? 'text-2xl' : 'text-xl font-bold text-gray-700 bg-gray-100'}
                  `}
                  >
                    {getMedalIcon(entry.rank)}
                  </div>

                  {/* 닉네임 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900 truncate">
                        {entry.nickname}
                      </h3>

                      {/* 연속 정답 스트릭 */}
                      {entry.streak > 0 && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                          🔥 {entry.streak}연속
                        </span>
                      )}
                    </div>

                    {/* 정답 개수 */}
                    <p className="text-sm text-gray-600">
                      정답: {entry.correctCount}개
                    </p>
                  </div>

                  {/* 점수 */}
                  <div className="text-right">
                    <div className="text-2xl font-black text-gray-900">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">점</div>
                  </div>

                  {/* 순위 변화 */}
                  {!isGameEnd && rankChange !== 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`
                        flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold
                        ${
                          rankChange > 0
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }
                      `}
                    >
                      {rankChange > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          {rankChange}
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          {Math.abs(rankChange)}
                        </>
                      )}
                    </motion.div>
                  )}

                  {!isGameEnd && rankChange === 0 && previousLeaderboard.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      <Minus className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* 1등 광채 효과 */}
                {entry.rank === 1 && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-200 to-orange-200 opacity-20 pointer-events-none"
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 총 참가자 수 */}
      {leaderboard.length > maxDisplay && (
        <div className="mt-4 text-center text-gray-500">
          외 {leaderboard.length - maxDisplay}명
        </div>
      )}
    </div>
  );
}
