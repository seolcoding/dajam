import { Metadata } from 'next';
import { HostDashboardPage } from '../../components/HostDashboardPage';

export const metadata: Metadata = {
  title: '주문 관리 | 단체 주문',
  description: '실시간으로 주문 현황을 확인하세요.',
};

interface HostPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function HostPage({ params }: HostPageProps) {
  const { sessionId } = await params;
  return <HostDashboardPage sessionId={sessionId} />;
}
