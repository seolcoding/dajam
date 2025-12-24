'use client';

import type { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';

// Note: Metadata export is not allowed in client components
// This page should be server component if metadata is needed
// For now, keeping as client component for interactive features
import {
  Calculator,
  Gamepad2,
  Users,
  Trophy,
  DollarSign,
  GraduationCap,
  Home,
  CreditCard,
  Vote,
  Network,
  UtensilsCrossed,
  Grid3X3,
  Scale,
  Shuffle,
  MessageSquare,
  ShoppingCart,
  Flame,
  Star,
  Briefcase,
  Mail,
  ArrowRight,
  Zap,
  HelpCircle,
  Cloud,
  Heart,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// App categories
const categories = {
  calculator: {
    name: '계산기',
    icon: Calculator,
    description: '복잡한 계산을 간단하게',
  },
  game: {
    name: '게임',
    icon: Gamepad2,
    description: '친구들과 함께 즐기는',
  },
  utility: {
    name: '업무 도구',
    icon: Briefcase,
    description: '업무 효율을 높이는',
  },
};

// App data with categories and popularity
const apps = [
  // Calculators
  {
    name: '급여 계산기',
    path: '/salary-calculator',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
    description: '연봉/월급 실수령액 계산',
    category: 'calculator',
    popular: true,
  },
  {
    name: '전월세 계산기',
    path: '/rent-calculator',
    icon: Home,
    color: 'from-blue-500 to-indigo-600',
    description: '전세/월세 비교 분석',
    category: 'calculator',
  },
  {
    name: '학점 계산기',
    path: '/gpa-calculator',
    icon: GraduationCap,
    color: 'from-violet-500 to-purple-600',
    description: '학점 평균 계산',
    category: 'calculator',
  },
  {
    name: '더치페이',
    path: '/dutch-pay',
    icon: CreditCard,
    color: 'from-orange-500 to-red-600',
    description: '정산 금액 계산',
    category: 'calculator',
  },

  // Games
  {
    name: '이상형 월드컵',
    path: '/ideal-worldcup',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-600',
    description: '토너먼트 게임',
    category: 'game',
  },
  {
    name: '밸런스 게임',
    path: '/balance-game',
    icon: Scale,
    color: 'from-pink-500 to-rose-600',
    description: '양자택일 게임',
    category: 'game',
    popular: true,
    trending: true,
  },
  {
    name: '초성 퀴즈',
    path: '/chosung-quiz',
    icon: MessageSquare,
    color: 'from-cyan-500 to-blue-600',
    description: '초성으로 단어 맞추기',
    category: 'game',
  },
  {
    name: '사다리 게임',
    path: '/ladder-game',
    icon: Gamepad2,
    color: 'from-lime-500 to-green-600',
    description: '사다리 타기',
    category: 'game',
  },
  {
    name: '빙고 게임',
    path: '/bingo-game',
    icon: Grid3X3,
    color: 'from-fuchsia-500 to-pink-600',
    description: '빙고!',
    category: 'game',
  },
  {
    name: 'This or That',
    path: '/this-or-that',
    icon: Zap,
    color: 'from-violet-500 to-indigo-600',
    description: '실시간 A/B 투표',
    category: 'game',
    isNew: true,
  },
  {
    name: '실시간 퀴즈',
    path: '/realtime-quiz',
    icon: HelpCircle,
    color: 'from-emerald-500 to-cyan-600',
    description: 'Kahoot 스타일 퀴즈쇼',
    category: 'game',
    isNew: true,
    trending: true,
  },
  {
    name: '워드 클라우드',
    path: '/word-cloud',
    icon: Cloud,
    color: 'from-sky-500 to-blue-600',
    description: '실시간 단어 구름',
    category: 'game',
    isNew: true,
  },
  {
    name: '성격 테스트',
    path: '/personality-test',
    icon: Heart,
    color: 'from-rose-500 to-pink-600',
    description: 'MBTI 스타일 16유형',
    category: 'game',
    isNew: true,
  },
  {
    name: '사람 빙고',
    path: '/human-bingo',
    icon: UserCheck,
    color: 'from-amber-500 to-orange-600',
    description: '네트워킹 아이스브레이킹',
    category: 'game',
    isNew: true,
  },

  // Utilities
  {
    name: '실시간 투표',
    path: '/live-voting',
    icon: Vote,
    color: 'from-sky-500 to-cyan-600',
    description: '실시간 투표',
    category: 'utility',
    popular: true,
    isNew: true,
  },
  {
    name: '랜덤 뽑기',
    path: '/random-picker',
    icon: Shuffle,
    color: 'from-amber-500 to-orange-600',
    description: '무작위 선택',
    category: 'utility',
  },
  {
    name: '팀 나누기',
    path: '/team-divider',
    icon: Users,
    color: 'from-teal-500 to-emerald-600',
    description: '공정한 팀 배정',
    category: 'utility',
  },
  {
    name: '점심 룰렛',
    path: '/lunch-roulette',
    icon: UtensilsCrossed,
    color: 'from-red-500 to-pink-600',
    description: '오늘 점심 뭐 먹지?',
    category: 'utility',
    popular: true,
  },
  {
    name: '단체 주문',
    path: '/group-order',
    icon: ShoppingCart,
    color: 'from-indigo-500 to-violet-600',
    description: '단체 주문 통합',
    category: 'utility',
  },
  {
    name: '신분증 검증기',
    path: '/id-validator',
    icon: CreditCard,
    color: 'from-slate-500 to-gray-600',
    description: '주민번호 유효성 검사',
    category: 'utility',
  },
  {
    name: '수강생 네트워킹',
    path: '/student-network',
    icon: Network,
    color: 'from-rose-500 to-red-600',
    description: '수강생 연결',
    category: 'utility',
    isNew: true,
  },
];

function AppCard({
  app,
}: {
  app: (typeof apps)[0];
}) {
  return (
    <Link
      href={app.path}
      className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all duration-200 hover:-translate-y-1"
    >
      {/* Badges */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {app.trending && (
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <Flame className="w-3 h-3" /> HOT
          </span>
        )}
        {app.isNew && (
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
            NEW
          </span>
        )}
        {app.popular && !app.trending && !app.isNew && (
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
            <Star className="w-3 h-3" />
          </span>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
      >
        <app.icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{app.name}</h3>
      <p className="text-sm text-slate-500">{app.description}</p>
    </Link>
  );
}

function CategorySection({
  categoryKey,
  category,
  categoryApps,
}: {
  categoryKey: string;
  category: (typeof categories)[keyof typeof categories];
  categoryApps: (typeof apps);
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <category.icon className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{category.name}</h2>
          <p className="text-sm text-slate-500">{category.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {categoryApps.map((app) => (
          <AppCard key={app.path} app={app} />
        ))}
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send to your newsletter service
    console.log('Newsletter signup:', email);
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 text-white mb-12">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          새로운 앱 소식 받기
        </h2>
        <p className="text-slate-300 mb-6">
          새 앱 출시, 활용 팁, 업데이트 소식을 이메일로 받아보세요.
        </p>

        {submitted ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
            <p className="text-green-300">
              구독해 주셔서 감사합니다! 곧 멋진 소식을 전해드릴게요.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
            />
            <Button type="submit" className="bg-white text-slate-900 hover:bg-slate-100">
              구독하기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

function SocialProof() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-8">
      <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
        <Users className="w-4 h-4" />
        이번 주 <strong className="text-slate-700">3,245명</strong> 사용
      </span>
      <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
        <Star className="w-4 h-4 text-yellow-500" />
        인기 앱 <strong className="text-slate-700">21개</strong>
      </span>
      <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full">
        <Flame className="w-4 h-4 text-orange-500" />
        모두 <strong className="text-slate-700">무료</strong>
      </span>
    </div>
  );
}

export default function AppsPage() {
  const calculatorApps = apps.filter((app) => app.category === 'calculator');
  const gameApps = apps.filter((app) => app.category === 'game');
  const utilityApps = apps.filter((app) => app.category === 'utility');

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            일상의 번거로움을
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              10초 만에 해결
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            급여 계산부터 실시간 퀴즈까지,
            <br className="sm:hidden" /> 21가지 미니앱으로 더 스마트한 일상을 만드세요.
          </p>
        </div>

        {/* Social Proof */}
        <SocialProof />

        {/* Category Sections */}
        <CategorySection
          categoryKey="calculator"
          category={categories.calculator}
          categoryApps={calculatorApps}
        />

        <CategorySection
          categoryKey="game"
          category={categories.game}
          categoryApps={gameApps}
        />

        <CategorySection
          categoryKey="utility"
          category={categories.utility}
          categoryApps={utilityApps}
        />

        {/* Newsletter */}
        <NewsletterSection />
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-500 text-sm">
              &copy; 2025 다잼(Dajam). All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <a
                href="https://dajam.seolcoding.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700"
              >
                seolcoding.com
              </a>
              <a
                href="https://github.com/seolcoding/dajam"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-700"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
