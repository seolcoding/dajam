import { Metadata } from 'next';
import { CreatePoll } from '../components/CreatePoll';

export const metadata: Metadata = {
  title: '투표 생성 | 실시간 투표 플랫폼',
  description: '새로운 실시간 투표를 생성하세요. 단일 선택, 복수 선택, 순위 투표를 지원합니다.',
};

export default function CreatePollPage() {
  return <CreatePoll />;
}
