import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play } from 'lucide-react';
import { useBingoStore } from '@/stores/useBingoStore';
import { THEME_PRESETS } from '@/data/themePresets';
import type { BingoType, GridSize, BingoConfig } from '@/types/bingo.types';

export function GameSetupScreen() {
  const { setGameMode, createGame } = useBingoStore();
  const [bingoType, setBingoType] = useState<BingoType>('number');
  const [gridSize, setGridSize] = useState<GridSize>(5);
  const [selectedTheme, setSelectedTheme] = useState<string>('numbers-25');
  const [customItems, setCustomItems] = useState<string>('');
  const [centerFree, setCenterFree] = useState(true);

  const handleStartGame = () => {
    let items: string[] = [];

    if (bingoType === 'number') {
      const total = gridSize * gridSize;
      items = Array.from({ length: total }, (_, i) => String(i + 1));
    } else if (bingoType === 'theme') {
      const theme = THEME_PRESETS.find(t => t.id === selectedTheme);
      if (theme) {
        items = theme.items;
      }
    } else if (bingoType === 'word') {
      items = customItems
        .split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }

    const config: BingoConfig = {
      type: bingoType,
      gridSize,
      items,
      winConditions: ['single-line'],
      centerFree: gridSize === 5 && centerFree,
    };

    createGame(config);
  };

  const availableThemes = THEME_PRESETS.filter(t => t.gridSize === gridSize);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <button
          onClick={() => setGameMode('menu')}
          className="mb-6 flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>돌아가기</span>
        </button>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            게임 설정
          </h2>

          <div className="space-y-6">
            {/* 그리드 크기 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                빙고판 크기
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 4, 5].map((size) => (
                  <button
                    key={size}
                    onClick={() => setGridSize(size as GridSize)}
                    className={`
                      py-3 px-4 rounded-lg font-semibold transition-all
                      ${gridSize === size
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {size}x{size}
                  </button>
                ))}
              </div>
            </div>

            {/* 빙고 타입 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                빙고 유형
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'number', label: '숫자' },
                  { value: 'theme', label: '테마' },
                  { value: 'word', label: '커스텀' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setBingoType(type.value as BingoType)}
                    className={`
                      py-3 px-4 rounded-lg font-semibold transition-all
                      ${bingoType === type.value
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 테마 선택 */}
            {bingoType === 'theme' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  테마 선택
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none"
                >
                  {availableThemes.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 커스텀 아이템 */}
            {bingoType === 'word' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  단어 입력 (줄바꿈으로 구분)
                </label>
                <textarea
                  value={customItems}
                  onChange={(e) => setCustomItems(e.target.value)}
                  rows={10}
                  placeholder="사과&#10;바나나&#10;포도&#10;..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none"
                />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  최소 {gridSize * gridSize}개 필요 (현재:{' '}
                  {customItems.split('\n').filter(s => s.trim()).length}개)
                </p>
              </div>
            )}

            {/* 중앙 FREE 칸 */}
            {gridSize === 5 && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="centerFree"
                  checked={centerFree}
                  onChange={(e) => setCenterFree(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="centerFree"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  중앙 칸 FREE로 시작
                </label>
              </div>
            )}

            {/* 시작 버튼 */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartGame}
              className="w-full py-4 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              <Play className="w-6 h-6" />
              <span>게임 시작</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
