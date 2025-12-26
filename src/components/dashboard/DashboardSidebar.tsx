'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogoutButton } from '@/components/auth/LogoutButton';
import {
  Home,
  Folder,
  Settings,
  CreditCard,
  Receipt,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  userProfile?: {
    nickname: string;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  className?: string;
}

const navItems = [
  { href: '/dashboard', icon: Home, label: '대시보드' },
  { href: '/dashboard/my-sessions', icon: Folder, label: '내 세션' },
  { href: '/dashboard/settings', icon: Settings, label: '설정' },
  { href: '/dashboard/subscription', icon: CreditCard, label: '구독 관리' },
  { href: '/dashboard/billing', icon: Receipt, label: '결제 내역' },
];

export function DashboardSidebar({
  userProfile,
  className = '',
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Logo */}
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <span className="font-bold text-lg">설코딩</span>
        </Link>
      </div>

      <Separator />

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
                  isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-100'
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

      <Separator />

      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
              {userProfile?.nickname?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {userProfile?.nickname || '사용자'}
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
      <aside className={cn('hidden lg:flex lg:flex-col lg:w-64 lg:min-h-screen', className)}>
        {sidebarContent}
      </aside>
    </>
  );
}
