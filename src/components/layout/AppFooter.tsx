'use client';

import Link from 'next/link';

interface AppFooterProps {
  /** 앱별 추가 정보/고지사항 */
  disclaimer?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 푸터 스타일 변형 */
  variant?: 'default' | 'compact';
}

/**
 * 모든 앱에서 사용하는 공통 푸터 컴포넌트
 *
 * 포함 정보:
 * - 다잼 브랜드 + 저작권
 * - 이용약관, 개인정보처리방침 링크
 * - 앱별 고지사항 (선택)
 *
 * @example
 * <AppFooter disclaimer="2025년 기준 4대보험료율 적용. 실제 급여명세서와 차이가 있을 수 있습니다." />
 */
export function AppFooter({
  disclaimer,
  className = '',
  variant = 'default',
}: AppFooterProps) {
  const currentYear = new Date().getFullYear();
  const isCompact = variant === 'compact';

  return (
    <footer className={`border-t bg-slate-50 ${isCompact ? 'py-4' : 'py-8'} ${className}`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* 앱별 고지사항 */}
        {disclaimer && (
          <div className={`text-center ${isCompact ? 'mb-3' : 'mb-6'}`}>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
              {disclaimer}
            </p>
          </div>
        )}

        {/* 메인 푸터 콘텐츠 */}
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${disclaimer ? 'pt-4 border-t border-slate-200' : ''}`}>
          {/* 브랜드 + 저작권 */}
          <div className="flex items-center gap-2 text-slate-600">
            <Link href="/" className="flex items-center gap-1.5 hover:text-dajaem-green transition-colors">
              <span className="text-lg">🎯</span>
              <span className="font-semibold text-sm">다잼</span>
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">
              © {currentYear} 다잼. All rights reserved.
            </span>
          </div>

          {/* 링크들 */}
          <nav className="flex items-center gap-4 text-xs text-slate-500">
            <Link
              href="/apps"
              className="hover:text-dajaem-green transition-colors"
            >
              앱 둘러보기
            </Link>
            <Link
              href="/terms"
              className="hover:text-dajaem-green transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="hover:text-dajaem-green transition-colors"
            >
              개인정보처리방침
            </Link>
            <a
              href="mailto:support@seolcoding.com"
              className="hover:text-dajaem-green transition-colors"
            >
              문의하기
            </a>
          </nav>
        </div>

        {/* 부가 정보 */}
        {!isCompact && (
          <div className="mt-4 pt-4 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              다잼은 소규모 그룹의 실시간 인터랙션을 위한 서비스입니다.
              <span className="hidden sm:inline"> 회원가입 없이 QR코드나 6자리 코드로 바로 참여할 수 있습니다.</span>
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}

export default AppFooter;
