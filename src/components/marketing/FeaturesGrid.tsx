import { Vote, HelpCircle, Cloud, Scale, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: '실시간 투표',
    description: '청중의 의견을 즉시 수집하고 시각화하세요',
    icon: Vote,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: '퀴즈 & 게임',
    description: 'Kahoot 스타일 퀴즈쇼로 참여도를 높이세요',
    icon: HelpCircle,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: '워드클라우드',
    description: '실시간 단어 구름으로 키워드를 시각화하세요',
    icon: Cloud,
    color: 'from-sky-500 to-blue-500',
  },
  {
    title: '이거 vs 저거',
    description: 'A/B 투표로 선호도를 빠르게 파악하세요',
    icon: Scale,
    color: 'from-pink-500 to-rose-500',
  },
  {
    title: '팀 빌딩',
    description: '빙고, 사다리 게임으로 아이스브레이킹하세요',
    icon: Users,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    title: '분석 리포트',
    description: '세션 데이터를 종합하여 인사이트를 얻으세요',
    icon: BarChart3,
    color: 'from-orange-500 to-amber-500',
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            모든 인터랙션을 한 곳에서
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            교육, 워크샵, 컨퍼런스 등 어떤 상황에서도 청중과 소통할 수 있습니다
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-slate-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
            >
              <CardHeader>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
