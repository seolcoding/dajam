/**
 * Kakao Places API 래퍼
 */

import type { Restaurant } from '@/types/food';

export interface SearchOptions {
  latitude: number;
  longitude: number;
  radius: number; // 미터 단위
  category?: string; // 카카오 카테고리 코드
  keyword?: string;
  sort?: 'accuracy' | 'distance';
}

/**
 * Kakao Place를 Restaurant 타입으로 변환
 */
const convertToRestaurant = (place: KakaoPlace): Restaurant => ({
  id: place.id,
  name: place.place_name,
  category: place.category_name,
  address: place.address_name,
  roadAddress: place.road_address_name || place.address_name,
  phone: place.phone || '',
  url: place.place_url,
  latitude: parseFloat(place.y),
  longitude: parseFloat(place.x),
  distance: parseInt(place.distance) || 0,
});

/**
 * Kakao Places API로 주변 음식점 검색
 */
export const searchPlaces = async (
  options: SearchOptions
): Promise<Restaurant[]> => {
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps) {
      reject(new Error('Kakao Maps SDK가 로드되지 않았습니다.'));
      return;
    }

    const { latitude, longitude, radius, category, keyword, sort = 'distance' } = options;

    const places = new window.kakao.maps.services.Places();
    const location = new window.kakao.maps.LatLng(latitude, longitude);

    const callback = (result: KakaoPlace[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const restaurants = result.map(convertToRestaurant);
        resolve(restaurants);
      } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
        resolve([]);
      } else {
        reject(new Error('음식점 검색 중 오류가 발생했습니다.'));
      }
    };

    const searchOptions: KakaoSearchOptions = {
      location,
      radius,
      sort:
        sort === 'distance'
          ? window.kakao.maps.services.SortBy.DISTANCE
          : window.kakao.maps.services.SortBy.ACCURACY,
      size: 15, // 최대 15개 결과
    };

    if (keyword) {
      // 키워드 검색 (카테고리 선택 후)
      places.keywordSearch(keyword, callback, searchOptions);
    } else if (category) {
      // 카테고리 검색 (음식점: FD6, 카페: CE7)
      places.categorySearch(category, callback, searchOptions);
    } else {
      reject(new Error('키워드 또는 카테고리가 필요합니다.'));
    }
  });
};
