import { Metadata } from 'next';
import { SummaryPage } from '../../components/SummaryPage';

export const metadata: Metadata = {
  title: '주문 집계 | 단체 주문',
  description: '전체 주문 내역을 확인하세요.',
};

interface SummaryPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function SummaryPageRoute({ params }: SummaryPageProps) {
  const { sessionId } = await params;
  return <SummaryPage sessionId={sessionId} />;
}
