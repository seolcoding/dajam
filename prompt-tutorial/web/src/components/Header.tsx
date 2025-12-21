import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { isApiKeyConfigured, getModelName, setApiKey, getStoredApiKey, validateApiKey } from '@/lib/llm';
import { resetAllProgress } from '@/lib/storage';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(isApiKeyConfigured());
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApiConfigured(isApiKeyConfigured());
    // 저장된 API 키가 있으면 마스킹하여 표시
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKeyInput(maskApiKey(storedKey));
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function maskApiKey(key: string): string {
    if (key.length <= 8) return key;
    return key.slice(0, 7) + '...' + key.slice(-4);
  }

  async function handleSaveApiKey() {
    // 마스킹된 값이면 변경 없음
    if (apiKeyInput.includes('...')) {
      setMenuOpen(false);
      return;
    }

    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      setValidationError('API 키를 입력해주세요.');
      return;
    }

    if (!trimmedKey.startsWith('sk-')) {
      setValidationError('올바른 OpenAI API 키 형식이 아닙니다. (sk-로 시작)');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      const isValid = await validateApiKey(trimmedKey);
      if (isValid) {
        setApiKey(trimmedKey);
        setApiConfigured(true);
        setApiKeyInput(maskApiKey(trimmedKey));
        setMenuOpen(false);
        // 페이지 새로고침하여 상태 반영
        window.location.reload();
      } else {
        setValidationError('API 키가 유효하지 않습니다. 다시 확인해주세요.');
      }
    } catch {
      setValidationError('API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  }

  function handleClearApiKey() {
    setApiKey('');
    setApiKeyInput('');
    setApiConfigured(false);
    setValidationError('');
  }

  function handleInputFocus() {
    // 포커스 시 마스킹된 값이면 비우기
    if (apiKeyInput.includes('...')) {
      setApiKeyInput('');
    }
  }

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-50 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">프롬프트 엔지니어링</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
            aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Reset Progress Button */}
          <button
            onClick={() => {
              if (confirm('모든 진행 상황과 API 키를 초기화하시겠습니까?\n처음부터 다시 시작합니다.')) {
                resetAllProgress();
                window.location.reload();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-neutral-500 hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">초기화</span>
          </button>

          {/* API Key Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                apiConfigured
                  ? 'bg-green-50 text-green-700 hover:bg-green-100'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
            {apiConfigured ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>API 연결됨</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>API 키 필요</span>
              </>
            )}
            <svg className={`w-4 h-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">OpenAI API</span>
                  <span className="text-xs text-green-600 dark:text-green-400">{getModelName()}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-neutral-500 dark:text-neutral-400">API 키</label>
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setValidationError('');
                    }}
                    onFocus={handleInputFocus}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveApiKey()}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 text-sm border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {validationError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{validationError}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveApiKey}
                    disabled={isValidating}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isValidating ? '검증 중...' : '저장'}
                  </button>
                  {apiConfigured && (
                    <button
                      onClick={handleClearApiKey}
                      className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  API 키는 브라우저에 로컬 저장되며 서버로 전송되지 않습니다.
                </p>

                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  OpenAI API 키 발급받기 →
                </a>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
