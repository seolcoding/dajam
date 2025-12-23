import type { Metadata } from 'next';
import { Suspense } from 'react';
import ThisOrThatApp from './components/ThisOrThatApp';

export const metadata: Metadata = {
  title: 'This or That - 실시간 그룹 투표 게임',
  description: '소규모 그룹에서 실시간으로 A/B 선택 투표를 진행하세요. QR 코드로 간편하게 참여하고, 결과를 즉시 확인할 수 있는 아이스브레이킹 앱입니다.',
  keywords: 'This or That, 투표, 실시간투표, 그룹게임, 아이스브레이킹, 워크샵, 밸런스게임, QR코드',
  openGraph: {
    title: 'This or That - 실시간 그룹 투표 게임',
    description: '소규모 그룹에서 실시간으로 A/B 선택 투표를 진행하세요.',
    type: 'website',
  },
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}

export default function ThisOrThatPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ThisOrThatApp />
    </Suspense>
  );
}
