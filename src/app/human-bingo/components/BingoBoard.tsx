'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Star } from 'lucide-react';
import { isCellInBingoLine } from '../utils/bingo';
import type { ParticipantCard, BingoCell as BingoCellType } from '../types';

interface BingoBoardProps {
  card: ParticipantCard;
  onCellClick: (row: number, col: number) => void;
}

export function BingoBoard({ card, onCellClick }: BingoBoardProps) {
  const gridSize = card.card.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border-4 border-purple-200 dark:border-purple-700"
      >
        {/* Grid */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {card.card.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <BingoCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                isInBingoLine={isCellInBingoLine(rowIndex, colIndex, card.completedLines)}
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

interface BingoCellProps {
  cell: BingoCellType;
  isInBingoLine: boolean;
  onClick: () => void;
}

function BingoCell({ cell, isInBingoLine, onClick }: BingoCellProps) {
  const isFree = cell.trait === null;

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={cell.isChecked}
      className={`
        relative aspect-square rounded-lg p-2 sm:p-3
        flex flex-col items-center justify-center
        text-xs sm:text-sm font-medium
        transition-all duration-200
        ${
          isFree
            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white'
            : cell.isChecked
            ? isInBingoLine
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg scale-105'
              : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
            : 'bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600'
        }
      `}
    >
      {/* FREE cell */}
      {isFree && (
        <div className="flex flex-col items-center gap-1">
          <Star className="w-6 h-6 sm:w-8 sm:h-8" />
          <span className="font-black text-sm sm:text-base">FREE</span>
        </div>
      )}

      {/* Regular cell */}
      {!isFree && cell.trait && (
        <>
          <div className="text-center line-clamp-3 leading-tight">
            {cell.trait.text}
          </div>

          {/* Check icon */}
          {cell.isChecked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1 right-1"
            >
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.div>
          )}

          {/* Checked by name */}
          {cell.isChecked && cell.checkedBy && (
            <div className="absolute bottom-1 left-1 right-1 text-center">
              <div className="text-xs bg-black/20 rounded px-1 py-0.5 truncate">
                {cell.checkedBy}
              </div>
            </div>
          )}

          {/* Bingo line highlight */}
          {isInBingoLine && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 border-4 border-yellow-400 rounded-lg pointer-events-none"
            />
          )}
        </>
      )}
    </motion.button>
  );
}
