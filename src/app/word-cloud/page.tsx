import type { Metadata } from 'next';
import { Suspense } from 'react';
import WordCloudApp from './components/WordCloudApp';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: '워드 클라우드 - 실시간 의견 수집 및 시각화',
  description:
    '실시간으로 참가자들의 텍스트 입력을 수집하여 워드 클라우드를 생성하는 아이스브레이킹 도구입니다. 강의, 워크샵, 회의에서 즉각적인 시각화로 의견을 통합하세요.',
  keywords: [
    '워드클라우드',
    '실시간 투표',
    '의견 수집',
    '아이스브레이킹',
    'Mentimeter',
    '브레인스토밍',
    '워크샵',
  ],
  openGraph: {
    title: '워드 클라우드 - 실시간 의견 수집 및 시각화',
    description:
      '실시간으로 참가자들의 의견을 수집하고 아름다운 워드 클라우드로 시각화하세요.',
    type: 'website',
  },
};

export default function WordCloudPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-xl font-semibold text-gray-600">
              워드 클라우드를 불러오는 중...
            </p>
          </div>
        </div>
      }
    >
      <WordCloudApp />
    </Suspense>
  );
}
