'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';
import { Button } from '@/components/ui/button';
import { Home, LogIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface AppHeaderProps {
  /** 앱 제목 */
  title: string;
  /** 앱 설명 (선택) */
  description?: string;
  /** 앱 아이콘 (lucide-react 아이콘 컴포넌트) */
  icon?: LucideIcon;
  /** 앱 이모지 (icon 대신 사용 가능) */
  emoji?: string;
  /** 아이콘 배경 그라데이션 클래스 (기본: from-dajaem-green to-dajaem-teal) */
  iconGradient?: string;
  /** 추가 헤더 액션 버튼들 */
  actions?: React.ReactNode;
  /** 헤더 스타일 변형 */
  variant?: 'default' | 'compact';
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 모든 앱에서 사용하는 공통 헤더 컴포넌트
 *
 * 포함 기능:
 * - 홈 버튼 (다잼 로고)
 * - 앱 제목 및 설명
 * - 로그인/유저 메뉴
 *
 * @example
 * <AppHeader
 *   title="급여 실수령액 계산기"
 *   description="연봉 협상 시 얼마를 받게 될까요?"
 *   icon={Calculator}
 *   iconGradient="from-blue-500 to-indigo-600"
 * />
 */
export function AppHeader({
  title,
  description,
  icon: Icon,
  emoji,
  iconGradient = 'from-dajaem-green to-dajaem-teal',
  actions,
  variant = 'default',
  className = '',
}: AppHeaderProps) {
  const { user } = useAuth();

  const isCompact = variant === 'compact';

  return (
    <header
      className={`border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm ${className}`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className={`flex items-center justify-between ${isCompact ? 'h-14' : 'py-4 sm:py-6'}`}>
          {/* Left: Home + App Info */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* 홈 버튼 */}
            <Link
              href="/"
              className="flex-shrink-0 p-2 -m-2 text-slate-500 hover:text-dajaem-green transition-colors"
              title="다잼 홈으로"
            >
              <Home className="w-5 h-5" />
            </Link>

            {/* 구분선 */}
            <div className="h-6 w-px bg-slate-200 flex-shrink-0" />

            {/* 앱 아이콘 + 제목 */}
            <div className="flex items-center gap-3 min-w-0">
              {/* 앱 아이콘 */}
              {(Icon || emoji) && (
                <div
                  className={`flex-shrink-0 ${
                    isCompact ? 'p-2' : 'p-2.5 sm:p-3'
                  } bg-gradient-to-br ${iconGradient} rounded-xl shadow-lg`}
                >
                  {Icon ? (
                    <Icon className={`${isCompact ? 'w-5 h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} text-white`} />
                  ) : (
                    <span className={`${isCompact ? 'text-lg' : 'text-xl sm:text-2xl'}`}>{emoji}</span>
                  )}
                </div>
              )}

              {/* 제목 + 설명 */}
              <div className="min-w-0">
                <h1
                  className={`font-bold text-slate-800 tracking-tight truncate ${
                    isCompact ? 'text-lg' : 'text-xl sm:text-2xl lg:text-3xl'
                  }`}
                >
                  {title}
                </h1>
                {description && !isCompact && (
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 truncate hidden sm:block">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions + Auth */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* 추가 액션 버튼들 */}
            {actions}

            {/* 로그인/유저 메뉴 */}
            {user ? (
              <UserMenu />
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-dajaem-green"
                >
                  <LogIn className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">로그인</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
