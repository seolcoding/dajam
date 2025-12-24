'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, ChevronRight, User, Settings, LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  title?: string;
  userProfile?: {
    nickname: string;
    email?: string | null;
    avatar_url?: string | null;
  } | null;
  onLogout?: () => void;
}

export function DashboardHeader({
  title,
  userProfile,
  onLogout,
}: DashboardHeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Korean labels for common paths
      const koreanLabels: Record<string, string> = {
        dashboard: '대시보드',
        'my-sessions': '내 세션',
        settings: '설정',
        profile: '프로필',
        subscription: '구독 관리',
        billing: '결제 내역',
      };

      return {
        href,
        label: koreanLabels[segment] || label,
        isLast: index === arr.length - 1,
      };
    });

  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="px-6 h-16 flex items-center justify-between">
        {/* Breadcrumb & Title */}
        <div>
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="w-4 h-4" />}
                  {crumb.isLast ? (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}
          <h1 className="text-xl font-semibold">
            {title || breadcrumbs[breadcrumbs.length - 1]?.label || '대시보드'}
          </h1>
        </div>

        {/* Right side - Notifications & User Menu */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={userProfile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {userProfile?.nickname?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userProfile?.nickname || '사용자'}
                  </p>
                  {userProfile?.email && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {userProfile.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  프로필
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  설정
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onLogout && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    onLogout();
                  }}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
