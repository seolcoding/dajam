import type { Metadata } from 'next';
import Script from 'next/script';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import './globals.css';

const KAKAO_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;

export const metadata: Metadata = {
  title: {
    default: 'SeolCoding Apps - 일상의 번거로움을 10초 만에 해결',
    template: '%s | SeolCoding Apps',
  },
  description:
    '급여 계산기, 학점 계산기, 실시간 투표, 밸런스 게임 등 16가지 무료 미니앱으로 일상을 더 편리하게!',
  keywords: [
    '미니앱',
    '계산기',
    '게임',
    '유틸리티',
    'SeolCoding',
    '급여계산기',
    '학점계산기',
    '밸런스게임',
    '사다리게임',
    '실시간투표',
  ],
  authors: [{ name: 'SeolCoding' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://apps.seolcoding.com',
    siteName: 'SeolCoding Apps',
    title: 'SeolCoding Apps - 일상의 번거로움을 10초 만에 해결',
    description:
      '급여 계산기, 학점 계산기, 실시간 투표, 밸런스 게임 등 16가지 무료 미니앱',
    images: [
      {
        url: 'https://apps.seolcoding.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SeolCoding Apps',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeolCoding Apps - 일상의 번거로움을 10초 만에 해결',
    description: '16가지 무료 미니앱으로 일상을 더 편리하게!',
    images: ['https://apps.seolcoding.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        {/* Kakao SDK */}
        {KAKAO_APP_KEY && (
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
        )}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
