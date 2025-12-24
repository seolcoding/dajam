import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-dajaem-teal to-dajaem-green">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
            <span className="text-4xl">🎯</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            다같이 재미있게, 다잼! 🎉
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            회원가입 후 바로 21가지 앱을 사용할 수 있습니다.
            <br />
            무료 플랜으로 충분히 체험해보세요!
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 h-12 text-dajaem-teal font-bold"
              >
                지금 바로 시작! 🚀
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Subtext */}
          <p className="text-sm text-white/70 mt-6">
            신용카드 없이 시작 가능 • 언제든 업그레이드 또는 취소 가능
          </p>
        </div>
      </div>
    </section>
  );
}
