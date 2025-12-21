import { Metadata } from 'next';
import { VoteView } from '../../components/VoteView';

export const metadata: Metadata = {
  title: '투표하기 | 실시간 투표 플랫폼',
  description: '실시간 투표에 참여하세요.',
};

interface VotePageProps {
  params: Promise<{
    pollId: string;
  }>;
}

export default async function VotePage({ params }: VotePageProps) {
  const { pollId } = await params;
  return <VoteView pollId={pollId} />;
}
