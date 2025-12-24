'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreVertical, Eye, Power, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Session, AppType } from '@/types/database';

interface SessionTableProps {
  sessions?: Array<
    Session & {
      host_name: string;
      participant_count: number;
    }
  >;
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export function SessionTable({
  sessions = [],
  isLoading = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}: SessionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAppType, setFilterAppType] = useState<AppType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended'>('all');

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAppType = filterAppType === 'all' || session.app_type === filterAppType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && session.is_active) ||
      (filterStatus === 'ended' && !session.is_active);

    return matchesSearch && matchesAppType && matchesStatus;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewSession = (sessionId: string) => {
    window.location.href = `/admin/sessions/${sessionId}`;
  };

  const handleForceEnd = (sessionId: string) => {
    // TODO: Implement force end with confirmation
    console.log('Force end session:', sessionId);
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
        <div className="flex items-center justify-between mb-4">
          <CardTitle>세션 목록 ({totalCount})</CardTitle>
        </div>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="세션명 또는 코드로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filterAppType}
            onValueChange={(value) => setFilterAppType(value as AppType | 'all')}
          >
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="앱 종류" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 앱</SelectItem>
              <SelectItem value="live-voting">실시간 투표</SelectItem>
              <SelectItem value="audience-engage">청중 참여</SelectItem>
              <SelectItem value="group-order">공동 주문</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(value) => setFilterStatus(value as 'all' | 'active' | 'ended')}
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="ended">종료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || filterAppType !== 'all' || filterStatus !== 'all'
              ? '검색 결과가 없습니다'
              : '세션이 없습니다'}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="space-y-2">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                <div className="col-span-3">세션명</div>
                <div className="col-span-2">호스트</div>
                <div className="col-span-2">앱 종류</div>
                <div className="col-span-2">생성일</div>
                <div className="col-span-1">참여자</div>
                <div className="col-span-1">상태</div>
                <div className="col-span-1 text-right">액션</div>
              </div>

              {/* Rows */}
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* Session Name */}
                  <div className="md:col-span-3 flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{session.title}</div>
                      <code className="text-xs text-muted-foreground">{session.code}</code>
                    </div>
                  </div>

                  {/* Host */}
                  <div className="md:col-span-2 flex items-center text-sm">
                    {session.host_name || '알 수 없음'}
                  </div>

                  {/* App Type */}
                  <div className="md:col-span-2 flex items-center text-sm text-muted-foreground">
                    {session.app_type}
                  </div>

                  {/* Created Date */}
                  <div className="md:col-span-2 flex items-center text-sm">
                    {new Date(session.created_at).toLocaleDateString('ko-KR')}
                  </div>

                  {/* Participant Count */}
                  <div className="md:col-span-1 flex items-center text-sm">
                    {session.participant_count || 0}명
                  </div>

                  {/* Status */}
                  <div className="md:col-span-1 flex items-center">
                    <Badge variant={session.is_active ? 'default' : 'secondary'}>
                      {session.is_active ? '활성' : '종료'}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => handleViewSession(session.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </DropdownMenuItem>
                        {session.is_active && (
                          <DropdownMenuItem
                            onClick={() => handleForceEnd(session.id)}
                            className="text-red-600"
                          >
                            <Power className="w-4 h-4 mr-2" />
                            강제 종료
                          </DropdownMenuItem>
                        )}
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
