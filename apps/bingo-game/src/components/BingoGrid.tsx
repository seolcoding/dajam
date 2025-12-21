import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import type { BingoState } from '@/types/bingo.types';
import { BingoCell } from './BingoCell';

interface BingoGridProps {
  state: BingoState;
  onCellClick: (row: number, col: number) => void;
  disabled?: boolean;
}

export function BingoGrid({ state, onCellClick, disabled = false }: BingoGridProps) {
  const { cells, completedLines } = state;
  const gridSize = state.gridSize;

  // Find cells that are part of bingo lines
  const bingoLineSet = new Set<string>();
  completedLines.forEach(line => {
    line.cells.forEach(([row, col]) => {
      bingoLineSet.add(`${row}-${col}`);
    });
  });

  const isPartOfBingo = (row: number, col: number): boolean => {
    return bingoLineSet.has(`${row}-${col}`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Bingo Card Container - Classic card feel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 border-4 border-gray-200 dark:border-gray-700"
      >
        {/* Card header stripe - classic bingo card style */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 rounded-t-xl" />

        {/* "BINGO" header letters */}
        <div className={clsx(
          'grid gap-2 mb-4 mt-2',
          {
            'grid-cols-3': gridSize === 3,
            'grid-cols-4': gridSize === 4,
            'grid-cols-5': gridSize === 5,
          }
        )}>
          {Array.from({ length: gridSize }).map((_, index) => {
            const letters = gridSize === 3 ? ['B', 'I', 'O'] :
                          gridSize === 4 ? ['B', 'I', 'N', 'O'] :
                          ['B', 'I', 'N', 'G', 'O'];
            return (
              <div
                key={index}
                className="text-center font-black text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300"
              >
                {letters[index]}
              </div>
            );
          })}
        </div>

        {/* Grid with paper texture effect */}
        <div className="relative">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

          {/* The actual bingo grid */}
          <div
            className={clsx(
              'grid gap-2 sm:gap-3 relative',
              {
                'grid-cols-3': gridSize === 3,
                'grid-cols-4': gridSize === 4,
                'grid-cols-5': gridSize === 5,
              }
            )}
          >
            {cells.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <BingoCell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  isPartOfBingo={isPartOfBingo(rowIndex, colIndex)}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  disabled={disabled}
                />
              ))
            )}
          </div>
        </div>

        {/* Card number/authenticity mark at bottom */}
        <div className="mt-4 text-center text-xs text-gray-400 dark:text-gray-600 font-mono">
          CARD #{Math.random().toString(36).substring(2, 8).toUpperCase()}
        </div>
      </motion.div>
    </div>
  );
}
