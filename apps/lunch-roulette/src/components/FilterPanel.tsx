/**
 * 검색 반경 필터 패널
 */

import { RADIUS_OPTIONS } from '@/constants/foodCategories';
import { Button } from '@mini-apps/ui';

interface FilterPanelProps {
  radius: number;
  onRadiusChange: (radius: number) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  radius,
  onRadiusChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h3 className="font-bold text-xl mb-5 text-gray-900">검색 반경 설정</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {RADIUS_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => onRadiusChange(option.value)}
            variant={radius === option.value ? 'default' : 'outline'}
            className={`py-3 px-4 rounded-lg font-bold transition-all ${
              radius === option.value
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm border-orange-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
            }`}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
