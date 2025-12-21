import type { Metadata } from 'next';
import { TeamDivider } from './components/TeamDivider';

export const metadata: Metadata = {
  title: '팀 나누기 | SeolCoding Apps',
  description: '공정한 랜덤 알고리즘으로 팀을 자동 분배하고, QR 코드로 결과를 공유하세요. Fisher-Yates 알고리즘을 사용하여 공정한 랜덤 분배를 보장합니다.',
  keywords: ['팀 나누기', '팀 분배', '랜덤 분배', 'QR 코드', 'Fisher-Yates', '공정한 분배', '팀 배정'],
  openGraph: {
    title: '팀 나누기 | SeolCoding Apps',
    description: '공정한 랜덤 알고리즘으로 팀을 자동 분배하고, QR 코드로 결과를 공유하세요',
    type: 'website',
  },
};

export default function TeamDividerPage() {
  return <TeamDivider />;
}
