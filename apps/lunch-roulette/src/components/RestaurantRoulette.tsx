/**
 * 2단계 룰렛: 음식점 선택
 */

import { useEffect, useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import type { WheelData } from 'react-custom-roulette/dist/components/Wheel/types';
import type { FoodCategory, Restaurant } from '@/types/food';
import { searchPlaces } from '@/lib/kakao/places';
import { Button } from '@mini-apps/ui';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface RestaurantRouletteProps {
  category: FoodCategory;
  latitude: number;
  longitude: number;
  radius: number;
  onRestaurantSelected: (restaurant: Restaurant) => void;
  onBack: () => void;
}

export const RestaurantRoulette: React.FC<RestaurantRouletteProps> = ({
  category,
  latitude,
  longitude,
  radius,
  onRestaurantSelected,
  onBack,
}) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await searchPlaces({
          latitude,
          longitude,
          radius,
          keyword: category.name,
          sort: 'distance',
        });

        setRestaurants(results);
      } catch (err) {
        console.error('음식점 검색 실패:', err);
        setError('음식점 검색 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, [category, latitude, longitude, radius]);

  const handleSpinClick = () => {
    if (!mustSpin && restaurants.length > 0) {
      const newPrizeNumber = Math.floor(
        Math.random() * Math.min(restaurants.length, 10)
      );
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    onRestaurantSelected(restaurants[prizeNumber]);
  };

  if (loading) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="w-20 h-20 mx-auto border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-bold text-gray-900">
          {category.emoji} {category.name} 음식점 검색 중...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-6">
        <AlertCircle className="w-20 h-20 mx-auto text-orange-600" />
        <p className="text-xl font-bold text-gray-900">{error}</p>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="space-y-3">
          <p className="text-3xl font-bold text-gray-900">
            주변에 {category.emoji} {category.name} 음식점이 없습니다
          </p>
          <p className="text-xl text-gray-600">검색 반경을 늘려보세요</p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-300 hover:bg-gray-50 font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          카테고리 다시 선택
        </Button>
      </div>
    );
  }

  const displayRestaurants = restaurants.slice(0, 10);
  const data: WheelData[] = displayRestaurants.map((restaurant) => ({
    option: restaurant.name,
    style: { backgroundColor: category.color, textColor: '#fff' },
  }));

  return (
    <div className="space-y-10 py-8">
      <div className="text-center space-y-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-2 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          카테고리 다시 선택
        </Button>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          {category.emoji} {category.name} 음식점 룰렛
        </h2>
        <p className="text-lg text-gray-600 font-medium">
          {restaurants.length}개의 음식점을 찾았습니다
        </p>
      </div>

      <div className="flex flex-col items-center gap-8">
        <div className="relative">
          {/* 룰렛 포인터 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
            <div
              className="w-0 h-0 border-l-[20px] border-l-transparent
                          border-r-[20px] border-r-transparent
                          border-t-[40px] border-t-red-500
                          drop-shadow-lg"
            />
          </div>

          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleStopSpinning}
            backgroundColors={[category.color, '#3e3e3e']}
            textColors={['#ffffff']}
            outerBorderColor="#FFD700"
            outerBorderWidth={8}
            innerBorderColor="#FFA500"
            innerBorderWidth={5}
            innerRadius={20}
            radiusLineColor="#666"
            radiusLineWidth={2}
            fontSize={16}
            fontWeight={700}
            perpendicularText={false}
            textDistance={60}
            spinDuration={1.2}
          />

          {/* 중앙 장식 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-16 h-16 bg-orange-600
                        rounded-full shadow-xl border-4 border-white
                        flex items-center justify-center text-2xl pointer-events-none"
          >
            {category.emoji}
          </div>
        </div>

        <Button
          onClick={handleSpinClick}
          disabled={mustSpin}
          size="lg"
          className="px-10 py-5 bg-orange-600 hover:bg-orange-700
                     text-white text-2xl font-bold rounded-full shadow-lg
                     disabled:opacity-50 transition-all"
        >
          {mustSpin ? '음식점 고르는 중...' : '🎲 음식점 뽑기'}
        </Button>
      </div>
    </div>
  );
};
