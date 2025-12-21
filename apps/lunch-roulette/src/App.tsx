/**
 * Lunch Roulette - 점심 메뉴 룰렛 앱
 * 2단계 룰렛: 카테고리 선택 → 음식점 선택
 */

import { useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAppStore } from '@/store/useAppStore';
import { loadKakaoMapScript } from '@/lib/kakao/init';
import { CategoryRoulette } from '@/components/CategoryRoulette';
import { RestaurantRoulette } from '@/components/RestaurantRoulette';
import { RestaurantCard } from '@/components/RestaurantCard';
import { FilterPanel } from '@/components/FilterPanel';
import { ShareButtons } from '@/components/ShareButtons';
import { Button } from '@mini-apps/ui';
import { AlertCircle, MapPin, RefreshCw } from 'lucide-react';

function App() {
  const { latitude, longitude, error: locationError, loading } = useGeolocation();
  const {
    step,
    location,
    selectedCategory,
    selectedRestaurant,
    radius,
    setLocation,
    setCategory,
    setSelectedRestaurant,
    setRadius,
    reset,
    goToCategory,
  } = useAppStore();

  // 위치 정보 업데이트
  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      setLocation(latitude, longitude, locationError || undefined);
    }
  }, [latitude, longitude, locationError, setLocation]);

  // Kakao Maps SDK 로드
  useEffect(() => {
    loadKakaoMapScript().catch((err) => {
      console.error('Kakao Maps SDK 로드 실패:', err);
    });
  }, []);

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xl font-bold text-gray-900">위치 정보를 가져오는 중...</p>
        </div>
      </div>
    );
  }

  // 위치 정보 오류
  if (location.error && !location.latitude) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <AlertCircle className="w-20 h-20 mx-auto text-orange-600" />
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-gray-900">위치 정보 필요</h2>
            <p className="text-lg text-gray-600">{location.error}</p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  const currentLatitude = location.latitude || latitude || 37.5666805;
  const currentLongitude = location.longitude || longitude || 126.9784147;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* 위치 정보 표시 */}
        {location.error && (
          <div className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-4">
            <MapPin className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-base text-gray-700 font-medium">{location.error}</p>
          </div>
        )}

        {/* 필터 패널 (카테고리 및 음식점 선택 단계) */}
        {(step === 'category' || step === 'restaurant') && (
          <div className="mb-8">
            <FilterPanel radius={radius} onRadiusChange={setRadius} />
          </div>
        )}

        {/* 1단계: 카테고리 룰렛 */}
        {step === 'category' && (
          <CategoryRoulette onCategorySelected={setCategory} />
        )}

        {/* 2단계: 음식점 룰렛 */}
        {step === 'restaurant' && selectedCategory && (
          <RestaurantRoulette
            category={selectedCategory}
            latitude={currentLatitude}
            longitude={currentLongitude}
            radius={radius}
            onRestaurantSelected={setSelectedRestaurant}
            onBack={goToCategory}
          />
        )}

        {/* 3단계: 결과 표시 */}
        {step === 'result' && selectedRestaurant && (
          <div className="space-y-8 py-8">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-gray-900">
                오늘의 점심 메뉴는?
              </h2>
              <p className="text-2xl font-bold text-orange-600">
                {selectedCategory?.emoji} {selectedCategory?.name}
              </p>
            </div>

            <RestaurantCard restaurant={selectedRestaurant} />

            <ShareButtons
              placeName={selectedRestaurant.name}
              placeUrl={selectedRestaurant.url}
            />

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={goToCategory}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 font-bold"
              >
                카테고리 다시 선택
              </Button>
              <Button
                onClick={reset}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                처음부터 다시
              </Button>
            </div>
          </div>
        )}

        {/* 푸터 */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Made with ❤️ by SeolCoding</p>
          <p className="mt-1">
            위치 기반 맛집 추천 서비스 | Powered by Kakao Maps
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
