'use client';

import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ConnectionStatusProps {
  status: ConnectionState;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * 연결 상태 표시 컴포넌트
 * - Supabase Realtime 연결 상태 표시
 * - audience-engage에서 공통 사용
 */
export function ConnectionStatus({
  status,
  showLabel = true,
  size = 'md',
  className = '',
}: ConnectionStatusProps) {
  const sizeClasses = {
    sm: { icon: 14, text: 'text-xs', dot: 'w-2 h-2' },
    md: { icon: 18, text: 'text-sm', dot: 'w-2.5 h-2.5' },
    lg: { icon: 22, text: 'text-base', dot: 'w-3 h-3' },
  };

  const config = sizeClasses[size];

  const statusConfig = {
    connected: {
      icon: Wifi,
      label: '연결됨',
      color: 'text-green-500',
      bgColor: 'bg-green-500',
      dotColor: 'bg-green-500',
    },
    connecting: {
      icon: Loader2,
      label: '연결 중...',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500',
      dotColor: 'bg-yellow-500',
    },
    disconnected: {
      icon: WifiOff,
      label: '연결 끊김',
      color: 'text-gray-400',
      bgColor: 'bg-gray-400',
      dotColor: 'bg-gray-400',
    },
    error: {
      icon: WifiOff,
      label: '연결 오류',
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      dotColor: 'bg-red-500',
    },
  };

  const { icon: Icon, label, color, dotColor } = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 ${config.text} ${className}`}>
      {/* Animated dot */}
      <div className="relative">
        <div className={`${config.dot} rounded-full ${dotColor}`} />
        {status === 'connected' && (
          <motion.div
            className={`absolute inset-0 ${config.dot} rounded-full ${dotColor}`}
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {status === 'connecting' && (
          <motion.div
            className={`absolute inset-0 ${config.dot} rounded-full ${dotColor}`}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Icon */}
      <Icon
        size={config.icon}
        className={`${color} ${status === 'connecting' ? 'animate-spin' : ''}`}
      />

      {/* Label */}
      {showLabel && (
        <span className={`font-medium ${color}`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default ConnectionStatus;
