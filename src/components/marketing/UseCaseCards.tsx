import { Briefcase, GraduationCap, CalendarDays } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const useCases = [
  {
    title: '기업 교육팀',
    description: '워크샵, 타운홀, 팀빌딩 아이스브레이커',
    examples: [
      '전사 타운홀 미팅에서 실시간 투표로 의견 수렴',
      '팀빌딩 워크샵에서 빙고 게임으로 친밀감 형성',
      '교육 세션에서 퀴즈로 학습 효과 측정',
    ],
    icon: Briefcase,
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    title: '학교 & 강사',
    description: '수업 참여도 높이기, 실시간 퀴즈, 의견 수집',
    examples: [
      '강의 중 실시간 퀴즈로 집중도 향상',
      '워드클라우드로 학생들의 키워드 이해도 파악',
      '밸런스 게임으로 재미있는 아이스브레이킹',
    ],
    icon: GraduationCap,
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    title: '이벤트 기획자',
    description: '컨퍼런스, 세미나, 네트워킹 이벤트',
    examples: [
      '컨퍼런스에서 청중 질문을 실시간 수집 및 투표',
      '세미나에서 성격 테스트로 참가자 프로필 파악',
      '네트워킹 세션에서 사람 빙고로 연결 촉진',
    ],
    icon: CalendarDays,
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
  },
];

export function UseCaseCards() {
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            누가 사용하나요?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            다양한 분야의 전문가들이 다잼으로 청중과 소통합니다
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {useCases.map((useCase) => (
            <Card
              key={useCase.title}
              className={`border-0 ${useCase.bgColor} hover:shadow-xl transition-all duration-200 hover:-translate-y-1`}
            >
              <CardHeader>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 shadow-lg`}
                >
                  <useCase.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription className="text-slate-600">
                  {useCase.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {useCase.examples.map((example, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-dajaem-green mt-0.5">✓</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
