/**
 * Kakao Maps SDK 초기화
 */

export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => resolve());
      return;
    }

    const script = document.createElement('script');
    const appKey = import.meta.env.VITE_KAKAO_APP_KEY;

    if (!appKey) {
      reject(new Error('VITE_KAKAO_APP_KEY 환경 변수가 설정되지 않았습니다.'));
      return;
    }

    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&libraries=services&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => resolve());
      } else {
        reject(new Error('Kakao Maps SDK 로드 실패'));
      }
    };

    script.onerror = () => {
      reject(new Error('Kakao Maps SDK 스크립트 로드 실패'));
    };

    document.head.appendChild(script);
  });
};
