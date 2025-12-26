'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SinglePlayerEntryProps {
  /** 시작 버튼 클릭 핸들러 */
  onStart: () => void;
  /** 시작 버튼 텍스트 */
  startButtonText?: string;
  /** 카드 제목 */
  title?: string;
  /** 카드 설명 */
  description?: string;
  /** 시작 버튼 아이콘 */
  startIcon?: LucideIcon;
  /** 기능 목록 */
  features?: Array<{
    icon: LucideIcon | string;
    title: string;
    description: string;
  }>;
  /** 추가 액션 버튼들 */
  additionalActions?: React.ReactNode;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 싱글 플레이어 앱용 엔트리 컴포넌트
 * 바로 시작하는 단순한 UI 제공
 */
export function SinglePlayerEntry({
  onStart,
  startButtonText = '시작하기',
  title,
  description,
  startIcon: StartIcon = Play,
  features,
  additionalActions,
  isLoading = false,
  className = '',
}: SinglePlayerEntryProps) {
  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* 메인 시작 카드 */}
      <Card className="border-2 border-dajaem-green/20 shadow-lg">
        <CardHeader className="text-center pb-2">
          {title && <CardTitle className="text-xl">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={onStart}
            disabled={isLoading}
            size="lg"
            className="w-full bg-dajaem-green hover:bg-dajaem-green/90 text-white text-lg py-6"
          >
            <StartIcon className="w-5 h-5 mr-2" />
            {isLoading ? '로딩 중...' : startButtonText}
          </Button>

          {additionalActions && (
            <div className="flex justify-center gap-2">
              {additionalActions}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 기능 소개 */}
      {features && features.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
              <Card key={index} className="border hover:border-dajaem-green/30 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">
                    {typeof feature.icon === 'string' ? (
                      <span className="text-2xl">{feature.icon}</span>
                    ) : (
                      <feature.icon className="w-8 h-8 text-dajaem-green" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-slate-800">{feature.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
