import { Metadata } from 'next';
import { HomePage } from './components/HomePage';

export const metadata: Metadata = {
  title: '실시간 투표 플랫폼 | 세올코딩',
  description: 'QR 코드로 간편하게 투표를 만들고, 실시간으로 결과를 확인하세요. 단일 선택, 복수 선택, 순위 투표까지 다양한 형태의 투표를 지원합니다.',
  keywords: ['실시간 투표', 'QR 투표', '온라인 투표', '투표 플랫폼', '순위 투표', 'Borda Count'],
  openGraph: {
    title: '실시간 투표 플랫폼',
    description: 'QR 코드로 간편하게 투표를 만들고, 실시간으로 결과를 확인하세요.',
    type: 'website',
  },
};

export default function LiveVotingPage() {
  return <HomePage />;
}
