import type { Metadata } from 'next';
import { IdValidatorClient } from './IdValidatorClient';

export const metadata: Metadata = {
  title: '신분증 번호 검증기 | 다잼',
  description: '주민등록번호, 사업자등록번호, 법인등록번호의 유효성을 검증합니다. 개발 및 테스트 목적 전용.',
  keywords: ['주민등록번호', '사업자등록번호', '법인등록번호', '검증', '유효성 검사', 'ID validator'],
};

export default function IdValidatorPage() {
  return <IdValidatorClient />;
}
