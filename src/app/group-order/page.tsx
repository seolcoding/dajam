import { Metadata } from 'next';
import { HomePage } from './components/HomePage';

export const metadata: Metadata = {
  title: '단체 주문 | 그룹 주문 통합',
  description: '회식, 단체 주문을 간편하게! QR 코드로 주문하고 자동으로 집계하세요.',
};

export default function GroupOrderPage() {
  return <HomePage />;
}
