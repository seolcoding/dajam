'use client';

import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  variant?: 'button' | 'dropdown-item';
  className?: string;
}

/**
 * 로그아웃 버튼 공통 컴포넌트
 * - variant="button": 일반 버튼 스타일 (사이드바용)
 * - variant="dropdown-item": 드롭다운 메뉴 아이템 스타일 (헤더 메뉴용)
 */
export function LogoutButton({ variant = 'button', className }: LogoutButtonProps) {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    console.log('[LogoutButton] Signing out...');
    await signOut();
  };

  if (variant === 'dropdown-item') {
    return (
      <DropdownMenuItem
        onSelect={() => handleLogout()}
        className={cn('cursor-pointer text-red-600 focus:text-red-600', className)}
      >
        <LogOut className="w-4 h-4 mr-2" />
        로그아웃
      </DropdownMenuItem>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className={cn('w-full justify-start text-muted-foreground', className)}
    >
      <LogOut className="w-4 h-4 mr-2" />
      로그아웃
    </Button>
  );
}
