/**
 * 앱 전역 상태 관리 (Zustand)
 */

import { create } from 'zustand';
import type { AppState, FoodCategory, Restaurant } from '@/types/food';

interface AppActions {
  setLocation: (latitude: number, longitude: number, error?: string) => void;
  setCategory: (category: FoodCategory) => void;
  setRestaurants: (restaurants: Restaurant[]) => void;
  setSelectedRestaurant: (restaurant: Restaurant) => void;
  setRadius: (radius: number) => void;
  reset: () => void;
  goToCategory: () => void;
}

const initialState: AppState = {
  step: 'category',
  location: {
    latitude: null,
    longitude: null,
    error: null,
  },
  selectedCategory: null,
  restaurants: [],
  selectedRestaurant: null,
  radius: 1000, // 기본 1km
};

export const useAppStore = create<AppState & AppActions>((set) => ({
  ...initialState,

  setLocation: (latitude, longitude, error) =>
    set((state) => ({
      location: {
        ...state.location,
        latitude,
        longitude,
        error: error || null,
      },
    })),

  setCategory: (category) =>
    set({
      selectedCategory: category,
      step: 'restaurant',
    }),

  setRestaurants: (restaurants) =>
    set({ restaurants }),

  setSelectedRestaurant: (restaurant) =>
    set({
      selectedRestaurant: restaurant,
      step: 'result',
    }),

  setRadius: (radius) =>
    set({ radius }),

  reset: () =>
    set({
      ...initialState,
      location: {
        latitude: null,
        longitude: null,
        error: null,
      },
    }),

  goToCategory: () =>
    set({
      step: 'category',
      selectedCategory: null,
      restaurants: [],
      selectedRestaurant: null,
    }),
}));
