'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, LayoutDashboard, Settings, LogOut } from 'lucide-react';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();

  // Show nothing if no user at all
  if (!user) return null;

  const handleSignOut = async () => {
    console.log('[UserMenu] Signing out...');
    await signOut();
    // signOut 내부에서 window.location.href로 리다이렉트 처리됨
  };

  const displayName = profile?.nickname || user.email?.split('@')[0] || '사용자';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="w-9 h-9 bg-slate-200 flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-slate-600" />
            )}
          </Avatar>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-slate-900">
              {displayName}
            </div>
            {profile?.is_admin && (
              <Badge variant="secondary" className="text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-medium">{displayName}</div>
            {(profile?.email || user.email) && (
              <div className="text-xs text-slate-500">{profile?.email || user.email}</div>
            )}
            <Badge
              variant="outline"
              className="w-fit text-xs mt-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-none"
            >
              Free
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            대시보드
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            설정
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
