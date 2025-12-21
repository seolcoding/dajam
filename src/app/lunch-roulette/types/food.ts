/**
 * 음식 카테고리 및 음식점 관련 타입
 */

export interface FoodCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  kakaoCode?: string; // 카카오 카테고리 코드
}

export interface Restaurant {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string;
  url: string;
  latitude: number;
  longitude: number;
  distance: number; // 미터 단위
}

export type AppStep = 'permission' | 'category' | 'restaurant' | 'result';

export interface AppState {
  step: AppStep;
  location: {
    latitude: number | null;
    longitude: number | null;
    error: string | null;
  };
  selectedCategory: FoodCategory | null;
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  radius: number; // 검색 반경 (미터)
}
