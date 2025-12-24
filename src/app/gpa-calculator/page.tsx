import type { Metadata } from 'next';
import { GPACalculatorClient } from './components/GPACalculatorClient';

export const metadata: Metadata = {
  title: '학점 계산기 - 다잼',
  description: '학기별 성적 관리 및 GPA 계산. 누적 GPA, 전공 GPA, 교양 GPA를 쉽게 계산하고 관리하세요.',
  keywords: ['학점 계산기', 'GPA 계산', '성적 관리', '누적 평점', '전공 학점', '교양 학점'],
  openGraph: {
    title: '학점 계산기',
    description: '학기별 성적 관리 및 GPA 계산',
    type: 'website',
  },
};

export default function GPACalculatorPage() {
  return <GPACalculatorClient />;
}
