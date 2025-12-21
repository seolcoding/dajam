/**
 * 음식점 정보 카드
 */

import { MapPin, Phone, ExternalLink } from 'lucide-react';
import type { Restaurant } from '@/types/food';
import { Card } from '@mini-apps/ui';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
}) => {
  const distanceText =
    restaurant.distance < 1000
      ? `${restaurant.distance}m`
      : `${(restaurant.distance / 1000).toFixed(1)}km`;

  return (
    <Card className="p-8 space-y-6 border-gray-200 shadow-sm">
      <div className="text-center space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">
          {restaurant.name}
        </h3>
        <p className="text-base text-gray-600 font-medium">{restaurant.category}</p>
      </div>

      <div className="space-y-4">
        {/* 거리 */}
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-base font-bold text-gray-900">
              현재 위치에서 {distanceText}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {restaurant.roadAddress || restaurant.address}
            </p>
          </div>
        </div>

        {/* 전화번호 */}
        {restaurant.phone && (
          <div className="flex items-center gap-4">
            <Phone className="w-6 h-6 text-orange-600 flex-shrink-0" />
            <a
              href={`tel:${restaurant.phone}`}
              className="text-base font-medium text-gray-700 hover:text-orange-600 transition-colors"
            >
              {restaurant.phone}
            </a>
          </div>
        )}

        {/* 카카오맵 링크 */}
        <div className="flex items-center gap-4">
          <ExternalLink className="w-6 h-6 text-orange-600 flex-shrink-0" />
          <a
            href={restaurant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-orange-600 hover:text-orange-700 transition-colors underline"
          >
            카카오맵에서 보기
          </a>
        </div>
      </div>
    </Card>
  );
};
