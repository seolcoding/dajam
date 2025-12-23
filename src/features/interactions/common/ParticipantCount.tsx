'use client';

import React from 'react';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ParticipantCountProps {
  count: number;
  maxParticipants?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'badge' | 'minimal';
  className?: string;
}

/**
 * 참여자 수 표시 컴포넌트
 * - 실시간 참여자 수 애니메이션
 * - audience-engage에서 공통 사용
 */
export function ParticipantCount({
  count,
  maxParticipants,
  showLabel = true,
  size = 'md',
  variant = 'default',
  className = '',
}: ParticipantCountProps) {
  const sizeClasses = {
    sm: { icon: 16, text: 'text-sm', padding: 'px-2 py-1' },
    md: { icon: 20, text: 'text-base', padding: 'px-3 py-2' },
    lg: { icon: 24, text: 'text-lg', padding: 'px-4 py-3' },
  };

  const config = sizeClasses[size];

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-1 ${config.text} ${className}`}>
        <Users size={config.icon} />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="font-bold"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={`
          inline-flex items-center gap-2
          bg-blue-100 text-blue-700 rounded-full
          ${config.padding} ${config.text} ${className}
        `}
      >
        <Users size={config.icon} />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="font-bold"
          >
            {count}
            {maxParticipants && <span className="font-normal">/{maxParticipants}</span>}
          </motion.span>
        </AnimatePresence>
        {showLabel && <span className="font-normal">명</span>}
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center gap-2
        bg-white/20 backdrop-blur-sm rounded-full
        ${config.padding} ${config.text} ${className}
      `}
    >
      <Users size={config.icon} />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="font-bold"
        >
          {count}
        </motion.span>
      </AnimatePresence>
      {showLabel && <span>명 참여</span>}
    </div>
  );
}

export default ParticipantCount;
