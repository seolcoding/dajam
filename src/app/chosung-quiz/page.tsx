import { Metadata } from 'next';
import ChosungQuizClient from './ChosungQuizClient';

export const metadata: Metadata = {
  title: '초성 퀴즈 - 초성을 보고 단어를 맞춰보세요!',
  description: '영화, 음식, K-POP, 속담/사자성어 등 다양한 카테고리의 초성 퀴즈 게임입니다. 초성을 보고 정답을 맞춰보세요!',
  keywords: ['초성 퀴즈', '한글 게임', '퀴즈', '초성 게임', '단어 맞추기'],
  openGraph: {
    title: '초성 퀴즈',
    description: '초성을 보고 단어를 맞춰보세요!',
    type: 'website',
  },
};

export default function ChosungQuizPage() {
  return <ChosungQuizClient />;
}
