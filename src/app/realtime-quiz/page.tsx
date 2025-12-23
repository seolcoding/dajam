import type { Metadata } from 'next';
import { Suspense } from 'react';
import RealtimeQuizApp from './components/RealtimeQuizApp';

export const metadata: Metadata = {
  title: '실시간 퀴즈쇼 - Kahoot 스타일 퀴즈 게임',
  description: '실시간 멀티플레이어 퀴즈 게임. 호스트가 퀴즈를 진행하고 참가자들이 모바일로 실시간 참여하며 리더보드에서 경쟁하세요.',
  keywords: '퀴즈, 실시간퀴즈, Kahoot, 퀴즈게임, 교육게임, 멀티플레이어',
  openGraph: {
    title: '실시간 퀴즈쇼 - Kahoot 스타일 퀴즈 게임',
    description: '실시간 멀티플레이어 퀴즈 게임. 호스트가 퀴즈를 진행하고 참가자들이 모바일로 실시간 참여.',
    type: 'website',
  },
};

export default function RealtimeQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xl font-semibold text-white">퀴즈를 불러오는 중...</p>
          </div>
        </div>
      }
    >
      <RealtimeQuizApp />
    </Suspense>
  );
}
