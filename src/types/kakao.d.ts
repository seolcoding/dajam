// Kakao SDK type declarations

interface KakaoShareSettings {
  objectType: 'feed';
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

interface KakaoSDK {
  init?: (key: string) => void;
  isInitialized?: () => boolean;
  Share?: {
    sendDefault: (settings: KakaoShareSettings) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

export {};
