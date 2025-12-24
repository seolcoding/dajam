'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogoutButton } from '@/components/auth/LogoutButton';
import {
  Home,
  Users,
  Folder,
  CreditCard,
  BarChart,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  userProfile?: {
    nickname: string;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  className?: string;
}

const navItems = [
  { href: '/admin', icon: Home, label: '관리자 대시보드' },
  { href: '/admin/users', icon: Users, label: '사용자 관리' },
  { href: '/admin/sessions', icon: Folder, label: '세션 관리' },
  { href: '/admin/subscriptions', icon: CreditCard, label: '구독 관리' },
  { href: '/admin/analytics', icon: BarChart, label: '분석' },
];

export function AdminSidebar({
  userProfile,
  className = '',
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-red-50 to-white border-r border-red-200">
      {/* Logo */}
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg">설코딩</span>
            <Badge variant="destructive" className="ml-2 text-xs">Admin</Badge>
          </div>
        </Link>
      </div>

      <Separator className="bg-red-200" />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-red-100 text-red-700 hover:bg-red-200'
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-red-200" />

      {/* Back to Dashboard */}
      <div className="p-4 pb-2">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/dashboard">일반 대시보드로</Link>
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white text-sm">
              {userProfile?.nickname?.[0]?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {userProfile?.nickname || '관리자'}
            </div>
            {userProfile?.email && (
              <div className="text-xs text-muted-foreground truncate">
                {userProfile.email}
              </div>
            )}
          </div>
        </div>
        <LogoutButton variant="button" />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 bottom-0 w-64 z-50 transition-transform',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Sidebar */}
      <aside className={cn('hidden lg:block w-64 h-screen sticky top-0', className)}>
        {sidebarContent}
      </aside>
    </>
  );
}
