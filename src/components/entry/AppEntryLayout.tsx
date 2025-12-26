'use client';

import { AppHeader, AppFooter } from '@/components/layout';
import type { LucideIcon } from 'lucide-react';

export interface AppEntryLayoutProps {
  /** 앱 제목 */
  title: string;
  /** 앱 설명 */
  description: string;
  /** 앱 아이콘 (lucide-react) */
  icon?: LucideIcon;
  /** 앱 이모지 (icon 대신 사용) */
  emoji?: string;
  /** 아이콘 그라데이션 */
  iconGradient?: string;
  /** 푸터 고지사항 */
  disclaimer?: string;
  /** 헤더 추가 액션 */
  headerActions?: React.ReactNode;
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 모든 앱의 엔트리포인트 레이아웃 래퍼
 * AppHeader + 콘텐츠 + AppFooter 구조 제공
 */
export function AppEntryLayout({
  title,
  description,
  icon,
  emoji,
  iconGradient = 'from-dajaem-green to-dajaem-teal',
  disclaimer,
  headerActions,
  children,
  className = '',
}: AppEntryLayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col ${className}`}>
      <AppHeader
        title={title}
        description={description}
        icon={icon}
        emoji={emoji}
        iconGradient={iconGradient}
        actions={headerActions}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <AppFooter disclaimer={disclaimer} />
    </div>
  );
}
