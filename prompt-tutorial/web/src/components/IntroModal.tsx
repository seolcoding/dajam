import { useState, useEffect } from 'react';

const INTRO_SEEN_KEY = 'intro_seen';

export function IntroModal() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(INTRO_SEEN_KEY);
    if (!seen) {
      setIsVisible(true);
    }
  }, []);

  function handleStart() {
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/90 dark:bg-neutral-900/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-3xl w-full flex flex-col items-center">
        {/* Infographic Image */}
        <div className="w-full mb-8 rounded-xl overflow-hidden shadow-lg">
          <img
            src={`${import.meta.env.BASE_URL}intro-infographic.png`}
            alt="프롬프트 엔지니어링 튜토리얼 워크플로"
            className="w-full h-auto"
          />
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          className="px-12 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          시작하기
        </button>

        {/* Footer Links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <a
            href="https://github.com/anthropics/prompt-eng-interactive-tutorial"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors underline"
          >
            원본 GitHub
          </a>
          <span>•</span>
          <a
            href="https://seolcoding.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors underline"
          >
            seolcoding.com
          </a>
        </div>
      </div>
    </div>
  );
}
