import type { Metadata } from 'next';
import { HumanBingoApp } from './components/HumanBingoApp';

export const metadata: Metadata = {
  title: 'Human Bingo | 미니 앱스',
  description: '네트워킹 아이스브레이킹 게임. 특성을 가진 사람을 찾아 빙고를 완성하세요!',
  keywords: ['휴먼빙고', '사람빙고', '네트워킹게임', '아이스브레이킹', '팀빌딩'],
};

export default function HumanBingoPage() {
  return <HumanBingoApp />;
}
