'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, FileText, HelpCircle, Presentation } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      icon: Plus,
      label: '새 세션 만들기',
      description: '새로운 인터랙티브 세션 시작',
      href: '/',
      variant: 'default' as const,
    },
    {
      icon: Presentation,
      label: '프레젠테이션',
      description: '청중과 실시간 소통',
      href: '/audience-engage',
      variant: 'secondary' as const,
      highlight: true,
    },
    {
      icon: Clock,
      label: '최근 세션',
      description: '이전 세션 계속하기',
      href: '/dashboard/my-sessions',
      variant: 'secondary' as const,
    },
    {
      icon: HelpCircle,
      label: '도움말',
      description: '사용 가이드 보기',
      href: '/help',
      variant: 'ghost' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const isHighlight = 'highlight' in action && action.highlight;
        return (
          <Link key={action.label} href={action.href}>
            <Card className={`p-6 hover:shadow-md transition-shadow cursor-pointer h-full ${isHighlight ? 'border-dajaem-green/50 bg-dajaem-green/5' : ''}`}>
              <div className="flex flex-col items-center text-center gap-3">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    ${
                      action.variant === 'default'
                        ? 'bg-dajaem-green text-white'
                        : isHighlight
                        ? 'bg-dajaem-green/20 text-dajaem-green'
                        : 'bg-muted text-muted-foreground'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold mb-1">{action.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
