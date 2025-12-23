'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeIndicatorProps {
  isConnected?: boolean;
  showTimestamp?: boolean;
  className?: string;
}

/**
 * 실시간 연결 상태 표시기
 * - 초 단위로 업데이트되는 타임스탬프
 * - 연결 상태 표시 (녹색 펄스 / 빨간색)
 */
export function RealtimeIndicator({
  isConnected = true,
  showTimestamp = true,
  className = '',
}: RealtimeIndicatorProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
        isConnected
          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      } ${className}`}
    >
      {/* 연결 상태 아이콘 */}
      {isConnected ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      ) : (
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
      )}

      {/* 상태 텍스트 */}
      <span className="flex items-center gap-1">
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>실시간</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>연결 끊김</span>
          </>
        )}
      </span>

      {/* 타임스탬프 */}
      {showTimestamp && (
        <>
          <span className="text-gray-400 dark:text-gray-500">|</span>
          <span className="font-mono tabular-nums">{formatTime(now)}</span>
        </>
      )}
    </div>
  );
}
