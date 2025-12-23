import { Metadata } from 'next';
import { CreateSessionPage } from '../components/CreateSessionPage';

export const metadata: Metadata = {
  title: '주문방 만들기 | 단체 주문',
  description: '단체 주문을 위한 주문방을 만들어보세요.',
};

export default function CreatePage() {
  return <CreateSessionPage />;
}
