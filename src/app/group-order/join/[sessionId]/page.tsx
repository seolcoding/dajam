import { Metadata } from 'next';
import { JoinSessionPage } from '../../components/JoinSessionPage';

export const metadata: Metadata = {
  title: '주문하기 | 단체 주문',
  description: '단체 주문에 참여하세요.',
};

interface JoinPageProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { sessionId } = await params;
  return <JoinSessionPage sessionId={sessionId} />;
}
