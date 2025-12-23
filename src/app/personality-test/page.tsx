import type { Metadata } from 'next';
import { Suspense } from 'react';
import PersonalityTestApp from './components/PersonalityTestApp';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: '성격 유형 테스트 - MBTI 스타일 16가지 유형',
  description: '나는 어떤 성격 유형일까? MBTI 스타일의 성격 유형 테스트로 16가지 유형 중 나의 성격을 알아보세요. 5분 안에 완료하고 결과를 SNS에 공유하세요.',
  keywords: '성격테스트, MBTI, 성격유형, 16Personalities, 심리테스트, 성격분석',
  openGraph: {
    title: '성격 유형 테스트 - MBTI 스타일 16가지 유형',
    description: '나는 어떤 성격 유형일까? 5분 안에 나의 성격 유형을 알아보세요.',
    type: 'website',
  },
};

export default function PersonalityTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <PersonalityTestApp />
    </Suspense>
  );
}
