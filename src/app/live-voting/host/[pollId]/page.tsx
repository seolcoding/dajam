import { Metadata } from 'next';
import { HostView } from '../../components/HostView';

export const metadata: Metadata = {
  title: '호스트 뷰 | 실시간 투표 플랫폼',
  description: '투표 결과를 실시간으로 확인하고 QR 코드를 공유하세요.',
};

interface HostPageProps {
  params: Promise<{
    pollId: string;
  }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { pollId } = await params;
  return <HostView pollId={pollId} />;
}
