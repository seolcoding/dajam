import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X, Star } from 'lucide-react';
import type { BingoLine } from '@/types/bingo.types';
import { getBingoCount } from '@/utils/bingoAlgorithm';
import { useBingoStore } from '@/stores/useBingoStore';

interface BingoSuccessModalProps {
  lines: BingoLine[];
  isOpen: boolean;
  onClose: () => void;
}

export function BingoSuccessModal({ lines, isOpen, onClose }: BingoSuccessModalProps) {
  const bingoCount = lines.length;

  // Create confetti particles
  const confettiCount = 30;
  const confetti = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
          onClick={onClose}
        >
          {/* Confetti animation */}
          {confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ y: -20, x: `${particle.x}vw`, opacity: 1 }}
              animate={{
                y: '100vh',
                rotate: 360 * 3,
                opacity: 0,
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'linear',
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: ['#fbbf24', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'][particle.id % 5],
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.3, y: -100, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, y: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 15,
              stiffness: 200,
            }}
            className="relative bg-gradient-to-br from-yellow-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-10 text-center max-w-md w-full shadow-2xl border-4 border-yellow-400"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative stars */}
            <div className="absolute -top-4 -left-4">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </div>
            <div className="absolute -top-4 -right-4">
              <motion.div
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              >
                <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
              </motion.div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Trophy animation */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'easeInOut',
              }}
              className="mb-6 flex justify-center relative"
            >
              {/* Glow effect */}
              <motion.div
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="absolute inset-0 blur-2xl bg-yellow-400 rounded-full"
              />

              <Trophy className="w-28 h-28 text-yellow-500 relative z-10 drop-shadow-2xl" />

              {/* Sparkles around trophy */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: 'linear',
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-16 h-16 text-yellow-400" />
              </motion.div>
            </motion.div>

            {/* BINGO text with 3D effect */}
            <motion.h1
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 10,
                delay: 0.2,
              }}
              className="text-7xl font-black mb-4 relative"
              style={{
                textShadow: '4px 4px 0px rgba(0,0,0,0.1), 8px 8px 0px rgba(0,0,0,0.05)',
              }}
            >
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                BINGO!
              </span>
            </motion.h1>

            {/* Completion count */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border-2 border-yellow-400"
            >
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {bingoCount}줄 완성!
              </p>
            </motion.div>

            {/* Line details */}
            <div className="space-y-3 mb-8">
              {lines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    delay: 0.4 + index * 0.1,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg font-semibold"
                >
                  {line.type === 'row' && `🎯 가로 ${(line.index ?? 0) + 1}줄`}
                  {line.type === 'column' && `🎯 세로 ${(line.index ?? 0) + 1}줄`}
                  {line.type === 'diagonal' && '🎯 대각선'}
                </motion.div>
              ))}
            </div>

            {/* Continue button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.6,
                type: 'spring',
                stiffness: 200,
              }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              계속하기 🎉
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
