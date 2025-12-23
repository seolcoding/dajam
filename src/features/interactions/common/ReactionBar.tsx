'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Reaction {
  emoji: string;
  label: string;
  count?: number;
}

export interface ReactionBarProps {
  reactions?: Reaction[];
  onReact?: (emoji: string) => void;
  disabled?: boolean;
  showCounts?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DEFAULT_REACTIONS: Reaction[] = [
  { emoji: '👍', label: '좋아요' },
  { emoji: '👏', label: '박수' },
  { emoji: '❤️', label: '하트' },
  { emoji: '😂', label: '웃음' },
  { emoji: '🎉', label: '축하' },
  { emoji: '❓', label: '질문' },
];

/**
 * 실시간 반응 바 컴포넌트
 * - 이모지 반응 버튼들
 * - 플로팅 애니메이션
 * - audience-engage에서 사용
 */
export function ReactionBar({
  reactions = DEFAULT_REACTIONS,
  onReact,
  disabled = false,
  showCounts = false,
  size = 'md',
  className = '',
}: ReactionBarProps) {
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ id: number; emoji: string; x: number }>>([]);
  const [nextId, setNextId] = useState(0);

  const sizeClasses = {
    sm: 'text-xl p-2',
    md: 'text-3xl p-3',
    lg: 'text-4xl p-4',
  };

  const handleReact = (emoji: string) => {
    if (disabled) return;

    // Add floating emoji
    const x = Math.random() * 100;
    setFloatingEmojis((prev) => [...prev, { id: nextId, emoji, x }]);
    setNextId((prev) => prev + 1);

    // Remove after animation
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== nextId));
    }, 2000);

    onReact?.(emoji);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Floating emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {floatingEmojis.map(({ id, emoji, x }) => (
            <motion.div
              key={id}
              initial={{ opacity: 1, y: 0, x: `${x}%` }}
              animate={{ opacity: 0, y: -100 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute bottom-0 text-4xl"
              style={{ left: `${x}%` }}
            >
              {emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction buttons */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {reactions.map((reaction) => (
          <motion.button
            key={reaction.emoji}
            onClick={() => handleReact(reaction.emoji)}
            disabled={disabled}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            className={`
              ${sizeClasses[size]}
              rounded-full bg-white/10 backdrop-blur-sm
              hover:bg-white/20 active:bg-white/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200
              flex items-center gap-1
            `}
            title={reaction.label}
          >
            <span>{reaction.emoji}</span>
            {showCounts && reaction.count !== undefined && (
              <span className="text-sm font-medium text-white/80">
                {reaction.count}
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default ReactionBar;
