import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Star, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background Gradient - DaJaem Colors */}
      <div className="absolute inset-0 bg-gradient-to-b from-dajaem-green-50 via-dajaem-yellow-50/30 to-transparent opacity-60" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-dajaem-green/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-dajaem-yellow/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-dajaem-green/20 rounded-full px-4 py-2 mb-6 shadow-sm animate-slide-up">
            <Sparkles className="w-4 h-4 text-dajaem-yellow" />
            <span className="text-sm font-medium text-slate-700">
              다같이 재미있게! 21가지 인터랙션 앱
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 animate-slide-up">
            우리들의 공간,
            <br />
            <span className="bg-gradient-to-r from-dajaem-green to-dajaem-teal bg-clip-text text-transparent">
              다잼! 🎯
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto animate-slide-up-delayed">
            투표, 퀴즈, 워드클라우드부터 빙고까지 - 모두가 함께하는 실시간 인터랙션
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in">
            <Link href="/signup">
              <Button size="lg" variant="default" className="px-8 h-12">
                지금 바로 시작! 🚀
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/apps">
              <Button size="lg" variant="outline" className="px-8 h-12">
                앱 둘러보기
              </Button>
            </Link>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm animate-fade-in">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-dajaem-green/20 rounded-full px-4 py-2 shadow-sm hover:shadow-glow-green transition-shadow">
              <Users className="w-4 h-4 text-dajaem-green" />
              <span className="text-slate-700">
                <strong className="font-semibold text-dajaem-green">3,245+</strong> 세션
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-dajaem-yellow/30 rounded-full px-4 py-2 shadow-sm hover:shadow-glow-yellow transition-shadow">
              <Star className="w-4 h-4 text-dajaem-yellow" />
              <span className="text-slate-700">
                <strong className="font-semibold">21개</strong> 앱
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-dajaem-green/20 rounded-full px-4 py-2 shadow-sm hover:shadow-glow-green transition-shadow">
              <Sparkles className="w-4 h-4 text-dajaem-purple" />
              <span className="text-slate-700">
                <strong className="font-semibold text-dajaem-green">무료</strong> 시작
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
