/**
 * Geolocation API 훅
 * 사용자의 현재 위치를 가져옵니다.
 */

import { useState, useEffect } from 'react';
import { DEFAULT_LOCATION } from '@/constants/foodCategories';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
        error: '브라우저가 위치 서비스를 지원하지 않습니다. 기본 위치(서울)를 사용합니다.',
        loading: false,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let errorMessage = '위치 정보를 가져올 수 없습니다. 기본 위치(서울)를 사용합니다.';

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = '위치 권한이 거부되었습니다. 기본 위치(서울)를 사용합니다.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = '위치 정보를 사용할 수 없습니다. 기본 위치(서울)를 사용합니다.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = '위치 정보 요청 시간이 초과되었습니다. 기본 위치(서울)를 사용합니다.';
        }

        setState({
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
          error: errorMessage,
          loading: false,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return state;
};
