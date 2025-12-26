'use client';

import { motion } from 'framer-motion';
import { Users, Gamepad2, Play } from 'lucide-react';
import { useBingoStore } from '../stores/useBingoStore';
import { AppHeader, AppFooter } from '@/components/layout';

export function MenuScreen() {
  const { setGameMode } = useBingoStore();

  const menuItems = [
    {
      id: 'host',
      icon: Users,
      title: '호스트 모드',
      description: '게임을 생성하고 호출하기',
      color: 'blue',
      onClick: () => setGameMode('setup'),
    },
    {
      id: 'join',
      icon: Play,
      title: '플레이어 모드',
      description: '게임 코드로 참여하기',
      color: 'green',
      onClick: () => setGameMode('join'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <AppHeader
        title="빙고 게임"
        description="친구들과 함께 즐기는 빙고!"
        emoji="🎰"
        iconGradient="from-blue-500 to-indigo-600"
      />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">

        <div className="grid md:grid-cols-2 gap-6">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={item.onClick}
              className={`
                p-8 rounded-2xl shadow-xl
                bg-white dark:bg-gray-800
                border-2 ${item.color === 'blue' ? 'border-blue-200 dark:border-blue-700 hover:border-blue-400' : 'border-green-200 dark:border-green-700 hover:border-green-400'}
                transition-all duration-300
                text-left
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'}`}>
                  <item.icon className={`w-8 h-8 ${item.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>숫자, 단어, 테마 빙고 지원 | 3x3, 4x4, 5x5 크기 선택</p>
        </motion.div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
