'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical, Eye, CreditCard, Ban, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Profile } from '@/types/database';

interface UserTableProps {
  users?: Array<
    Profile & {
      session_count: number;
      last_activity: string | null;
    }
  >;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function UserTable({
  users = [],
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}: UserTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewUser = (userId: string) => {
    // Navigate to user detail page
    window.location.href = `/admin/users/${userId}`;
  };

  const handleChangePlan = (userId: string) => {
    // TODO: Implement plan change dialog
    console.log('Change plan for user:', userId);
  };

  const handleBanUser = (userId: string) => {
    // TODO: Implement ban user with confirmation
    console.log('Ban user:', userId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>사용자 목록 ({totalCount})</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="사용자 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? '검색 결과가 없습니다' : '사용자가 없습니다'}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="space-y-2">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                <div className="col-span-3">사용자</div>
                <div className="col-span-2">이메일</div>
                <div className="col-span-2">가입일</div>
                <div className="col-span-1">플랜</div>
                <div className="col-span-1">세션 수</div>
                <div className="col-span-2">마지막 활동</div>
                <div className="col-span-1 text-right">액션</div>
              </div>

              {/* Rows */}
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* User */}
                  <div className="md:col-span-3 flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                        {user.nickname[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{user.nickname}</div>
                      {user.is_admin && (
                        <Badge variant="destructive" className="text-xs">
                          관리자
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2 flex items-center text-sm text-muted-foreground truncate">
                    {user.email || '익명'}
                  </div>

                  {/* Created Date */}
                  <div className="md:col-span-2 flex items-center text-sm">
                    {new Date(user.created_at).toLocaleDateString('ko-KR')}
                  </div>

                  {/* Plan */}
                  <div className="md:col-span-1 flex items-center">
                    <Badge variant="secondary">Free</Badge>
                  </div>

                  {/* Session Count */}
                  <div className="md:col-span-1 flex items-center text-sm">
                    {user.session_count || 0}
                  </div>

                  {/* Last Activity */}
                  <div className="md:col-span-2 flex items-center text-sm text-muted-foreground">
                    {user.last_activity
                      ? new Date(user.last_activity).toLocaleDateString('ko-KR')
                      : '없음'}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangePlan(user.id)}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          플랜 변경
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleBanUser(user.id)}
                          className="text-red-600"
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          정지
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {totalCount}개 중 {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalCount)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    이전
                  </Button>
                  <div className="text-sm">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    다음
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
