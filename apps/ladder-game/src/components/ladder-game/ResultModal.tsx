/**
 * ResultModal Component
 *
 * 결과 표시 모달
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, PartyPopper } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button
} from '@mini-apps/ui';

interface ResultModalProps {
  isOpen: boolean;
  participant: string;
  result: string;
  onClose: () => void;
}

export function ResultModal({
  isOpen,
  participant,
  result,
  onClose
}: ResultModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg overflow-hidden">
        {/* Animated Background Particles */}
        <AnimatePresence>
          {isOpen && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: '50%',
                    y: '50%'
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    x: `${50 + (Math.random() - 0.5) * 200}%`,
                    y: `${50 + (Math.random() - 0.5) * 200}%`,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute w-3 h-3 rounded-full pointer-events-none"
                  style={{
                    background: ['#fbbf24', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'][i % 5],
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DialogTitle className="text-center text-3xl font-extrabold bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              결과 발표!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 mt-2">
              두구두구두구... 🥁
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-10 space-y-8 relative">
          {/* Trophy Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="relative"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 border-4 border-amber-300"
            >
              <Trophy className="w-14 h-14 text-white drop-shadow-lg" />
            </motion.div>

            {/* Sparkles around trophy */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-amber-400" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-2 -left-2"
            >
              <Sparkles className="w-6 h-6 text-pink-400" />
            </motion.div>
          </motion.div>

          {/* Result Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="text-center space-y-4 relative z-10"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="inline-block px-6 py-2 bg-emerald-100 rounded-full border-2 border-emerald-300"
              >
                <span className="text-lg font-bold text-emerald-700">{participant}</span>
                <span className="text-lg text-emerald-600 ml-1">님</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl text-gray-600"
              >
                결과는...
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: 1,
                type: 'spring',
                stiffness: 300,
                damping: 20
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-pink-400 to-purple-400 blur-xl opacity-50 rounded-2xl" />
              <div className="relative px-10 py-6 bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl border-4 border-amber-300 shadow-2xl">
                <PartyPopper className="absolute -top-3 -right-3 w-8 h-8 text-pink-500" />
                <div className="text-5xl font-black bg-gradient-to-r from-amber-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  {result}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center pb-2"
        >
          <Button
            onClick={onClose}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all px-12"
          >
            확인
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
