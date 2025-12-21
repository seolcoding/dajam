import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@mini-apps/ui';
import { Users, QrCode, Calculator, Share2 } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            단체 주문 통합
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            회식, 단체 주문을 간편하게! QR 코드로 주문하고 자동으로 집계하세요.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/create')}
            className="text-lg px-8 py-6 bg-green-600 hover:bg-green-700 text-white"
          >
            주문방 만들기
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          <Card className="border-gray-200">
            <CardHeader>
              <Users className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">간편한 참여</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                QR 코드 스캔 또는 링크로 간편하게 참여할 수 있어요.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <QrCode className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">실시간 동기화</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                모든 참가자의 주문이 실시간으로 업데이트되어 한눈에 확인 가능해요.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <Calculator className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">자동 집계</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                메뉴별, 참가자별 주문 내역이 자동으로 집계되어 편리해요.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <Share2 className="w-10 h-10 mb-3 text-green-600" />
              <CardTitle className="text-gray-900">주문서 공유</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                주문 완료 후 이미지나 텍스트로 간편하게 공유할 수 있어요.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gray-50 rounded-2xl px-8 py-12">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">사용 방법</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">주문방 생성</h3>
              <p className="text-gray-600 text-sm">
                가게 이름과 메뉴를 입력하여 주문방을 만듭니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">참여자 초대</h3>
              <p className="text-gray-600 text-sm">
                QR 코드 또는 링크를 공유하여 참여자를 초대합니다.
              </p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-gray-900">주문 완료</h3>
              <p className="text-gray-600 text-sm">
                모든 주문이 완료되면 주문서를 생성하여 공유합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
