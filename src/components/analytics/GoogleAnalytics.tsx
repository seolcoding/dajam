'use client';

import Script from 'next/script';

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';

export function GoogleAnalytics() {
  if (!GA_TRACKING_ID || GA_TRACKING_ID === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Analytics event tracking utilities
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Predefined events for apps
export const analyticsEvents = {
  // Calculator events
  calculatorUsed: (appName: string) =>
    trackEvent('calculate', 'calculator', appName),

  // Game events
  gameStarted: (appName: string) =>
    trackEvent('game_start', 'game', appName),
  gameCompleted: (appName: string) =>
    trackEvent('game_complete', 'game', appName),

  // Share events
  shareClicked: (appName: string, platform: string) =>
    trackEvent('share', 'engagement', `${appName}_${platform}`),

  // Feedback events
  feedbackClicked: (appName: string) =>
    trackEvent('feedback_click', 'engagement', appName),

  // Error events
  errorOccurred: (appName: string, errorType: string) =>
    trackEvent('error', 'error', `${appName}_${errorType}`),
};

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
