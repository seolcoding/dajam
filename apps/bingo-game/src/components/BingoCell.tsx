import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import type { BingoCell as BingoCellType } from '@/types/bingo.types';

interface BingoCellProps {
  cell: BingoCellType;
  isPartOfBingo: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function BingoCell({ cell, isPartOfBingo, onClick, disabled = false }: BingoCellProps) {
  const isFree = cell.value === 'FREE';
  const isMarked = cell.isMarked;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled || isFree}
      className={clsx(
        'relative h-16 sm:h-20 md:h-24',
        'flex items-center justify-center',
        'border-3 font-bold overflow-hidden',
        'transition-all duration-200',
        'text-sm sm:text-base md:text-lg lg:text-xl',
        {
          // Border radius
          'rounded-full': isFree,
          'rounded-lg': !isFree,

          // FREE cell - special styling
          'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700':
            isFree,
          'cursor-default': isFree,

          // Unmarked cells - clean white card
          'bg-white dark:bg-gray-800': !isMarked && !isFree,
          'border-gray-300 dark:border-gray-600': !isMarked && !isFree,
          'shadow-sm': !isMarked && !isFree,

          // Marked cells (not bingo line) - stamped effect
          'bg-blue-600 text-white border-blue-700': isMarked && !isPartOfBingo && !isFree,
          'shadow-lg': isMarked && !isPartOfBingo && !isFree,

          // Bingo line cells - golden celebration
          'bg-yellow-400 dark:bg-yellow-500 text-gray-900 border-yellow-600': isPartOfBingo,
          'shadow-2xl': isPartOfBingo,
          'bingo-line-cell': isPartOfBingo,

          // Hover effects - tactile feedback
          'hover:shadow-md hover:scale-[1.02] active:scale-95': !isMarked && !disabled && !isFree,
          'hover:border-blue-400 dark:hover:border-blue-500': !isMarked && !disabled && !isFree,
          'cursor-pointer': !disabled && !isFree,
        }
      )}
      whileHover={!disabled && !isFree ? { y: -2 } : {}}
      whileTap={!disabled && !isFree ? { scale: 0.95 } : {}}
    >
      {/* Cell background pattern for texture */}
      <div className={clsx(
        'absolute inset-0 opacity-5',
        {
          'bg-[radial-gradient(circle_at_1px_1px,_rgb(0_0_0_/_15%)_1px,_transparent_0)]': !isMarked,
          'bg-[size:8px_8px]': !isMarked,
        }
      )} />

      {/* Cell number/text */}
      <span className={clsx(
        'relative z-10 break-words px-1 text-center',
        {
          'font-extrabold tracking-tight': !isFree,
          'font-semibold text-amber-700 dark:text-amber-400': isFree,
        }
      )}>
        {cell.value}
      </span>

      {/* Stamp mark for marked cells */}
      {isMarked && !isFree && (
        <motion.div
          initial={{ scale: 0, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 25
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 stamp-animation"
        >
          {/* Checkmark or stamp effect */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            {/* Stamp circle background */}
            <div className={clsx(
              'absolute inset-0 rounded-full',
              {
                'bg-blue-400/30': !isPartOfBingo,
                'bg-yellow-300/50': isPartOfBingo,
              }
            )}
            style={{ transform: 'scale(1.8)' }}
            />

            {/* Checkmark icon */}
            <svg
              className={clsx(
                'relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 drop-shadow-lg',
                {
                  'text-white': !isPartOfBingo,
                  'text-yellow-700': isPartOfBingo,
                }
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* Bingo line sparkle effect */}
      {isPartOfBingo && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      )}
    </motion.button>
  );
}
