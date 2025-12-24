import type { Metadata } from 'next';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FeaturesGrid } from '@/components/marketing/FeaturesGrid';
import { UseCaseCards } from '@/components/marketing/UseCaseCards';
import { PricingTable } from '@/components/marketing/PricingTable';
import { TestimonialSection } from '@/components/marketing/TestimonialSection';
import { CTASection } from '@/components/marketing/CTASection';

export const metadata: Metadata = {
  title: '다잼 - 다같이 재미있게! 실시간 인터랙션 플랫폼',
  description:
    '투표, 퀴즈, 워드클라우드부터 빙고까지 - 21가지 앱으로 청중과 실시간 소통하세요. 무료로 시작!',
  openGraph: {
    title: '다잼(DaJaem) - 우리들의 공간, 다잼!',
    description:
      '투표, 퀴즈, 워드클라우드부터 빙고까지 - 21가지 앱으로 청중과 실시간 소통하세요.',
  },
};

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <UseCaseCards />
      <PricingTable />
      <TestimonialSection />
      <CTASection />
    </>
  );
}
