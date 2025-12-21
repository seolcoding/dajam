import { Metadata } from 'next';
import { SalaryCalculatorApp } from './SalaryCalculatorApp';

export const metadata: Metadata = {
  title: '급여 실수령액 계산기 | 세올코딩',
  description: '연봉 협상 시 얼마를 받게 될까요? 2025년 기준 4대보험료율 및 간이세액표를 적용한 급여 실수령액 계산기입니다.',
  keywords: ['급여계산기', '실수령액', '연봉계산', '4대보험', '세금계산', '월급계산'],
  openGraph: {
    title: '급여 실수령액 계산기',
    description: '연봉 협상 시 얼마를 받게 될까요? 4대보험 및 세금 공제 후 실수령액을 확인하세요.',
    type: 'website',
  },
};

export default function SalaryCalculatorPage() {
  return <SalaryCalculatorApp />;
}
