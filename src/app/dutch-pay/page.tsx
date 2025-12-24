import type { Metadata } from 'next';
import { DutchPayApp } from './DutchPayApp';

export const metadata: Metadata = {
  title: '더치페이 정산 | 다잼',
  description: '모임 후 정산을 간편하게 처리하세요. 최소 송금 횟수로 최적화합니다.',
};

export default function DutchPayPage() {
  return <DutchPayApp />;
}
