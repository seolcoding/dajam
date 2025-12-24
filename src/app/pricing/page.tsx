import type { Metadata } from 'next';
import { PricingTable } from '@/components/marketing/PricingTable';
import { CTASection } from '@/components/marketing/CTASection';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const metadata: Metadata = {
  title: '가격 정책',
  description: '무료로 시작하고, 필요할 때 Pro로 업그레이드하세요',
};

const faqs = [
  {
    question: '무료 플랜으로 어디까지 사용할 수 있나요?',
    answer:
      '무료 플랜은 세션당 최대 30명, 월 10개 세션, 5개 기본 앱을 사용할 수 있습니다. 로컬 모드로 동작하며 브라우저에 데이터가 저장됩니다. 개인 사용자나 소규모 팀에게 충분합니다.',
  },
  {
    question: 'Pro 플랜의 주요 장점은 무엇인가요?',
    answer:
      'Pro 플랜은 무제한 참여자, 무제한 세션, 전체 21개 앱, 클라우드 동기화, 분석 리포트, 브랜딩 커스터마이징을 제공합니다. 전문가와 조직에 최적화되어 있습니다.',
  },
  {
    question: '결제는 어떻게 하나요?',
    answer:
      '신용카드 또는 체크카드로 결제할 수 있습니다. 월간 자동 결제이며 언제든 취소할 수 있습니다. 첫 결제는 가입 즉시 진행되며, 이후 매월 같은 날짜에 청구됩니다.',
  },
  {
    question: '언제든 플랜을 변경하거나 취소할 수 있나요?',
    answer:
      '네, 언제든 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 취소도 즉시 가능하며, 취소 후에도 결제한 기간이 끝날 때까지는 Pro 기능을 사용할 수 있습니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer:
      '가입 후 7일 이내 환불을 요청하시면 전액 환불해드립니다. 7일 이후에는 사용한 기간만큼 일할 계산하여 환불해드립니다.',
  },
  {
    question: '기업용 플랜이나 대량 구매 할인이 있나요?',
    answer:
      '10명 이상의 사용자가 필요한 경우 별도 문의 주시면 맞춤 견적을 제공해드립니다. contact@seolcoding.com으로 문의해주세요.',
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Pricing Section */}
      <PricingTable />

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-slate-600 mb-12 text-center">
              궁금한 점이 있으신가요? 아래에서 답을 찾아보세요.
            </p>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`item-${idx}`}
                  className="bg-white border border-slate-200 rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="text-center mt-12">
              <p className="text-slate-600 mb-4">
                다른 질문이 있으신가요?
              </p>
              <a
                href="mailto:contact@seolcoding.com"
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                contact@seolcoding.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
