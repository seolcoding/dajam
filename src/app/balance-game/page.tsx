import type { Metadata } from 'next';
import { Suspense } from 'react';
import BalanceGameApp from './components/BalanceGameApp';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: '밸런스 게임 - A vs B 당신의 선택은?',
  description: '재미있는 밸런스 게임으로 당신의 선택을 공유하세요. 음식, 여행, 가치관, 연애, 직장 등 다양한 카테고리의 질문들이 준비되어 있습니다.',
  keywords: '밸런스게임, 선택게임, 투표, A vs B, 심리테스트',
  openGraph: {
    title: '밸런스 게임 - A vs B 당신의 선택은?',
    description: '재미있는 밸런스 게임으로 당신의 선택을 공유하세요.',
    type: 'website',
  },
};

export default function BalanceGamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <BalanceGameApp />
    </Suspense>
  );
}
