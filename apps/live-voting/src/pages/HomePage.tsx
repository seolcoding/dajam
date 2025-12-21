import { useNavigate } from 'react-router-dom';
import { Plus, Vote, Users, TrendingUp } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">실시간 투표 플랫폼</h1>
          <p className="text-xl text-gray-600">
            QR 코드로 간편하게 투표를 만들고, 실시간으로 결과를 확인하세요
          </p>
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto mb-16">
          <button
            onClick={() => navigate('/create')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-3"
          >
            <Plus size={24} />
            투표 만들기
          </button>
        </div>

        {/* 기능 소개 */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Vote size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">다양한 투표 유형</h3>
            <p className="text-gray-600">
              단일 선택, 복수 선택, 순위 투표까지 다양한 형태의 투표를 지원합니다.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Users size={32} className="text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">QR 코드 참여</h3>
            <p className="text-gray-600">
              QR 코드 스캔으로 앱 설치 없이 바로 투표에 참여할 수 있습니다.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <TrendingUp size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">실시간 결과</h3>
            <p className="text-gray-600">
              투표 결과가 실시간으로 업데이트되어 즉시 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 사용 시나리오 */}
        <div className="max-w-3xl mx-auto mt-16 bg-blue-50 border border-blue-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">이런 곳에서 사용해보세요</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span className="text-gray-700">강의/워크샵에서 실시간 학습 이해도 체크</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span className="text-gray-700">회의에서 팀 의사결정 및 우선순위 투표</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span className="text-gray-700">이벤트/행사에서 참여자 만족도 조사</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span className="text-gray-700">아이스브레이커 활동 및 간단한 설문</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 mt-16">
          <p>서버 없이 동작하는 완전 프론트엔드 솔루션 | 개인정보 수집 없음</p>
        </div>
      </div>
    </div>
  );
}
