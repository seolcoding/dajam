import { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  onTick?: (remaining: number) => void;
}

export function Timer({ duration, onTimeUp, onTick }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (remaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        const newValue = prev - 1;
        if (onTick) onTick(newValue);
        return newValue;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onTimeUp, onTick]);

  const percentage = (remaining / duration) * 100;
  const isLowTime = remaining <= 10;
  const isCritical = remaining <= 5;

  return (
    <div className="relative w-28 h-28 md:w-32 md:h-32">
      {/* Pulse ring effect for critical time */}
      {isCritical && (
        <div className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring" />
      )}

      {/* Outer glow */}
      <div className={`absolute inset-0 rounded-full blur-xl transition-all ${
        isCritical ? 'bg-red-500/40' : isLowTime ? 'bg-orange-500/40' : 'bg-purple-500/30'
      }`} />

      {/* Main timer circle */}
      <div className="relative w-full h-full">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background track */}
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
            className="drop-shadow-md"
          />
          {/* Progress arc */}
          <circle
            cx="56"
            cy="56"
            r="48"
            stroke={isCritical ? '#ef4444' : isLowTime ? '#f97316' : '#8b5cf6'}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 48}`}
            strokeDashoffset={`${2 * Math.PI * 48 * (1 - percentage / 100)}`}
            strokeLinecap="round"
            className={`transition-all duration-300 ${isCritical ? 'drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}`}
            style={{
              filter: isCritical ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))' : ''
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-4xl md:text-5xl font-black transition-all ${
              isCritical ? 'text-red-600 scale-110 animate-shake' :
              isLowTime ? 'text-orange-600 scale-105' : 'text-purple-700'
            }`}
            style={{
              textShadow: isCritical ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {remaining}
          </span>
          <span className={`text-xs font-semibold ${
            isCritical ? 'text-red-500' : isLowTime ? 'text-orange-500' : 'text-purple-500'
          }`}>
            초
          </span>
        </div>
      </div>
    </div>
  );
}
