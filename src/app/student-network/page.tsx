import type { Metadata } from 'next';
import { StudentNetworkApp } from './components/StudentNetworkApp';

export const metadata: Metadata = {
  title: '수강생 네트워킹 - 학력이 아닌 관심사로 연결되는',
  description: '학력이 아닌 관심사로 수강생들과 연결되어 보세요. 프로필을 만들고, 교실에 참여하며, 비슷한 관심사를 가진 사람들과 네트워킹하세요.',
  keywords: ['네트워킹', '수강생', '관심사', '매칭', '아이스브레이킹', '교육', '온라인 교실'],
  openGraph: {
    title: '수강생 네트워킹',
    description: '학력이 아닌 관심사로 연결되는 네트워킹 플랫폼',
    type: 'website',
  },
};

export default function StudentNetworkPage() {
  return <StudentNetworkApp />;
}
