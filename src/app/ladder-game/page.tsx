import type { Metadata } from 'next';
import { LadderGameApp } from './LadderGameApp';

export const metadata: Metadata = {
  title: '사다리 타기 게임 | 세올코딩',
  description: '공정한 랜덤 추첨을 위한 사다리 타기 게임입니다. 참가자와 결과를 입력하고 사다리를 타보세요!',
  keywords: ['사다리타기', '사다리게임', '랜덤추첨', '공정추첨', '온라인게임'],
  openGraph: {
    title: '사다리 타기 게임',
    description: '공정한 랜덤 추첨을 위한 사다리 타기 게임',
    type: 'website',
  },
};

export default function LadderGamePage() {
  return <LadderGameApp />;
}
