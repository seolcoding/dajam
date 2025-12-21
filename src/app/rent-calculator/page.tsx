import { Metadata } from 'next';
import { RentCalculatorClient } from './RentCalculatorClient';

export const metadata: Metadata = {
  title: '전세/월세 계산기 | 전월세 변환 및 비용 비교',
  description: '전세와 월세를 비교하고, 실제 부담액을 계산하세요. 법정 전월세 전환율을 적용한 정확한 계산을 제공합니다.',
};

export default function RentCalculatorPage() {
  return <RentCalculatorClient />;
}
