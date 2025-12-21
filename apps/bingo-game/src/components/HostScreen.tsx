import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Clock,
  Shuffle,
} from 'lucide-react';
import { useBingoStore } from '@/stores/useBingoStore';
import { playSoundEffect } from '@/utils/soundEffects';

export function HostScreen() {
  const {
    gameCode,
    config,
    calledItems,
    callHistory,
    currentCall,
    performCall,
    randomCall,
    getRemainingItems,
    autoCallEnabled,
    autoCallInterval,
    setAutoCallInterval,
    toggleAutoCall,
    soundEnabled,
    toggleSound,
    resetGame,
    setGameMode,
  } = useBingoStore();

  const [copied, setCopied] = useState(false);

  // Auto call timer
  useEffect(() => {
    if (!autoCallEnabled) return;

    const timer = setInterval(() => {
      randomCall();
      if (soundEnabled) {
        playSoundEffect('call');
      }
    }, autoCallInterval * 1000);

    return () => clearInterval(timer);
  }, [autoCallEnabled, autoCallInterval, randomCall, soundEnabled]);

  const handleCopyCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRandomCall = () => {
    randomCall();
    if (soundEnabled) {
      playSoundEffect('call');
    }
  };

  const remainingItems = getRemainingItems();
  const totalItems = config?.items.length ?? 0;
  const calledCount = calledItems.size;
  const progress = (calledCount / totalItems) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setGameMode('menu')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>종료</span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSound}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>초기화</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Game Code & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Game Code */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                게임 코드
              </h3>
              <div className="flex items-center space-x-2">
                <div className="flex-1 text-center">
                  <div className="text-4xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-widest">
                    {gameCode}
                  </div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                진행 상황
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">호출됨</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {calledCount} / {totalItems}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </motion.div>

            {/* Auto Call */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                자동 호출
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={autoCallInterval}
                    onChange={(e) => setAutoCallInterval(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white w-12">
                    {autoCallInterval}초
                  </span>
                </div>
                <button
                  onClick={toggleAutoCall}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                    autoCallEnabled
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {autoCallEnabled ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>정지</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>시작</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Center: Current Call */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Call Display - Enhanced */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative overflow-hidden"
            >
              {/* Animated background glow */}
              {currentCall && (
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-blue-500 blur-3xl"
                />
              )}

              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center border-4 border-gray-200 dark:border-gray-700">
                {/* Top decoration stripe */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />

                <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-6 uppercase tracking-wider">
                  현재 호출
                </h3>

                {/* Number display with bounce animation */}
                <motion.div
                  key={currentCall}
                  initial={{ scale: 0.5, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="mb-10 relative"
                >
                  {/* Glow behind number */}
                  {currentCall && (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="absolute inset-0 blur-3xl bg-blue-400"
                    />
                  )}

                  <div className={`relative text-9xl font-black tracking-tighter ${
                    currentCall
                      ? 'text-blue-600 dark:text-blue-400 call-bounce'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  style={{
                    textShadow: currentCall ? '4px 4px 0px rgba(0,0,0,0.1)' : 'none',
                  }}>
                    {currentCall || '—'}
                  </div>
                </motion.div>

                {/* Call button */}
                <motion.button
                  onClick={handleRandomCall}
                  disabled={remainingItems.length === 0 || autoCallEnabled}
                  whileHover={remainingItems.length > 0 && !autoCallEnabled ? { scale: 1.05, y: -2 } : {}}
                  whileTap={remainingItems.length > 0 && !autoCallEnabled ? { scale: 0.95 } : {}}
                  className="px-10 py-5 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 transition-all flex items-center justify-center space-x-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <Shuffle className="w-7 h-7" />
                  <span>랜덤 호출</span>
                </motion.button>

                {/* Remaining count */}
                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                  남은 항목: <span className="font-bold text-gray-700 dark:text-gray-300">{remainingItems.length}</span> / {totalItems}
                </div>
              </div>
            </motion.div>

            {/* Call History */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                호출 기록 (최근 20개)
              </h3>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                {callHistory
                  .slice(-20)
                  .reverse()
                  .map((record) => (
                    <motion.div
                      key={record.order}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="aspect-square flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg font-semibold text-sm"
                    >
                      {record.item}
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
