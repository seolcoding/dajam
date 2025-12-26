import type { Metadata } from 'next';
import { Suspense } from 'react';
import AudienceEngageApp from './components/AudienceEngageApp';

export const metadata: Metadata = {
  title: 'Audience Engage - 실시간 청중 참여 플랫폼',
  description: '슬라이드와 함께 퀴즈, 투표, 워드클라우드 등 다양한 인터랙션을 실시간으로 진행하세요. Slido/Mentimeter 대안.',
  keywords: ['실시간 발표', '청중 참여', '투표', '퀴즈', 'Q&A', '슬라이드'],
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dajaem-green mx-auto mb-4" />
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    </div>
  );
}

export default function AudienceEngagePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AudienceEngageApp />
    </Suspense>
  );
}
