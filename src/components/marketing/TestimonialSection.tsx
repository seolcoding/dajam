import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      '실시간 투표로 워크샵 참여도가 2배 높아졌어요. 청중의 반응을 즉시 확인할 수 있어서 진행이 훨씬 수월합니다.',
    author: '김지훈',
    role: 'HR 팀장',
    company: '테크스타트업',
    avatar: '👨‍💼',
  },
  {
    quote:
      '학생들이 수업 중 퀴즈를 정말 좋아해요. 집중도가 올라가고, 학습 효과도 확실히 좋아졌습니다. 추천합니다!',
    author: '박서연',
    role: '강사',
    company: '온라인 교육 플랫폼',
    avatar: '👩‍🏫',
  },
  {
    quote:
      '컨퍼런스에서 워드클라우드로 키워드를 실시간 수집했는데, 참석자들 반응이 폭발적이었어요. 세션 만족도가 크게 향상됐습니다.',
    author: '이민수',
    role: '이벤트 기획자',
    company: '글로벌 컨퍼런스',
    avatar: '🎯',
  },
];

export function TestimonialSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            사용자 후기
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            실제 사용자들의 생생한 경험을 들어보세요
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, idx) => (
            <Card
              key={idx}
              className="border-slate-200 hover:shadow-lg transition-all duration-200"
            >
              <CardContent className="pt-6">
                <Quote className="w-10 h-10 text-blue-500/20 mb-4" />
                <p className="text-slate-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 bg-slate-100 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-slate-600">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
