/**
 * Kakao Maps JavaScript SDK 타입 정의
 */

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        services: {
          Places: new (map?: unknown) => KakaoPlaces;
          Status: {
            OK: string;
            ZERO_RESULT: string;
            ERROR: string;
          };
          SortBy: {
            ACCURACY: string;
            DISTANCE: string;
          };
        };
      };
      Share?: {
        sendDefault: (settings: KakaoShareSettings) => void;
      };
    };
    Kakao?: {
      Share?: {
        sendDefault: (settings: KakaoShareSettings) => void;
      };
    };
  }

  interface KakaoLatLng {
    getLat: () => number;
    getLng: () => number;
  }

  interface KakaoPlaces {
    keywordSearch: (
      keyword: string,
      callback: (result: KakaoPlace[], status: string) => void,
      options?: KakaoSearchOptions
    ) => void;
    categorySearch: (
      code: string,
      callback: (result: KakaoPlace[], status: string) => void,
      options?: KakaoSearchOptions
    ) => void;
  }

  interface KakaoSearchOptions {
    location?: KakaoLatLng;
    radius?: number;
    bounds?: unknown;
    page?: number;
    size?: number;
    sort?: string;
  }

  interface KakaoPlace {
    id: string;
    place_name: string;
    category_name: string;
    category_group_code: string;
    category_group_name: string;
    phone: string;
    address_name: string;
    road_address_name: string;
    x: string; // 경도 (longitude)
    y: string; // 위도 (latitude)
    place_url: string;
    distance: string; // 미터 단위 (문자열)
  }

  interface KakaoShareSettings {
    objectType: 'feed' | 'list' | 'location' | 'commerce' | 'text';
    content: {
      title: string;
      description: string;
      imageUrl: string;
      link: {
        mobileWebUrl: string;
        webUrl: string;
      };
    };
    buttons?: Array<{
      title: string;
      link: {
        mobileWebUrl: string;
        webUrl: string;
      };
    }>;
  }
}

export {};
