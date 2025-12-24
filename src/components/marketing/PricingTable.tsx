import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '₩0',
    period: '영구 무료',
    description: '개인 사용자와 소규모 팀을 위한',
    features: [
      '세션당 최대 30명 참여',
      '월 10개 세션',
      '5개 기본 앱 사용',
      '로컬 모드 (브라우저 저장)',
      '커뮤니티 지원',
    ],
    cta: '무료로 시작하기',
    ctaLink: '/signup',
    popular: false,
  },
  {
    name: 'Pro',
    price: '₩29,000',
    period: '월',
    description: '전문가와 조직을 위한',
    features: [
      '세션당 무제한 참여자',
      '무제한 세션',
      '전체 21개 앱 사용',
      '클라우드 동기화 & 백업',
      '분석 리포트 & 인사이트',
      '브랜딩 커스터마이징',
      '우선 지원',
    ],
    cta: 'Pro로 업그레이드',
    ctaLink: '/signup?plan=pro',
    popular: true,
  },
];

export function PricingTable() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            간단한 가격 정책
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            무료로 시작하고, 필요할 때 Pro로 업그레이드하세요
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`border-2 transition-all duration-200 hover:shadow-xl ${
                plan.popular
                  ? 'border-dajaem-green shadow-lg shadow-dajaem-green/10 relative'
                  : 'border-slate-200 hover:border-dajaem-green/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge variant="default" className="px-4 py-1 shadow-lg">
                    <Sparkles className="w-3 h-3 mr-1" />
                    추천! 🔥
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-slate-600">
                  {plan.description}
                </CardDescription>
                <div className="pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-dajaem-green' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    <span className="text-slate-600">/ {plan.period}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-dajaem-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-dajaem-green" />
                      </div>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaLink}>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 text-sm text-slate-500">
          모든 플랜은 신용카드 없이 시작할 수 있습니다
        </div>
      </div>
    </section>
  );
}
