'use client';

import Script from 'next/script';

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

export function KakaoScript() {
  if (!KAKAO_APP_KEY) return null;

  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js"
      integrity="sha384-6MFdIr0zOira1CHQkedUqJVql0YtcZA1P0nbPrQYJXVJZUkTk/oX4U9GhIIsO/v7n"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && window.Kakao) {
          const kakao = window.Kakao as {
            init?: (key: string) => void;
            isInitialized?: () => boolean;
            Share?: object;
          };
          if (kakao.init && kakao.isInitialized && !kakao.isInitialized()) {
            kakao.init(KAKAO_APP_KEY);
          }
        }
      }}
    />
  );
}
