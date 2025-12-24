'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Lock, CreditCard, HelpCircle, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const settingsSections = [
    {
      icon: User,
      title: '프로필',
      description: '이름, 이메일 및 아바타 관리',
      href: '/dashboard/settings/profile',
    },
    {
      icon: Bell,
      title: '알림',
      description: '알림 설정 및 환경설정',
      href: '/dashboard/settings/notifications',
    },
    {
      icon: Lock,
      title: '보안',
      description: '비밀번호 및 2단계 인증',
      href: '/dashboard/settings/security',
    },
    {
      icon: CreditCard,
      title: '구독 및 결제',
      description: '플랜 관리 및 결제 수단',
      href: '/dashboard/subscription',
    },
    {
      icon: HelpCircle,
      title: '도움말',
      description: '자주 묻는 질문 및 지원',
      href: '/help',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">설정</h2>
        <p className="text-muted-foreground">계정 및 환경설정을 관리하세요</p>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.href} href={section.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
