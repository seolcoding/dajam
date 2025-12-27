import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { KakaoScript } from '@/components/common/KakaoScript';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/theme';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '다잼(Dajam) - 다같이 재미있게! 실시간 인터랙션 플랫폼',
    template: '%s | 다잼',
  },
  description:
    '투표, 퀴즈, 워드클라우드, 빙고까지 - 21가지 인터랙션 앱으로 청중과 실시간 소통하세요!',
  keywords: [
    '다잼',
    'Dajam',
    '실시간 투표',
    '인터랙션',
    '퀴즈',
    '워드클라우드',
    '빙고',
    '밸런스게임',
    '사다리게임',
    '청중 참여',
  ],
  authors: [{ name: '다잼(Dajam)' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://dajaem.app',
    siteName: '다잼(Dajam)',
    title: '다잼 - 다같이 재미있게! 실시간 인터랙션 플랫폼',
    description:
      '투표, 퀴즈, 워드클라우드, 빙고까지 - 21가지 인터랙션 앱으로 청중과 소통',
    images: [
      {
        url: 'https://dajaem.app/og-image.png',
        width: 1200,
        height: 630,
        alt: '다잼(Dajam) - 실시간 인터랙션 플랫폼',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '다잼 - 다같이 재미있게! 실시간 인터랙션',
    description: '21가지 인터랙션 앱으로 청중과 실시간 소통하세요!',
    images: ['https://dajaem.app/og-image.png'],
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
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <GoogleAnalytics />
        <KakaoScript />
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            duration: 3000,
          }}
        />
      </body>
    </html>
  );
}
