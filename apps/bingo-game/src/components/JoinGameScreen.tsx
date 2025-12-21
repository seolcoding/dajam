import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LogIn } from 'lucide-react';
import { useBingoStore } from '@/stores/useBingoStore';
import { validateGameCode } from '@/utils/gameCodeGenerator';

export function JoinGameScreen() {
  const { setGameMode, joinGame, config } = useBingoStore();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    const code = gameCode.toUpperCase().trim();

    if (!validateGameCode(code)) {
      setError('6자리 코드를 입력해주세요');
      return;
    }

    // In a real app, this would verify the code with a backend
    // For now, we'll just accept any valid format
    joinGame(code);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md mx-auto py-20">
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            게임 참여
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            호스트가 제공한 6자리 게임 코드를 입력하세요
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                게임 코드
              </label>
              <input
                type="text"
                value={gameCode}
                onChange={(e) => {
                  setGameCode(e.target.value.toUpperCase());
                  setError('');
                }}
                maxLength={6}
                placeholder="예: ABC123"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl font-mono tracking-widest uppercase focus:border-green-500 focus:outline-none"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoin}
              disabled={gameCode.length < 6}
              className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn className="w-6 h-6" />
              <span>참여하기</span>
            </motion.button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>참고:</strong> 이 데모 버전에서는 게임 코드를 입력하면 자동으로
              빙고판이 생성됩니다. 실제 서비스에서는 호스트와 실시간으로 연결됩니다.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
