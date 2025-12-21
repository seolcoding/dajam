/**
 * 1단계 룰렛: 음식 카테고리 선택
 */

import { useState } from 'react';
import { Wheel } from 'react-custom-roulette';
import type { WheelData } from 'react-custom-roulette/dist/components/Wheel/types';
import type { FoodCategory } from '@/types/food';
import { FOOD_CATEGORIES } from '@/constants/foodCategories';
import { Button } from '@mini-apps/ui';

interface CategoryRouletteProps {
  onCategorySelected: (category: FoodCategory) => void;
}

export const CategoryRoulette: React.FC<CategoryRouletteProps> = ({
  onCategorySelected,
}) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);

  const data: WheelData[] = FOOD_CATEGORIES.map((cat) => ({
    option: `${cat.emoji} ${cat.name}`,
    style: { backgroundColor: cat.color, textColor: '#fff' },
  }));

  const handleSpinClick = () => {
    if (!mustSpin) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    onCategorySelected(FOOD_CATEGORIES[prizeNumber]);
  };

  return (
    <div className="flex flex-col items-center gap-10 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          점심 메뉴 룰렛 🎰
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          오늘 뭐 먹지? 룰렛으로 결정하세요!
        </p>
      </div>

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
          backgroundColors={['#3e3e3e', '#df3428']}
          textColors={['#ffffff']}
          outerBorderColor="#FFD700"
          outerBorderWidth={10}
          innerBorderColor="#FFA500"
          innerBorderWidth={5}
          innerRadius={30}
          radiusLineColor="#666"
          radiusLineWidth={3}
          fontSize={18}
          fontWeight={700}
          perpendicularText={false}
          textDistance={65}
          spinDuration={0.8}
        />

        {/* 중앙 장식 */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-20 h-20 bg-orange-600
                      rounded-full shadow-xl border-4 border-white
                      flex items-center justify-center text-3xl pointer-events-none"
        >
          🎰
        </div>
      </div>

      <Button
        onClick={handleSpinClick}
        disabled={mustSpin}
        size="lg"
        className="px-10 py-5 bg-orange-600 hover:bg-orange-700
                   text-white text-2xl font-bold rounded-full shadow-lg
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all"
      >
        {mustSpin ? '룰렛 돌리는 중...' : '🎰 룰렛 돌리기'}
      </Button>
    </div>
  );
};
