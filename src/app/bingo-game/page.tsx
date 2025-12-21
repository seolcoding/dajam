import type { Metadata } from 'next';
import { BingoGame } from './components/BingoGame';

export const metadata: Metadata = {
  title: '빙고 게임 | 미니 앱스',
  description: '친구들과 함께 즐기는 빙고! 숫자, 단어, 테마 빙고 지원. 3x3, 4x4, 5x5 크기 선택 가능.',
  keywords: ['빙고', '빙고게임', '온라인빙고', '호스트모드', '플레이어모드'],
};

export default function BingoGamePage() {
  return <BingoGame />;
}
